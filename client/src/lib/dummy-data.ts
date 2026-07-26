export const stats = {
  totalCrimes: 24856,
  todayCrimes: 47,
  activeCases: 3821,
  repeatOffenders: 612,
  highRiskDistricts: 8,
  solvedCases: 18234,
};

export const crimeByMonth = [
  { month: "Jan", crimes: 1820, solved: 1240 },
  { month: "Feb", crimes: 1650, solved: 1180 },
  { month: "Mar", crimes: 1920, solved: 1390 },
  { month: "Apr", crimes: 2140, solved: 1520 },
  { month: "May", crimes: 2380, solved: 1710 },
  { month: "Jun", crimes: 2210, solved: 1640 },
  { month: "Jul", crimes: 2540, solved: 1880 },
  { month: "Aug", crimes: 2310, solved: 1720 },
  { month: "Sep", crimes: 2180, solved: 1610 },
  { month: "Oct", crimes: 2420, solved: 1790 },
  { month: "Nov", crimes: 2290, solved: 1680 },
  { month: "Dec", crimes: 1996, solved: 1474 },
];

export const crimeByCategory = [
  { name: "Theft", value: 6420, color: "oklch(0.68 0.16 240)" },
  { name: "Assault", value: 3810, color: "oklch(0.65 0.23 25)" },
  { name: "Fraud", value: 4290, color: "oklch(0.78 0.16 80)" },
  { name: "Burglary", value: 2980, color: "oklch(0.72 0.17 155)" },
  { name: "Cybercrime", value: 3540, color: "oklch(0.72 0.19 305)" },
  { name: "Narcotics", value: 2120, color: "oklch(0.72 0.13 220)" },
  { name: "Others", value: 1696, color: "oklch(0.6 0.05 250)" },
];

export const crimeTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  incidents: 40 + Math.round(Math.sin(i / 3) * 15 + Math.random() * 20),
  arrests: 25 + Math.round(Math.cos(i / 4) * 10 + Math.random() * 12),
}));

export const hotspots = [
  { district: "Bengaluru City", crimes: 4820, risk: "critical" },
  { district: "Mysuru", crimes: 2140, risk: "high" },
  { district: "Mangaluru", crimes: 1890, risk: "high" },
  { district: "Hubballi-Dharwad", crimes: 1720, risk: "medium" },
  { district: "Belagavi", crimes: 1560, risk: "medium" },
  { district: "Kalaburagi", crimes: 1340, risk: "medium" },
  { district: "Davanagere", crimes: 980, risk: "low" },
  { district: "Shivamogga", crimes: 820, risk: "low" },
];

// Karnataka geographic hotspots [lat, lng, intensity, name, cases]
export const mapHotspots: Array<[number, number, number, string, number]> = [
  [12.9716, 77.5946, 0.95, "Bengaluru Central", 1820],
  [12.9352, 77.6245, 0.88, "Koramangala", 1240],
  [13.0827, 77.5877, 0.75, "Hebbal", 890],
  [12.9141, 74.856, 0.72, "Mangaluru", 1890],
  [12.2958, 76.6394, 0.8, "Mysuru", 2140],
  [15.3647, 75.124, 0.65, "Hubballi", 1720],
  [15.8497, 74.4977, 0.6, "Belagavi", 1560],
  [17.3297, 76.8343, 0.58, "Kalaburagi", 1340],
  [14.4644, 75.9218, 0.42, "Davanagere", 980],
  [13.9299, 75.5681, 0.38, "Shivamogga", 820],
  [12.4996, 74.9869, 0.5, "Udupi", 640],
  [13.3409, 74.7421, 0.35, "Kundapura", 410],
  [12.4218, 75.7398, 0.32, "Madikeri", 380],
  [16.2076, 77.3463, 0.55, "Raichur", 890],
  [15.1394, 76.9214, 0.48, "Ballari", 1120],
];

export const networkNodes = [
  { id: "n1", label: "Ravi K.", type: "kingpin", x: 400, y: 200 },
  { id: "n2", label: "Suresh M.", type: "member", x: 260, y: 120 },
  { id: "n3", label: "Anil P.", type: "member", x: 560, y: 130 },
  { id: "n4", label: "Vikram S.", type: "member", x: 200, y: 280 },
  { id: "n5", label: "Deepak R.", type: "member", x: 620, y: 290 },
  { id: "n6", label: "Manoj T.", type: "associate", x: 120, y: 200 },
  { id: "n7", label: "Kiran B.", type: "associate", x: 700, y: 200 },
  { id: "n8", label: "Rahul N.", type: "associate", x: 380, y: 380 },
  { id: "n9", label: "Ganesh V.", type: "informant", x: 480, y: 60 },
  { id: "n10", label: "Prakash L.", type: "member", x: 340, y: 60 },
];

export const networkEdges = [
  ["n1", "n2"], ["n1", "n3"], ["n1", "n4"], ["n1", "n5"], ["n1", "n8"],
  ["n2", "n6"], ["n2", "n10"], ["n3", "n7"], ["n3", "n9"],
  ["n4", "n6"], ["n5", "n7"], ["n8", "n5"], ["n9", "n10"],
];

export const predictions = [
  { area: "Bengaluru South", type: "Vehicle Theft", probability: 87, window: "Next 48h" },
  { area: "Mysuru Central", type: "Chain Snatching", probability: 74, window: "Next 72h" },
  { area: "Mangaluru Port", type: "Narcotics Trafficking", probability: 69, window: "Next 5 days" },
  { area: "Hubballi Market", type: "Pickpocketing", probability: 63, window: "Weekend" },
  { area: "Belagavi Highway", type: "Robbery", probability: 58, window: "Next 7 days" },
  { area: "Kalaburagi Rural", type: "Burglary", probability: 52, window: "Next 10 days" },
];

export const reports = [
  { id: "FIR-2026-08421", title: "Monthly Crime Statistics — July 2026", type: "Statistical", date: "2026-07-25", status: "Published" },
  { id: "FIR-2026-08420", title: "Cybercrime Trend Analysis Q2", type: "Analytical", date: "2026-07-24", status: "Published" },
  { id: "FIR-2026-08419", title: "Bengaluru District Threat Assessment", type: "Threat", date: "2026-07-22", status: "Draft" },
  { id: "FIR-2026-08418", title: "Repeat Offender Watchlist Update", type: "Watchlist", date: "2026-07-20", status: "Published" },
  { id: "FIR-2026-08417", title: "Narcotics Network Investigation Summary", type: "Investigation", date: "2026-07-18", status: "Confidential" },
  { id: "FIR-2026-08416", title: "AI Prediction Model Accuracy Review", type: "Technical", date: "2026-07-15", status: "Published" },
];

export const notifications = [
  { id: 1, title: "High-priority alert", desc: "Chain snatching reported in Jayanagar", time: "2m ago", level: "critical" },
  { id: 2, title: "AI Prediction", desc: "87% risk of vehicle theft in Bengaluru South", time: "18m ago", level: "warning" },
  { id: 3, title: "Case update", desc: "FIR-2026-08419 assigned to Insp. Rao", time: "1h ago", level: "info" },
  { id: 4, title: "Suspect flagged", desc: "Repeat offender spotted near KR Market", time: "3h ago", level: "warning" },
  { id: 5, title: "Report published", desc: "Monthly crime statistics for July 2026", time: "5h ago", level: "info" },
];
