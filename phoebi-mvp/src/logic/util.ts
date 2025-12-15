export function newUuid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}