import pandas as pd

def analyze_vba_result(file_path):
    xls = pd.ExcelFile(file_path)
    print(f"File: {file_path}")
    total_rows = 0
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        rows = len(df)
        print(f"Sheet: {sheet_name}, Rows: {rows}")
        if sheet_name.lower() == "combined":
            total_rows = rows
    print(f"TOTAL ROWS IN COMBINED: {total_rows}")

analyze_vba_result("Rug_VBA 2.xlsx")
