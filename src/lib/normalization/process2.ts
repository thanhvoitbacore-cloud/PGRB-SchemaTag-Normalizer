import * as XLSX from 'xlsx';

export interface SchemaTagReference {
    "Class ID": string;
    "TagName_Tag ID": string;
    "Tag Type": string;
    "Tag Name": string;
    "Tag Definition": string;
    "Input Type": string;
    "Dropdown Value": string;
    "Extracted Tag ID": string;
}

export const process2 = (workbook: XLSX.WorkBook): SchemaTagReference[] => {
    let allResults: SchemaTagReference[] = [];

    workbook.SheetNames.forEach(sheetName => {
        if (sheetName.toLowerCase() === "dropdownoptions" || 
            sheetName.toLowerCase() === "wf-only-metadata" ||
            sheetName.toLowerCase() === "combined" ||
            sheetName.toLowerCase().startsWith("expected")) return;

        let classId = sheetName;
        if (sheetName.includes("-")) {
            classId = sheetName.split("-")[0].trim();
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

        if (rows.length < 8) return;

        // In the input schema file:
        // Row 1 (index 0): TagName_Tag ID
        // Row 2 (index 1): Tag Type (Requirement)
        // Row 3 (index 2): Tag Name (Title)
        // Row 4 (index 3): Tag Definition
        // Row 5 (index 4): Input Type
        // Row 6 (index 5): Dropdown Value

        const cleanRows = rows.slice(0, 8).map(row => {
            if (row.length <= 7) return [];
            return row.slice(7);
        });

        const numCols = cleanRows[0].length;
        for (let j = 0; j < numCols; j++) {
            const tagNameId = String(cleanRows[0][j] || "").trim();
            const tagType = String(cleanRows[1][j] || "").trim();
            const tagName = String(cleanRows[2][j] || "").trim();
            const tagDef = String(cleanRows[3][j] || "").trim();
            const inputType = String(cleanRows[4][j] || "").trim();
            const dropdownVal = String(cleanRows[5][j] || "").trim();

            if (!tagNameId && !tagType && !tagName && !tagDef && !inputType && !dropdownVal) {
                continue;
            }

            if (tagNameId.toLowerCase().includes("attributeswhy")) {
                break;
            }

            if (tagNameId.toLowerCase().startsWith("existing_")) {
                continue;
            }

            // Extract the simple ID (the number at the end) for easier mapping if needed
            let extractedTagId = tagNameId.trim();
            if (tagNameId.includes("::")) {
                extractedTagId = tagNameId.split("::").pop()?.trim() || tagNameId.trim();
            } else if (tagNameId.includes(":")) {
                extractedTagId = tagNameId.split(":").pop()?.trim() || tagNameId.trim();
            }

            allResults.push({
                "Class ID": classId,
                "TagName_Tag ID": tagNameId,
                "Tag Type": tagType,
                "Tag Name": tagName,
                "Tag Definition": tagDef,
                "Input Type": inputType,
                "Dropdown Value": dropdownVal,
                "Extracted Tag ID": extractedTagId
            });
        }
    });

    return allResults;
};
