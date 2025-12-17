import { FileDown } from 'lucide-react';

interface ExportToExcelProps {
  data: any[];
  fileName: string;
  sheetName?: string;
  columns?: { key: string; label: string }[];
}

export function ExportToExcel({
  data,
  fileName,
  sheetName = 'Sheet1',
  columns,
}: ExportToExcelProps) {
  const handleExport = async () => {
    try {
      const XLSX = await import('xlsx');

      // Map data to specified columns
      let exportData = data;
      if (columns) {
        exportData = data.map(item =>
          columns.reduce(
            (acc, col) => {
              const value = col.key.includes('.')
                ? col.key.split('.').reduce((obj, key) => obj?.[key], item)
                : item[col.key];
              acc[col.label] = value || '-';
              return acc;
            },
            {} as Record<string, any>
          )
        );
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(() => 18);
      worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

      // Style header row (optional - basic styling)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!worksheet[address]) continue;
        worksheet[address].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFD9E8F7' } },
        };
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fullFileName = `${fileName}_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, fullFileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={data.length === 0}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        background: data.length === 0 ? '#647eb3ff' : '#425ec3ff',
        color: data.length === 0 ? '#9ca3af' : '#d8e3f4ff',
        fontWeight: 500,
        fontSize: 14,
        cursor: data.length === 0 ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        if (data.length > 0) {
          (e.currentTarget as HTMLButtonElement).style.background = '#5781d6ff';
        }
      }}
      onMouseLeave={e => {
        if (data.length > 0) {
          (e.currentTarget as HTMLButtonElement).style.background = '#425ec3ff';
        }
      }}
    >
      <FileDown size={16} />
      Export to Excel
    </button>
  );
}
