/**
 * The "General details" admin form exposes a single `managers` array
 * (name / role / phone / email) and has no dedicated designer field, so a designer
 * contact is entered as a manager whose role says "designer". Roles are translatable,
 * so the value can be a plain string or a `{ro, ru, en}` object.
 */
export function isDesignerRole(role: unknown): boolean {
  const text = role && typeof role === 'object'
    ? Object.values(role as Record<string, unknown>).join(' ')
    : String(role ?? '');

  return /design|дизайн/i.test(text);
}
