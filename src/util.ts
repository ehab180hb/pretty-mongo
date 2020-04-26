/**
 * Will check whether or not the given object is empty
 */
export const isEmptyObject = (obj: object) => {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0
}

/**
 * Will remove the fields that do not meet the given condition
 */
export const removeValues = (o: object, condition: (val: any) => boolean) => {
  const newObj = {}
  for (const k in o) if (!condition(o[k])) newObj[k] = o[k]
  return newObj
}

/**
 * Returns an array with ranges from arg 1 up to (but not including) arg 2
 * @example
 * getRange(3, 6) // [ 3, 4, 5 ]
 */
export const getRange = (from: number, to: number): number[] => {
  if (from > to) throw new Error(`Value of 'from' should be lower than or equal to 'to'`)
  return Array.from({ length: to - from }, (_v, k) => k + from)
}
