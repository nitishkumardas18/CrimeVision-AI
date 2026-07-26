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

async function fetchAllRows(zcql, baseQuery) {
    let allRows = [];
    let offset = 1; 
    const limit = 200; // Safe limit
    
    while (true) {
        const paginatedQuery = `${baseQuery} LIMIT ${offset}, ${limit}`;
        const res = await zcql.executeZCQLQuery(paginatedQuery);
        if (res && res.length > 0) {
            allRows = allRows.concat(res);
            if (res.length < limit) break; // If less than limit, we reached the end
            offset += res.length; // Properly increment offset by actual rows returned
        } else {
            break;
        }
    }
    return allRows;
}

// GET /server/crime_vision_ai_02_function/crimes-by-district
app.get('/crimes-by-district', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        
        // Fetch District and CaseMaster separately using pagination helper
        const districtsRes = await fetchAllRows(zcql, 'SELECT DistrictID, DistrictName, lat, lng FROM District');
        const casesRes = await fetchAllRows(zcql, 'SELECT CaseMasterID, PoliceStationID FROM CaseMaster');
        
        // Map districts by ID
        const districtMap = {};
        districtsRes.forEach(row => {
            const dist = row.District;
            if (dist.DistrictID) {
                districtMap[dist.DistrictID] = {
                    name: dist.DistrictName,
                    lat: parseFloat(dist.lat),
                    lng: parseFloat(dist.lng),
                    crimeCount: 0
                };
            }
        });

        // Count cases by decoding DistrictID from PoliceStationID (e.g. 10 -> 1)
        casesRes.forEach(row => {
            const stationId = parseInt(row.CaseMaster.PoliceStationID || 0, 10);
            if (stationId > 0) {
                const distId = Math.floor(stationId / 10);
                if (districtMap[distId]) {
                    districtMap[distId].crimeCount++;
                }
            }
        });

        const formattedData = Object.values(districtMap);
        
        res.status(200).json({ status: 'success', data: formattedData });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/network-graph
app.get('/network-graph', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        
        // Fetch Accused and CaseMaster separately using pagination helper
        const casesRes = await fetchAllRows(zcql, 'SELECT CaseMasterID, CrimeNo FROM CaseMaster');
        const accusedRes = await fetchAllRows(zcql, 'SELECT AccusedMasterID, AccusedName, CaseMasterID FROM Accused');
        
        const nodesMap = {};
        const links = [];

        // Add Cases to nodes
        casesRes.forEach(row => {
            const crime = row.CaseMaster;
            if (crime.CaseMasterID) {
                const nodeId = `C_${crime.CaseMasterID}`;
                nodesMap[nodeId] = { id: nodeId, group: "Case", name: `FIR: ${crime.CrimeNo}` };
            }
        });

        // Add Accused to nodes and create links
        accusedRes.forEach(row => {
            const acc = row.Accused;
            if (acc.AccusedMasterID) {
                const accNodeId = `A_${acc.AccusedMasterID}`;
                nodesMap[accNodeId] = { id: accNodeId, group: "Accused", name: acc.AccusedName || `Accused ${acc.AccusedMasterID}` };
                
                if (acc.CaseMasterID) {
                    const caseNodeId = `C_${acc.CaseMasterID}`;
                    if (nodesMap[caseNodeId]) {
                        links.push({ source: accNodeId, target: caseNodeId, value: 1 });
                    }
                }
            }
        });

        const nodes = Object.values(nodesMap);
        res.status(200).json({ status: 'success', data: { nodes, links } });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/demographic-stats
app.get('/demographic-stats', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        // Fetch AgeYear and GenderID from Accused table
        const result = await fetchAllRows(zcql, 'SELECT Accused.AgeYear, Accused.GenderID FROM Accused');

        const demographicStats = {
            ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-60': 0, '60+': 0 },
            gender: { 'Male': 0, 'Female': 0, 'Other': 0 }
        };

        result.forEach(row => {
            const acc = row.Accused;
            if (acc.AgeYear) {
                const age = parseInt(acc.AgeYear, 10);
                if (age >= 18 && age <= 25) demographicStats.ageGroups['18-25']++;
                else if (age >= 26 && age <= 35) demographicStats.ageGroups['26-35']++;
                else if (age >= 36 && age <= 45) demographicStats.ageGroups['36-45']++;
                else if (age >= 46 && age <= 60) demographicStats.ageGroups['46-60']++;
                else if (age > 60) demographicStats.ageGroups['60+']++;
            }

            const genderId = acc.GenderID;
            if (genderId === '1' || genderId === 1) demographicStats.gender['Male']++;
            else if (genderId === '2' || genderId === 2) demographicStats.gender['Female']++;
            else if (genderId === '3' || genderId === 3) demographicStats.gender['Other']++;
        });
        
        const ageData = Object.entries(demographicStats.ageGroups).map(([band, count]) => ({ band, count }));
        const genderData = Object.entries(demographicStats.gender).map(([name, value]) => ({ name, value }));

        res.status(200).json({ status: 'success', data: { ageData, genderData, total: result.length } });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/anomalies
app.get('/anomalies', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        // Fetch PoliceStationID and CrimeMajorHeadID using pagination helper
        const result = await fetchAllRows(zcql, 'SELECT CaseMaster.PoliceStationID, CaseMaster.CrimeRegisteredDate, CaseMaster.CrimeMajorHeadID FROM CaseMaster');

        const crimeHeadLabel = { 1: 'Violent', 2: 'Property', 3: 'Hurt', 4: 'Fraud', 5: 'Other' };
        const anomalyMap = {};

        result.forEach(row => {
            const crime = row.CaseMaster;
            if (crime.PoliceStationID && crime.CrimeMajorHeadID) {
                const districtId = Math.floor(crime.PoliceStationID / 10);
                const headId = parseInt(crime.CrimeMajorHeadID, 10);
                const headName = crimeHeadLabel[headId] || 'Other';
                
                if (districtId && headName) {
                    const key = `${districtId}_${headName}`;
                    if (!anomalyMap[key]) {
                        anomalyMap[key] = { districtId: districtId.toString(), crimeHead: headName, count: 0 };
                    }
                    anomalyMap[key].count += 1;
                }
            }
        });

        let anomalies = Object.values(anomalyMap)
            .filter(a => a.count > 15)
            .map(a => ({
                description: `High number of ${a.crimeHead} cases detected in District ${a.districtId}`,
                severity: a.count > 30 ? 'High' : 'Medium',
                count: a.count
            }));

        res.status(200).json({ status: 'success', data: anomalies });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/trends
app.get('/trends', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();

        const result = await fetchAllRows(zcql, 'SELECT CaseMaster.CrimeRegisteredDate FROM CaseMaster');

        const monthlyCounts = {};
        result.forEach(row => {
            const dateStr = row.CaseMaster.CrimeRegisteredDate;
            if (dateStr) {
                // assume 'yyyy-mm-dd'
                const parts = dateStr.split('-');
                if (parts.length >= 2) {
                    const ym = `${parts[0]}-${parts[1]}`;
                    monthlyCounts[ym] = (monthlyCounts[ym] || 0) + 1;
                }
            }
        });

        const data = Object.entries(monthlyCounts)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, crimeCount]) => ({ month, crimeCount }));

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error("ZCQL Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/wipe
app.get('/wipe', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const zcql = catalystApp.zcql();
        const datastore = catalystApp.datastore();

        async function wipeTable(tableName) {
            const result = await fetchAllRows(zcql, `SELECT ROWID FROM ${tableName}`);
            const rowIds = result.map(r => r[tableName].ROWID);
            const table = datastore.table(tableName);
            
            // Delete in batches of 200 concurrently
            const promises = [];
            for (let i = 0; i < rowIds.length; i += 200) {
                const batch = rowIds.slice(i, i + 200);
                promises.push(table.deleteRows(batch));
            }
            // Execute in chunks to avoid overwhelming the database connections
            for (let i = 0; i < promises.length; i += 10) {
                await Promise.all(promises.slice(i, i + 10));
            }
            return rowIds.length;
        }

        const dCount = await wipeTable('District');
        const cCount = await wipeTable('CaseMaster');
        const aCount = await wipeTable('Accused');
        
        res.status(200).json({ status: 'success', message: `Wiped ${dCount} Districts, ${cCount} Cases, ${aCount} Accused` });
    } catch (error) {
        console.error("Wipe Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

// GET /server/crime_vision_ai_02_function/seed
app.get('/seed', async (req, res) => {
    try {
        const catalystApp = catalyst.initialize(req);
        const datastore = catalystApp.datastore();
        const fs = require('fs');
        const path = require('path');

        function parseCSV(content) {
            const lines = content.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            return lines.slice(1).map(line => {
                const values = line.split(',');
                const obj = {};
                headers.forEach((header, i) => {
                    if (values[i] !== undefined) {
                        let val = values[i].trim();
                        // Catalyst requires numbers for BIGINT, FLOAT columns
                        if (header === 'CaseMasterID' || header === 'CrimeNo' || header === 'CrimeMajorHeadID' || header === 'PoliceStationID' || header === 'AccusedMasterID' || header === 'AgeYear') {
                            val = parseInt(val, 10);
                        }
                        if (header === 'lat' || header === 'lng') {
                            val = parseFloat(val);
                        }
                        obj[header] = val;
                    }
                });
                return obj;
            });
        }

        async function insertData(tableName, filePath) {
            const csvContent = fs.readFileSync(filePath, 'utf8');
            const rows = parseCSV(csvContent);
            const table = datastore.table(tableName);
            
            const batchSize = 100;
            for (let i = 0; i < rows.length; i += batchSize) {
                const batch = rows.slice(i, i + batchSize);
                await table.insertRows(batch);
            }
            return rows.length;
        }

        const districtPath = path.join(__dirname, 'synthetic_data', 'District_clean.csv');
        const casePath = path.join(__dirname, 'synthetic_data', 'CaseMaster_clean.csv');
        const accusedPath = path.join(__dirname, 'synthetic_data', 'Accused_clean.csv');
        
        const dCount = await insertData('District', districtPath);
        const cCount = await insertData('CaseMaster', casePath);
        const aCount = await insertData('Accused', accusedPath);
        
        res.status(200).json({ status: 'success', message: `Inserted ${dCount} Districts, ${cCount} Cases, ${aCount} Accused` });
    } catch (error) {
        console.error("Seed Error:", error);
        res.status(400).json({ status: 'error', message: error.toString() });
    }
});

module.exports = app;
