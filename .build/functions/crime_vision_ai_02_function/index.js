'use strict';
const express = require('express');
const catalyst = require('zcatalyst-sdk-node');

const app = express();
app.use(express.json());

// Enable CORS for local testing
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// GET /server/crime_vision_ai_02_function/crimes-by-district
app.get('/crimes-by-district', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        
        // ZCQL query to join CaseMaster and District to count crimes
        const zcql = catalystApp.zcql();
        const query = `
            SELECT District.DistrictName, COUNT(CaseMaster.CaseMasterID) AS TotalCrimes, District.lat, District.lng 
            FROM CaseMaster 
            JOIN District ON CaseMaster.PoliceStationID = District.DistrictID 
            GROUP BY District.DistrictName, District.lat, District.lng
        `;
        
        const result = await zcql.executeZCQLQuery(query);
        
        // Format the response for the frontend map component
        const formattedData = result.map(row => ({
            name: row.District.DistrictName,
            lat: row.District.lat,
            lng: row.District.lng,
            crimeCount: parseInt(row.CaseMaster.TotalCrimes || 0)
        }));
        
        res.status(200).json({
            status: 'success',
            data: formattedData
        });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch district crime data.',
            details: error.toString()
        });
    }
});

// GET /server/crime_vision_ai_02_function/network-graph
app.get('/network-graph', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        
        // Fetch all Accused and their associated Cases
        const query = `SELECT Accused.AccusedName, Accused.AccusedMasterID, CaseMaster.CaseMasterID, CaseMaster.CrimeNo 
                       FROM Accused 
                       JOIN CaseMaster ON Accused.CaseMasterID = CaseMaster.CaseMasterID`;
                       
        const result = await zcql.executeZCQLQuery(query);
        
        let nodes = [];
        let links = [];
        let addedNodes = new Set();
        
        result.forEach(row => {
            const accusedId = "A_" + row.Accused.AccusedMasterID;
            const caseId = "C_" + row.CaseMaster.CaseMasterID;
            
            // Add Accused Node
            if (!addedNodes.has(accusedId)) {
                nodes.push({ id: accusedId, group: "Accused", name: row.Accused.AccusedName });
                addedNodes.add(accusedId);
            }
            
            // Add Case Node
            if (!addedNodes.has(caseId)) {
                nodes.push({ id: caseId, group: "Case", name: "FIR: " + (row.CaseMaster.CrimeNo || row.CaseMaster.CaseMasterID) });
                addedNodes.add(caseId);
            }
            
            // Add Link
            links.push({ source: accusedId, target: caseId, value: 1 });
        });
        
        res.status(200).json({ status: 'success', data: { nodes, links } });
    } catch (error) {
        console.error("Network Graph Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch network graph data.' });
    }
});

// GET /server/crime_vision_ai_02_function/demographic-stats
app.get('/demographic-stats', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        // Fetch AgeYear and GenderID from Accused table
        const result = await zcql.executeZCQLQuery(
            `SELECT Accused.AgeYear, Accused.GenderID FROM Accused`
        );

        // Age band aggregation
        const ageBands = { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
        const genderCount = { 'Male': 0, 'Female': 0, 'Other': 0 };

        result.forEach(row => {
            const age = parseInt(row.Accused.AgeYear || 0);
            const gender = parseInt(row.Accused.GenderID || 0);

            if (age <= 18) ageBands['0-18']++;
            else if (age <= 30) ageBands['19-30']++;
            else if (age <= 45) ageBands['31-45']++;
            else if (age <= 60) ageBands['46-60']++;
            else ageBands['60+']++;

            if (gender === 1) genderCount['Male']++;
            else if (gender === 2) genderCount['Female']++;
            else genderCount['Other']++;
        });

        const ageData = Object.entries(ageBands).map(([band, count]) => ({ band, count }));
        const genderData = Object.entries(genderCount).map(([name, value]) => ({ name, value }));

        res.status(200).json({ status: 'success', data: { ageData, genderData, total: result.length } });
    } catch (error) {
        console.error("Demographic Stats Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch demographic data.' });
    }
});

