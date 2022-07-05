export const removeUndefinedKeys = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const newObj = { ...obj }
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] === undefined) {
      delete newObj[key]
    }
  })
  return newObj
}
