export function findObjectByKey(array: any[], key: string) {
  return array.find(el => Object.keys(el).find(elKey => elKey === key))?.[key];
}

export function getLocalized(value: any, lang?: string | null): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  const preferred = lang || (typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null) || 'ro';
  return value[preferred] ?? value['ro'] ?? value['ru'] ?? value['en'] ?? undefined;
}
