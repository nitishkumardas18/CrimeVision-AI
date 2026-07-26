import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
import os

# Initialize Faker for Indian context
fake = Faker('en_IN')

# ─── DISTRICT WEIGHTS ──────────────────────────────────────────────────────────
# Source: CSV 646a37e6 (Crime in Karnataka 2023, IPC+SLL District-wise Totals)
# Bengaluru Urban = Bengaluru City Commissionerate (46,187) + Bengaluru District (6,992)
# Weights are proportional to each district's share of the 8-district crime pool (total: 90,779)
# Note: District weights use IPC+SLL combined denominator (90,779).
#       Crime-category weights use IPC-only denominator (148,648) — these are
#       applied INDEPENDENTLY (district pick then category pick), so no
#       cross-multiplication error occurs.
districts = [
    {"DistrictID": 1, "DistrictName": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946, "weight": 58},
    {"DistrictID": 2, "DistrictName": "Mysuru",          "lat": 12.2958, "lng": 76.6394, "weight": 10},
    {"DistrictID": 3, "DistrictName": "Hubballi-Dharwad","lat": 15.3647, "lng": 75.1240, "weight":  5},
    {"DistrictID": 4, "DistrictName": "Mangaluru",       "lat": 12.9141, "lng": 74.8560, "weight":  3},
    {"DistrictID": 5, "DistrictName": "Belagavi",        "lat": 15.8497, "lng": 74.4977, "weight":  9},
    {"DistrictID": 6, "DistrictName": "Kalaburagi",      "lat": 17.3297, "lng": 76.8343, "weight":  6},
    {"DistrictID": 7, "DistrictName": "Davanagere",      "lat": 14.4644, "lng": 75.9218, "weight":  5},
    {"DistrictID": 8, "DistrictName": "Ballari",         "lat": 15.1394, "lng": 76.9214, "weight":  4},
]
# Weights sum = 100 (Bengaluru Urban adjusted from 58.6% -> 58 to correct rounding)

district_objects = [d for d in districts]
district_weights  = [d["weight"] for d in districts]

# ─── CRIME CATEGORY WEIGHTS ────────────────────────────────────────────────────
# Source: CIK-2023-Combined.pdf (Karnataka SCRB official report)
# Scope: IPC crimes only (denominator = 148,648 IPC cases, PDF page 3)
# Cyber Crime (21,889) and Economic Fraud via IT Act are SLL — EXCLUDED from these
# weights. Category 4 is IPC-only Fraud/Cheating (FCF = 7,556 cases, 5.1%).
# Category 5 is the IPC remainder bucket — label in UI as "Other IPC Offences".
#
# CrimeMajorHeadID mapping:
#   1 = Violent (Murder 1404 + Robbery 1842 + Kidnap 4848 + Rape 827 + Riot 6297 = 15,397 → 10.4%)
#   2 = Property/Theft (Theft 24966 + Burglary 6035 + Vehicle Theft 13360 + Other 11606 = 55,967 → 37.7%)
#   3 = Hurt/Assault (25,823 → 17.4%)
#   4 = Fraud/Cheating IPC-only (FCF = 7,556 → 5.1%)
#   5 = Other IPC Offences — remainder bucket (43,905 → 29.5%)
CRIME_HEAD_WEIGHTS = [10, 38, 17, 5, 30]  # Rounded to sum=100; source: CIK-2023 SCRB

# October seasonal spike: Theft (ID=2) spikes during Dasara/Diwali festival season.
# Karnataka-specific: Dasara is Mysuru's signature festival (October), documented
# in SCRB reports as a period of elevated property crime. Logic retained as-is.

# ─── GENDER RATIO ──────────────────────────────────────────────────────────────
# Source: NCRB national average (~90% male accused in India).
# NOTE: This is an assumption — Karnataka-specific district CSVs in this dataset
# do not contain accused gender breakdown. Explicitly documented as national proxy.
GENDER_WEIGHTS = [0.90, 0.10]  # [Male (ID=1), Female (ID=2)]

# ─── DATA GENERATION ───────────────────────────────────────────────────────────
num_cases = 500
cases = []
start_date = datetime(2023, 1, 1)
end_date   = datetime(2026, 7, 26)