// GET /server/crime_vision_ai_02_function/anomalies
app.get('/anomalies', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        const result = await zcql.executeZCQLQuery(
            `SELECT CaseMaster.PoliceStationID, CaseMaster.CrimeMajorHeadID, CaseMaster.CrimeRegisteredDate FROM CaseMaster`
        );

        const crimeHeadLabel = { 1: 'Robbery', 2: 'Theft', 3: 'Assault', 4: 'Fraud', 5: 'Cybercrime' };
        const districtLabel = { 1: 'Bengaluru Urban', 2: 'Mysuru', 3: 'Hubballi-Dharwad', 4: 'Mangaluru', 5: 'Belagavi', 6: 'Kalaburagi', 7: 'Davanagere', 8: 'Ballari' };

        // Build monthly time series per district (aggregated across crime types for density)
        // Structure: { "districtId": { "2023-10": count, ... } }
        const districtMonthly = {};
        let hasCrimeHead = false;

        result.forEach(row => {
            const stationId = parseInt(row.CaseMaster.PoliceStationID || 0);
            const districtId = Math.floor(stationId / 10);
            if (districtId < 1 || districtId > 8) return;

            const dateStr = row.CaseMaster.CrimeRegisteredDate;
            if (!dateStr) return;
            // Normalize: Catalyst may return "2025-04-22", "2025-04-22 00:00:00", or "2025-04-22T00:00:00.000Z"
            const normalized = String(dateStr).replace(' ', 'T').split('T')[0]; // Always extract YYYY-MM-DD part
            if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return; // Skip if not parseable
            const [year, month] = normalized.split('-');
            const monthKey = `${year}-${month}`; // Direct extraction — no Date() object needed, avoids TZ issues

            if (!districtMonthly[districtId]) districtMonthly[districtId] = {};
            districtMonthly[districtId][monthKey] = (districtMonthly[districtId][monthKey] || 0) + 1;

            if (row.CaseMaster.CrimeMajorHeadID) hasCrimeHead = true;
        });

        // For each district, compute Z-score against its OWN monthly baseline (1.5σ threshold)
        const anomalies = [];
        const seen = new Set(); // Deduplicate: keep worst month per district

        Object.entries(districtMonthly).forEach(([districtId, monthCounts]) => {
            const months = Object.keys(monthCounts).sort();
            if (months.length < 4) return; // Need enough history for meaningful stats

            const counts = months.map(m => monthCounts[m]);
            const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
            const variance = counts.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / counts.length;
            const stddev = Math.sqrt(variance) || 1;
            const threshold = mean + 1.5 * stddev; // 1.5σ — statistically standard

            months.forEach((month, i) => {
                const count = counts[i];
                if (count <= threshold) return;

                const district = districtLabel[parseInt(districtId)] || `District ${districtId}`;
                const zScore = parseFloat(((count - mean) / stddev).toFixed(2));
                const pctAbove = parseFloat((((count - mean) / mean) * 100).toFixed(0));
                const dedupeKey = `${districtId}`;

                // Keep only the most anomalous month per district
                const existing = anomalies.findIndex(a => a._key === dedupeKey);
                const entry = {
                    _key: dedupeKey,
                    district,
                    crime: 'All Crime Types',
                    month,
                    count,
                    mean: mean.toFixed(1),
                    stddev: stddev.toFixed(1),
                    zScore,
                    pctAbove,
                    severity: zScore > 2.5 ? 'Critical' : 'High',
                    description: `${district} — ${month} had ${count} cases vs monthly average of ${mean.toFixed(1)} (Z=${zScore}, ${pctAbove}% above baseline)`
                };

                if (existing === -1) anomalies.push(entry);
                else if (zScore > anomalies[existing].zScore) anomalies[existing] = entry;
            });
        });

        // Clean up internal key and sort by z-score
        const clean = anomalies
            .map(({ _key, ...rest }) => rest)
            .sort((a, b) => b.zScore - a.zScore);

        res.status(200).json({ status: 'success', data: clean });
    } catch (error) {
        console.error("Anomalies Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch anomaly data.' });
    }
});

// Helper: Simple OLS Linear Regression — returns { slope, intercept, rSquared }
function linearRegression(xArr, yArr) {
    const n = xArr.length;
    const xMean = xArr.reduce((a, b) => a + b, 0) / n;
    const yMean = yArr.reduce((a, b) => a + b, 0) / n;
    const ssXY = xArr.reduce((s, x, i) => s + (x - xMean) * (yArr[i] - yMean), 0);
    const ssXX = xArr.reduce((s, x) => s + Math.pow(x - xMean, 2), 0);
    const slope = ssXX === 0 ? 0 : ssXY / ssXX;
    const intercept = yMean - slope * xMean;
    // R-squared
    const ssTot = yArr.reduce((s, y) => s + Math.pow(y - yMean, 2), 0);
    const ssRes = yArr.reduce((s, y, i) => s + Math.pow(y - (slope * xArr[i] + intercept), 2), 0);
    const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
    return { slope, intercept, rSquared };
}

// GET /server/crime_vision_ai_02_function/forecast
app.get('/forecast', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        // Fetch monthly crime counts across all districts
        const result = await zcql.executeZCQLQuery(
            `SELECT CaseMaster.CrimeRegisteredDate FROM CaseMaster`
        );

        // Aggregate by year-month
        const monthlyCounts = {};
        result.forEach(row => {
            const dateStr = row.CaseMaster.CrimeRegisteredDate;
            if (!dateStr) return;
            const normalized = String(dateStr).replace(' ', 'T').split('T')[0];
            if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return;
            const [year, month] = normalized.split('-');
            const key = `${year}-${month}`;
            monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        });

        // Sort keys chronologically
        const sortedKeys = Object.keys(monthlyCounts).sort();
        const historicalData = sortedKeys.map((month, idx) => ({
            month, count: monthlyCounts[month], idx
        }));

        let predicted = null;
        let method = 'linear_regression';

        if (historicalData.length >= 3) {
            const xArr = historicalData.map(d => d.idx);
            const yArr = historicalData.map(d => d.count);
            const { slope, intercept, rSquared } = linearRegression(xArr, yArr);

            const nextIdx = historicalData.length;
            // If R² < 0.3, regression line is unreliable — use moving average of last 3 months as fallback
            if (rSquared < 0.3) {
                method = 'moving_average';
                const last3 = yArr.slice(-3);
                predicted = Math.round(last3.reduce((a, b) => a + b, 0) / last3.length);
            } else {
                predicted = Math.round(slope * nextIdx + intercept);
            }

            // Compute next month label
            const lastDate = new Date(sortedKeys[sortedKeys.length - 1] + '-01');
            lastDate.setMonth(lastDate.getMonth() + 1);
            const nextMonth = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;

            res.status(200).json({
                status: 'success',
                method,
                data: { historical: historicalData, predicted: { month: nextMonth, count: predicted, isForecast: true } }
            });
        } else {
            res.status(200).json({ status: 'success', method: 'insufficient_data', data: { historical: historicalData, predicted: null } });
        }
    } catch (error) {
        console.error("Forecast Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to compute forecast.' });
    }
});

module.exports = app;
