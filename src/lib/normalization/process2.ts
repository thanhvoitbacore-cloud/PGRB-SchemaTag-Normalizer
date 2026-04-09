import * as XLSX from 'xlsx';

export interface SchemaTagReference {
    "Class ID": string;
    "TagName_ID": string;
    "Type": string;
    "Requirement": string;
    "Name": string;
    "Definition": string;
    "Input Type": string;
    "Dropdown Value": string;
    "Extracted Tag ID": string;
}

export const process2 = (workbook: XLSX.WorkBook): SchemaTagReference[] => {
    let allResults: SchemaTagReference[] = [];

    workbook.SheetNames.forEach(sheetName => {
        if (sheetName.toLowerCase() === "dropdownoptions") return;

        let classId = sheetName;
        if (sheetName.includes("-")) {
            classId = sheetName.split("-")[0].trim();
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];

        if (rows.length < 8) return;

        const cleanRows = rows.slice(0, 8).map(row => {
            if (row.length <= 7) return [];
            return row.slice(7);
        });

        const numCols = cleanRows[0].length;
        for (let j = 0; j < numCols; j++) {
            const tagNameId = String(cleanRows[0][j] || "").trim();
            const tagType = String(cleanRows[1][j] || "").trim();
            const requirement = String(cleanRows[2][j] || "").trim();
            const tagName = String(cleanRows[3][j] || "").trim();
            const tagDef = String(cleanRows[4][j] || "").trim();
            const inputType = String(cleanRows[5][j] || "").trim();
            const dropdownVal = String(cleanRows[6][j] || "").trim();

            if (!tagNameId && !tagType && !tagName && !tagDef && !inputType && !dropdownVal) {
                continue;
            }

            if (tagNameId.toLowerCase().includes("attributeswhy")) {
                break;
            }

            if (tagNameId.toLowerCase().startsWith("existing_")) {
                continue;
            }

            let extractedTagId = tagNameId;
            if (tagNameId.includes("::")) {
                extractedTagId = tagNameId.split("::").pop()?.trim() || tagNameId;
            } else if (tagNameId.includes(":")) {
                extractedTagId = tagNameId.split(":").pop()?.trim() || tagNameId;
            }
            extractedTagId = extractedTagId.trim();

            allResults.push({
                "Class ID": classId,
                "TagName_ID": tagNameId,
                "Type": tagType,
                "Requirement": requirement,
                "Name": tagName,
                "Definition": tagDef,
                "Input Type": inputType,
                "Dropdown Value": dropdownVal,
                "Extracted Tag ID": extractedTagId
            });
        }
    });

    return allResults;
};
