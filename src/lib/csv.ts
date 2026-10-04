// Builds CSV text. No framework imports.

// Spreadsheet programs run cells that start with = + - @ as formulas, which a
// sign-up form could abuse. A leading apostrophe makes them plain text.
function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => cell(c.label)).join(",");
  const lines = rows.map((r) => columns.map((c) => cell(r[c.key])).join(","));
  return [header, ...lines].join("\r\n") + "\r\n";
}
