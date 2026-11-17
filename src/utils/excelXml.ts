type CellValue = string | number | boolean | null | undefined;
type Worksheet = {
  data: CellValue[][];
  [key: string]: unknown;
};
type Workbook = {
  SheetNames: string[];
  Sheets: Record<string, Worksheet>;
};

const escapeXml = (value: CellValue) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const utils = {
  book_new(): Workbook {
    return { SheetNames: [], Sheets: {} };
  },
  aoa_to_sheet(data: CellValue[][]): Worksheet {
    return { data };
  },
  book_append_sheet(workbook: Workbook, worksheet: Worksheet, name: string) {
    const safeName = name.slice(0, 31);
    workbook.SheetNames.push(safeName);
    workbook.Sheets[safeName] = worksheet;
  },
};

export const writeFile = (workbook: Workbook, requestedFilename: string) => {
  const worksheets = workbook.SheetNames.map((name) => {
    const rows = workbook.Sheets[name]?.data || [];
    return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rows
      .map(
        (row) =>
          `<Row>${row
            .map((cell) => {
              const type = typeof cell === 'number' ? 'Number' : typeof cell === 'boolean' ? 'Boolean' : 'String';
              return `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
            })
            .join('')}</Row>`
      )
      .join('')}</Table></Worksheet>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
${worksheets.join('\n')}
</Workbook>`;
  const blob = new Blob([`\uFEFF${xml}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = requestedFilename.replace(/\.xlsx$/i, '.xls');
  anchor.click();
  URL.revokeObjectURL(url);
};
