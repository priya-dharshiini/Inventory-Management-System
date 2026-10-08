
export function isEmptyValue(value: any): boolean {
  return value === null || value === undefined || String(value).trim() === '';
}
export function buildRequiredErrors(row: any, fields: string[], labels: Record<string, string>): any {
  const errors: any = {};
  for (const field of fields) {
    errors[field] = isEmptyValue(row ? row[field] : null) ? `${labels[field]} is required` : '';
  }
  return errors;
}

export function hasErrors(errors: any): boolean {
  return Object.values(errors).some((message) => !!message);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export class SearchDebouncer {
  private timer: any = null;

  run(callback: () => void, delayMs = 300): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(callback, delayMs);
  }
}
export function hasSearchCriteria(fields: any): boolean {
  return Object.values(fields).some((v: any) => v !== null && v !== undefined && String(v).trim() !== '');
}
