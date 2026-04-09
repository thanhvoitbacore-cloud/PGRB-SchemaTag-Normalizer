import * as XLSX from 'xlsx';

export interface ProductAttributeRow {
    "Manufacturer Part Id": string;
    "PrSKU (Wayfair Listing)": string;
    "SKU Type": string;
    "Manufacturer Part Number": string;
    "Supplier Partnumber": string;
    "Product Option": string;
    "Stagid": string;
    "Schema Tag Title": string;
    "Current schema_tag_value": string;
    "Schema tag priority": string | number;
    "Does schema show on site?": string;
    "Tag Definition": string;
    "How should the tags be filled in on the tool?": string;
    "Input Type": string;
}

export const process1 = (workbook: XLSX.WorkBook): ProductAttributeRow[] => {
    let allResults: ProductAttributeRow[] = [];

    workbook.SheetNames.forEach(sheetName => {
        if (sheetName.toLowerCase() === "dropdownoptions") return;

        const worksheet = workbook.Sheets[sheetName];
        let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

        if (rows.length < 5) return;

        // --- CLEANING LOGIC ---
        // Delete Rows 2, 5, 7 (1-indexed)
        if (rows.length >= 7) rows.splice(6, 1);
        if (rows.length >= 5) rows.splice(4, 1);
        if (rows.length >= 2) rows.splice(1, 1);

        // Delete Columns A, B, D, G
        rows = rows.map(row => {
            let newRow = [...row];
            if (newRow.length >= 7) newRow.splice(6, 1); // G
            if (newRow.length >= 4) newRow.splice(3, 1); // D
            if (newRow.length >= 2) newRow.splice(1, 1); // B
            if (newRow.length >= 1) newRow.splice(0, 1); // A
            return newRow;
        });

        // Trailing Truncation
        let lastColToKeep = rows[0].length;
        for (let j = 0; j < rows[0].length; j++) {
            if (String(rows[0][j]).trim().toLowerCase() === "attributeswhy") {
                lastColToKeep = j;
                break;
            }
        }
        rows = rows.map(row => row.slice(0, lastColToKeep));

        // --- TRANSPOSE LOGIC ---
        const tagStartCol = 3;
        const dataStartRow = 4;

        for (let i = dataStartRow; i < rows.length; i++) {
            const dataRow = rows[i];
            if (!dataRow[0] && !dataRow[1]) continue;

            for (let j = tagStartCol; j < rows[0].length; j++) {
                const tagValue = String(dataRow[j] || "").trim();
                if (tagValue === "") continue;

                const fullStagid = String(rows[0][j] || "");
                const normalizedStagid = fullStagid.includes(":") 
                    ? fullStagid.split(":").pop()?.trim() || fullStagid
                    : fullStagid;

                allResults.push({
                    "Manufacturer Part Id": String(dataRow[1]),
                    "PrSKU (Wayfair Listing)": String(dataRow[0]),
                    "SKU Type": "",
                    "Manufacturer Part Number": "",
                    "Supplier Partnumber": String(dataRow[2]),
                    "Product Option": "",
                    "Stagid": normalizedStagid,
                    "Schema Tag Title": String(rows[2][j] || ""),
                    "Current schema_tag_value": tagValue,
                    "Schema tag priority": rows[1][j] as string | number,
                    "Does schema show on site?": "",
                    "Tag Definition": "",
                    "How should the tags be filled in on the tool?": String(rows[3][j] || ""),
                    "Input Type": ""
                });
            }
        }
    });

    return allResults;
};
