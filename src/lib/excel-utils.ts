import * as XLSX from 'xlsx';

export const exportToExcel = (datasets: Record<string, any[]>, filename: string = "PGRB_Normalized_Result.xlsx") => {
    const wb = XLSX.utils.book_new();

    for (const [sheetName, data] of Object.entries(datasets)) {
        if (!data || data.length === 0) continue;
        
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    XLSX.writeFile(wb, filename);
};
