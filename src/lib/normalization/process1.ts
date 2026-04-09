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

        // --- TRANSPOSE LOGIC ---
        // Assuming original column structure where:
        // C (index 2) = PrSKU
        // D (index 3) = SKU Type
        // E (index 4) = Manufacturer Part Id
        // F (index 5) = Supplier Partnumber
        // G (index 6) = Manufacturer Part Number
        // H+ (index 7+) = Tags

        const tagStartCol = 7;
        const dataStartRow = 6; // Data starts after header rows (Original Row 7)

        for (let i = dataStartRow; i < rows.length; i++) {
            const dataRow = rows[i];
            
            // SKIP logic: 
            // 1. Skip if PrSKU (index 2) or Part Id (index 4) is empty
            // 2. Skip if PrSKU is "Possible Options" (template noise)
            const prSku = String(dataRow[2] || "").trim();
            const partId = String(dataRow[4] || "").trim();
            
            if (!prSku || !partId || prSku.toLowerCase().includes("possible options")) {
                continue;
            }

            for (let j = tagStartCol; j < rows[0].length; j++) {
                const tagValue = String(dataRow[j] || "").trim();
                if (tagValue === "") continue;

                const fullStagid = String(rows[0][j] || "");
                const normalizedStagid = fullStagid.includes(":") 
                    ? fullStagid.split(":").pop()?.trim() || fullStagid
                    : fullStagid;

                allResults.push({
                    "Manufacturer Part Id": String(dataRow[4] || ""),
                    "PrSKU (Wayfair Listing)": String(dataRow[2] || ""),
                    "SKU Type": String(dataRow[3] || ""),
                    "Manufacturer Part Number": String(dataRow[6] || ""),
                    "Supplier Partnumber": String(dataRow[5] || ""),
                    "Product Option": "",
                    "Stagid": normalizedStagid,
                    "Schema Tag Title": String(rows[3][j] || ""),
                    "Current schema_tag_value": tagValue,
                    "Schema tag priority": rows[2][j] as string | number,
                    "Does schema show on site?": "",
                    "Tag Definition": "",
                    "How should the tags be filled in on the tool?": String(rows[5][j] || ""),
                    "Input Type": ""
                });
            }
        }
    });

    return allResults;
};