for i in range(1, num_cases + 1):
    district = random.choices(district_objects, weights=district_weights, k=1)[0]
    date_registered = fake.date_time_between(start_date=start_date, end_date=end_date)

    # Seasonal spike: October -> elevated Theft (Category 2) probability
    # Rationale: Dasara/Diwali festival season; Karnataka-specific pattern
    if date_registered.month == 10:
        crime_major_id = random.choices([1, 2, 3, 4, 5], weights=[0.05, 0.70, 0.10, 0.05, 0.10])[0]
    else:
        crime_major_id = random.choices([1, 2, 3, 4, 5], weights=CRIME_HEAD_WEIGHTS)[0]

    cases.append({
        "CaseMasterID":        i,
        "CrimeNo":             f"1{district['DistrictID']:04d}0001{date_registered.year}{i:05d}",
        "CaseNo":              f"{date_registered.year}{i:05d}",
        "CrimeRegisteredDate": date_registered.strftime('%Y-%m-%d'),
        "PolicePersonID":      random.randint(1, 50),
        "PoliceStationID":     district['DistrictID'] * 10 + random.randint(1, 5),
        "CaseCategoryID":      random.randint(1, 3),
        "GravityOffenceID":    random.randint(1, 2),
        "CrimeMajorHeadID":    crime_major_id,
        "CaseStatusID":        random.randint(1, 4),
        "IncidentFromDate":    (date_registered - timedelta(days=random.randint(0, 5))).strftime('%Y-%m-%d %H:%M:%S'),
        "latitude":            district['lat'] + random.uniform(-0.05, 0.05),
        "longitude":           district['lng'] + random.uniform(-0.05, 0.05),
        "BriefFacts":          fake.text(max_nb_chars=200),
    })

df_cases = pd.DataFrame(cases)

# ─── ACCUSED (repeat-offender logic unchanged) ─────────────────────────────────
accused_list = []
repeat_offenders_ids   = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]
repeat_offenders_names = [fake.name() for _ in range(10)]

accused_id = 1
for case in cases:
    num_accused = random.randint(1, 3)
    for _ in range(num_accused):
        is_repeat = random.random() < 0.15  # 15% chance of repeat offender
        if is_repeat:
            idx        = random.randint(0, 9)
            master_id  = repeat_offenders_ids[idx]
            name       = repeat_offenders_names[idx]
        else:
            master_id  = accused_id
            name       = fake.name()
            accused_id += 1

        accused_list.append({
            "AccusedMasterID": master_id,
            "CaseMasterID":    case["CaseMasterID"],
            "AccusedName":     name,
            "AgeYear":         random.randint(18, 65),
            # Gender ratio: NCRB national average (~90% male). See GENDER_WEIGHTS comment above.
            "GenderID":        random.choices([1, 2], weights=GENDER_WEIGHTS)[0],
            "PersonID":        f"A{master_id}",
        })

df_accused = pd.DataFrame(accused_list)

# ─── EXPORT ────────────────────────────────────────────────────────────────────
os.makedirs("synthetic_data", exist_ok=True)
pd.DataFrame([{k: v for k, v in d.items() if k != "weight"} for d in districts]).to_csv(
    "synthetic_data/District.csv", index=False
)
df_cases.to_csv("synthetic_data/CaseMaster.csv",   index=False)
df_accused.to_csv("synthetic_data/Accused.csv",    index=False)

print(f"Data generation complete!")
print(f"  Cases:   {len(df_cases):,}")
print(f"  Accused: {len(df_accused):,} (with repeat offenders)")
print()

# Sanity-check output proportions
print("District distribution (should match real weights approx):")
dist_counts = df_cases['PoliceStationID'].apply(lambda x: x // 10).value_counts().sort_index()
for did, cnt in dist_counts.items():
    dname = next(d['DistrictName'] for d in districts if d['DistrictID'] == did)
    real_w = next(d['weight'] for d in districts if d['DistrictID'] == did)
    print(f"  District {did} ({dname}): {cnt} cases ({cnt/len(df_cases)*100:.1f}%) | Real weight: {real_w}%")

print()
print("Crime category distribution (should match real weights approx):")
cat_counts = df_cases['CrimeMajorHeadID'].value_counts().sort_index()
cat_names  = {1:"Violent", 2:"Property/Theft", 3:"Hurt/Assault", 4:"Fraud/Cheating", 5:"Other IPC"}
real_cat_w = {1:10, 2:38, 3:17, 4:5, 5:30}
for cat_id, cnt in cat_counts.items():
    print(f"  Category {cat_id} ({cat_names[cat_id]}): {cnt} ({cnt/len(df_cases)*100:.1f}%) | Real: {real_cat_w[cat_id]}%")

print()
print("Gender ratio (accused):")
g = df_accused['GenderID'].value_counts()
total_acc = len(df_accused)
print(f"  Male   (ID=1): {g.get(1,0):,} ({g.get(1,0)/total_acc*100:.1f}%) | Expected: ~90%")
print(f"  Female (ID=2): {g.get(2,0):,} ({g.get(2,0)/total_acc*100:.1f}%) | Expected: ~10%")

print()
print("Check 'synthetic_data/' folder for CSVs.")
