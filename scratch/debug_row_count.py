import pandas as pd
import numpy as np

def analyze_columns(file_path):
    xls = pd.ExcelFile(file_path)
    for sheet_name in xls.sheet_names:
        if sheet_name.lower() in ["dropdownoptions", "wf-only-metadata"]:
            continue
        df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
        row0 = df.iloc[0].tolist()
        row3 = df.iloc[3].tolist() # Tag Name
        
        tag_start = 7
        total_cols = len(row0)
        
        tags_found = 0
        skipped_no_id = 0
        skipped_no_name = 0
        skipped_hash = 0
        skipped_why = 0
        
        for j in range(tag_start, total_cols):
            full_id = str(row0[j]) if not pd.isna(row0[j]) else ""
            name = str(row3[j]) if not pd.isna(row3[j]) else ""
            
            if "attributeswhy" in full_id.lower():
                skipped_why = total_cols - j
                break
                
            if not full_id:
                skipped_no_id += 1
                continue
            if not name:
                skipped_no_name += 1
                continue
            if "hash" in full_id.lower():
                skipped_hash += 1
                continue
                
            tags_found += 1
            
        print(f"Sheet: {sheet_name}")
        print(f"  Total columns: {total_cols}")
        print(f"  Data rows (from 7): {len(df) - 6}")
        print(f"  Tags identified: {tags_found}")
        print(f"  Skipped (No ID): {skipped_no_id}")
        print(f"  Skipped (No Name): {skipped_no_name}")
        print(f"  Skipped (Hash): {skipped_hash}")
        print(f"  Skipped (Why and after): {skipped_why}")
        print(f"  Estimated Rows: {tags_found * (len(df) - 6)}")

analyze_columns("Product Attributes 2026-04-25 14-23-11.xlsx")
