export function findObjectByKey(array: any[], key: string) {
  return array.find(el => Object.keys(el).find(elKey => elKey === key))?.[key];
}
