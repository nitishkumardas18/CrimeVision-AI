import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
import os

# Initialize Faker for Indian context
fake = Faker('en_IN')

# Karnataka Districts and approximate Coordinates
districts = [
    {"DistrictID": 1, "DistrictName": "Bengaluru Urban", "lat": 12.9716, "lng": 77.5946},
    {"DistrictID": 2, "DistrictName": "Mysuru", "lat": 12.2958, "lng": 76.6394},
    {"DistrictID": 3, "DistrictName": "Hubballi-Dharwad", "lat": 15.3647, "lng": 75.1240},
    {"DistrictID": 4, "DistrictName": "Mangaluru", "lat": 12.9141, "lng": 74.8560},
    {"DistrictID": 5, "DistrictName": "Belagavi", "lat": 15.8497, "lng": 74.4977},
    {"DistrictID": 6, "DistrictName": "Kalaburagi", "lat": 17.3297, "lng": 76.8343},
    {"DistrictID": 7, "DistrictName": "Davanagere", "lat": 14.4644, "lng": 75.9218},
    {"DistrictID": 8, "DistrictName": "Ballari", "lat": 15.1394, "lng": 76.9214},
]

# Create CaseMaster (500 records)
num_cases = 500
cases = []
start_date = datetime(2023, 1, 1)
end_date = datetime(2026, 7, 26)

for i in range(1, num_cases + 1):
    district = random.choice(districts)
    date_registered = fake.date_time_between(start_date=start_date, end_date=end_date)
    
    # Seasonal spike logic: increase Theft in October
    if date_registered.month == 10:
        crime_major_id = random.choices([1, 2, 3], weights=[0.1, 0.7, 0.2])[0] # 2 = Theft
    else:
        crime_major_id = random.randint(1, 5)
        
    cases.append({
        "CaseMasterID": i,
        "CrimeNo": f"1{district['DistrictID']:04d}0001{date_registered.year}{i:05d}",
        "CaseNo": f"{date_registered.year}{i:05d}",
        "CrimeRegisteredDate": date_registered.strftime('%Y-%m-%d'),
        "PolicePersonID": random.randint(1, 50),
        "PoliceStationID": district['DistrictID'] * 10 + random.randint(1, 5),
        "CaseCategoryID": random.randint(1, 3),
        "GravityOffenceID": random.randint(1, 2),
        "CrimeMajorHeadID": crime_major_id,
        "CaseStatusID": random.randint(1, 4),
        "IncidentFromDate": (date_registered - timedelta(days=random.randint(0, 5))).strftime('%Y-%m-%d %H:%M:%S'),
        "latitude": district['lat'] + random.uniform(-0.05, 0.05),
        "longitude": district['lng'] + random.uniform(-0.05, 0.05),
        "BriefFacts": fake.text(max_nb_chars=200)
    })

df_cases = pd.DataFrame(cases)

# Create Accused (with repeat offenders for Network Graph)
accused_list = []
repeat_offenders_ids = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010] 
repeat_offenders_names = [fake.name() for _ in range(10)]

accused_id = 1
for case in cases:
    num_accused = random.randint(1, 3)
    for _ in range(num_accused):
        is_repeat = random.random() < 0.15 # 15% chance of repeat offender
        if is_repeat:
            idx = random.randint(0, 9)
            master_id = repeat_offenders_ids[idx]
            name = repeat_offenders_names[idx]
        else:
            master_id = accused_id
            name = fake.name()
            accused_id += 1
            
        accused_list.append({
            "AccusedMasterID": master_id,
            "CaseMasterID": case["CaseMasterID"],
            "AccusedName": name,
            "AgeYear": random.randint(18, 65),
            "GenderID": random.choice([1, 2]), # 1: Male, 2: Female
            "PersonID": f"A{master_id}"
        })

df_accused = pd.DataFrame(accused_list)

# Export to CSV
os.makedirs("synthetic_data", exist_ok=True)
pd.DataFrame(districts).to_csv("synthetic_data/District.csv", index=False)
df_cases.to_csv("synthetic_data/CaseMaster.csv", index=False)
df_accused.to_csv("synthetic_data/Accused.csv", index=False)

print(f"Data generation complete! Generated {len(df_cases)} cases and {len(df_accused)} accused records (with repeat offenders).")
print("Check the 'synthetic_data' folder for CSVs.")
