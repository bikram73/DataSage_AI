import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFileResult {
  name: string;
  fileType: 'CSV' | 'XLSX' | 'XLS';
  sizeKB: number;
  rows: Record<string, any>[];
}

export function parseSpreadsheetFile(file: File): Promise<ParsedFileResult> {
  return new Promise((resolve, reject) => {
    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();
    const sizeKB = Math.round(file.size / 1024);

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve({
            name: fileName,
            fileType: 'CSV',
            sizeKB,
            rows: results.data as Record<string, any>[]
          });
        },
        error: (err) => reject(new Error(`CSV parsing error: ${err.message}`))
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

          resolve({
            name: fileName,
            fileType: extension === 'xlsx' ? 'XLSX' : 'XLS',
            sizeKB,
            rows: jsonRows
          });
        } catch (err: any) {
          reject(new Error(`Excel file parsing failed: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file buffer'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please upload a CSV, XLSX, or XLS file.'));
    }
  });
}
