export function findObjectByKey(source: any, key: string): any {
  if (!source) {
    return null;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = findObjectByKey(item, key);
      if (found !== null && found !== undefined) {
        return found;
      }
    }
    return null;
  }

  if (typeof source === 'object') {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }

    for (const value of Object.values(source)) {
      const found = findObjectByKey(value, key);
      if (found !== null && found !== undefined) {
        return found;
      }
    }
  }

  return null;
}
