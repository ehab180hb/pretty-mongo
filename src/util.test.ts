import { removeValues, isEmptyObject, getRange } from './util'

describe('isEmptyObject()', () => {
  test('When the object is empty', async () => {
    expect(isEmptyObject({})).toBe(true)
  })
  test('When the object is not empty', async () => {
    expect(isEmptyObject({ k: 'v' })).toBe(false)
  })
})

describe('removeValues()', () => {
  const testObj = {
    x: {},
    y: { a: 'a' },
  }
  test('Remove values that meet the given condition', async () => {
    expect(removeValues(testObj, isEmptyObject)).toMatchSnapshot()
  })
})

test('Generates proper ranges', () => {
  expect(getRange(1, 6)).toMatchSnapshot()
  expect(getRange(0, 1)).toMatchSnapshot()
  expect(() => getRange(100, 5)).toThrowErrorMatchingSnapshot()
  expect(() => getRange(7, 5)).toThrowErrorMatchingSnapshot()
})
