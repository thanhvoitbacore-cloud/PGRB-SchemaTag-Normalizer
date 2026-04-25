import * as XLSX from 'xlsx';

export interface ProductAttributeRow {
    "Wayfair Listing": string;
    "Manufacturer Part Number ID": string;
    "Su Part Number": string;
    "stagid": string;
    "schema tag priority": string | number;
    "Tag Name": string;
    "Tag Value": string;
    "How to fill tag": string;
    // Keeping some extra fields for enrichment logic but they won't be in the final export if not needed
    "Tag Definition"?: string;
    "Input Type"?: string;
}

export const process1 = (workbook: XLSX.WorkBook): ProductAttributeRow[] => {
    let allResults: ProductAttributeRow[] = [];

    workbook.SheetNames.forEach(sheetName => {
        if (sheetName.toLowerCase() === "dropdownoptions" || sheetName.toLowerCase() === "wf-only-metadata") return;

        const worksheet = workbook.Sheets[sheetName];
        let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

        if (rows.length < 7) return;

        // --- TRANSPOSE LOGIC ---
        // Based on analysis of "Product Attributes" input file:
        // Index 2 (C) = Wayfair Listing (sku)
        // Index 3 (D) = Manufacturer Part Number
        // Index 4 (E) = Manufacturer Part Id
        // Index 5 (F) = Su Part Number (supplierPartNumber)
        // Index 7+ (H+) = Tags

        const tagStartCol = 7;
        const dataStartRow = 6; // Data starts at Row 7 (index 6)

        for (let i = dataStartRow; i < rows.length; i++) {
            const dataRow = rows[i];
            
            const wayfairListing = String(dataRow[2] || "").trim();
            const mfgPartId = String(dataRow[3] || "").trim(); // VBA uses index 3 for "Manufacturer Part Number ID"
            
            if (!wayfairListing || wayfairListing.toLowerCase().includes("possible options")) {
                continue;
            }

            for (let j = tagStartCol; j < rows[0].length; j++) {
                const tagValue = String(dataRow[j] || "").trim();
                if (tagValue === "") continue;

                const fullStagid = String(rows[0][j] || "").trim();
                const tagName = String(rows[3][j] || "").trim(); // Row 4 (index 3) is "Tag Name"
                
                // SKIP technical or empty columns
                if (!fullStagid || 
                    fullStagid.toLowerCase().includes("hash") || 
                    fullStagid.toLowerCase().includes("attributeswhy") ||
                    !tagName) {
                    if (fullStagid.toLowerCase().includes("attributeswhy")) break;
                    continue;
                }

                // Extract only the numeric part of the stagid if possible
                const normalizedStagid = fullStagid.split(':').pop()?.trim() || fullStagid;

                // VBA Process 1 keeps the full stagid
                const priority = rows[2][j] as string | number; // Row 3 (index 2) is "schema tag priority"
                const howToFill = String(rows[5][j] || "").trim(); // Row 6 (index 5) is "How to fill tag"

                allResults.push({
                    "Wayfair Listing": wayfairListing,
                    "Manufacturer Part Number ID": String(dataRow[4] || "").trim(), // Index 4 is Manufacturer Part Id
                    "Su Part Number": String(dataRow[5] || "").trim(), // Index 5 is Su Part Number
                    "stagid": normalizedStagid,
                    "schema tag priority": priority,
                    "Tag Name": tagName,
                    "Tag Value": tagValue,
                    "How to fill tag": howToFill
                });
            }
        }
    });

    return allResults;
};
