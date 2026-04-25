import * as XLSX from 'xlsx';

export interface ProductAttributeRow {
    "Manufacturer Part Id": string;
    "PrSKU": string;
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
        if (sheetName.toLowerCase() === "dropdownoptions" || sheetName.toLowerCase() === "wf-only-metadata") return;

        const worksheet = workbook.Sheets[sheetName];
        let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

        if (rows.length < 7) return;

        const tagStartCol = 7;
        const dataStartRow = 6; // Data starts at Row 7 (index 6)

        for (let i = dataStartRow; i < rows.length; i++) {
            const dataRow = rows[i];
            
            const wayfairListing = String(dataRow[2] || "").trim();
            const supplierPartnumber = String(dataRow[5] || "").trim();
            
            if (!wayfairListing || wayfairListing.toLowerCase().includes("possible options")) {
                continue;
            }

            for (let j = tagStartCol; j < rows[0].length; j++) {
                const tagValue = String(dataRow[j] || "").trim();
                if (tagValue === "") continue;

                const fullStagid = String(rows[0][j] || "").trim();
                const tagName = String(rows[3][j] || "").trim(); // Row 4 (index 3) is "Tag Name"
                
                if (!fullStagid || 
                    fullStagid.toLowerCase().includes("hash") || 
                    fullStagid.toLowerCase().includes("attributeswhy") ||
                    !tagName) {
                    if (fullStagid.toLowerCase().includes("attributeswhy")) break;
                    continue;
                }

                // Extract only the numeric part of the stagid
                const normalizedStagid = fullStagid.split(':').pop()?.trim() || fullStagid;
                const priority = rows[2][j] as string | number; // Row 3 (index 2) is "schema tag priority"
                const originalHowToFill = String(rows[5][j] || "").trim(); // Row 6 (index 5)

                allResults.push({
                    "Manufacturer Part Id": "",
                    "PrSKU": wayfairListing,
                    "SKU Type": "",
                    "Manufacturer Part Number": "",
                    "Supplier Partnumber": supplierPartnumber,
                    "Product Option": "",
                    "Stagid": normalizedStagid,
                    "Schema Tag Title": tagName,
                    "Current schema_tag_value": tagValue,
                    "Schema tag priority": priority,
                    "Does schema show on site?": "",
                    "Tag Definition": "", // To be enriched
                    "How should the tags be filled in on the tool?": "",
                    "Input Type": originalHowToFill // Temporarily hold original instruction here for page.tsx logic
                });
            }
        }
    });

    return allResults;
};
