import pandas as pd

def check_extra_columns(file_path):
    df = pd.read_excel(file_path, sheet_name="167 - Area Rugs", header=None)
    row0 = df.iloc[0].tolist()
    row3 = df.iloc[3].tolist()
    
    print(f"Total Columns: {len(row0)}")
    for j in range(140, len(row0)):
        full_id = str(row0[j]) if not pd.isna(row0[j]) else ""
        name = str(row3[j]) if not pd.isna(row3[j]) else ""
        print(f"Index {j}: ID='{full_id}', Name='{name}'")

check_extra_columns("Product Attributes 2026-04-25 14-23-11.xlsx")
