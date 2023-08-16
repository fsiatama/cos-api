export function getEnumValues<T>(enumType: T): Array<string> {
  return [
    ...new Set(
      Object.entries(enumType)
        .filter(([key]) => !~~key)
        .flatMap((item) => item),
    ),
  ];
}

export function exclude<T, Key extends keyof T>(
  entity: T,
  keys: Key[],
): Omit<T, Key> {
  for (let key of keys) {
    delete entity[key];
  }
  return entity;
}
