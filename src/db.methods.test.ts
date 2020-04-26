import * as dbTestUtil from 'mongo-test-suit'
import { ObjectId } from 'bson'
import { getRange } from './util'
import { MongoCollectionMethods } from './db.methods'
import * as randomString from 'randomstring'

const dbName = `my-db-${randomString.generate(7)}`
const uri = `mongodb://localhost/${dbName}`

const { fillCollection, getCollectionSnapshot, getTestDb, initializeTestDB, flushDb } = dbTestUtil

const collectionName = 'testCollection'
let myService: MongoCollectionMethods<any>

beforeAll(async () => {
  await initializeTestDB(uri)
  myService = new MongoCollectionMethods(getTestDb().collection(collectionName))
})

beforeEach(async () => {
  await flushDb()
})

const replaceIdWithTs = (docs: { _id: ObjectId }[]) => {
  return docs.map(x => {
    return {
      ...x,
      _id: x._id.getTimestamp(),
    }
  })
}

describe('DB methods tests', () => {
  describe('Storing data', () => {
    describe('createOne()', () => {
      test('Creates record properly', async () => {
        const r = await myService.createOne({ hi: 'hello' })
        expect(r).toHaveProperty('toHexString')
        expect(await getCollectionSnapshot({ collectionName, removeIds: true })).toMatchSnapshot()
      })
    })

    describe('updateOne()', () => {
      const before = { email: 'IExist@gmail.com' }
      const after = { email: 'IExist2@gmail.com' }
      test('When record exists', async () => {
        await fillCollection(collectionName, [before, { email: 'meToo@gmail.com' }])
        const r = await myService.updateOne(before, after)
        expect(r).toBeTruthy()
        expect(await getCollectionSnapshot({ collectionName, removeIds: true })).toMatchSnapshot()
      })
      test('When an object in the update is undefined', async () => {
        await fillCollection(collectionName, [
          { ...before, wontBeDeleted: 'x', willBeDeleted: 'y' },
          { email: 'meToo@gmail.com' },
        ])
        const r = await myService.updateOne(before, { ...after, willBeDeleted: undefined })
        expect(r).toBeTruthy()
        expect(await getCollectionSnapshot({ collectionName, removeIds: true })).toMatchSnapshot()
      })
      test('When record does not exist', async () => {
        const r = await myService.updateOne(before, after)
        expect(r).toBeFalsy()
        expect(await getCollectionSnapshot({ collectionName })).toMatchSnapshot()
      })
    })

    describe('updateFieldsWithSpecialOp()', () => {
      test('Without options', async () => {
        await fillCollection(collectionName, [{ x: 'y', num: 1 }])
        await myService.updateFieldsWithSpecialOp({ x: 'y' }, { $inc: { num: 1 } })
        expect(await getCollectionSnapshot({ collectionName, removeIds: true })).toMatchSnapshot()
      })
    })

    describe('createMany()', () => {
      test('When given the _id', async () => {
        const docs = getRange(0, 5).map(() => ({ _id: new ObjectId(), k: 'f' }))
        await myService.createMany(docs)
        const snap = (await getCollectionSnapshot({ collectionName })) as { _id: ObjectId }[]
        expect(replaceIdWithTs(snap)).toMatchSnapshot()
      })
      test('When not given the _id', async () => {
        const docs = getRange(0, 5).map(() => ({ v: 'n' }))
        await myService.createMany(docs)
        const snap = (await getCollectionSnapshot({ collectionName })) as { _id: ObjectId }[]
        expect(replaceIdWithTs(snap)).toMatchSnapshot()
      })
    })
  })

  describe('Fetching data()', () => {
    const data = [
      { _id: new ObjectId('5cc1db02dc067f5df93c5432'), hi: 'hello', same: 'same', name: 'Mark' },
      { _id: new ObjectId('5cc1db02dc067f5df93c5433'), tak: 'nie', same: 'same', name: 'John' },
    ]
    beforeEach(async () => {
      await fillCollection(collectionName, data)
    })
    describe('getOneById()', () => {
      test('When a record exists', async () => {
        const r = await myService.getOneById(data[0]._id)
        expect(r).toMatchSnapshot()
      })
      test('When a record exists with projection', async () => {
        const r = await myService.getOneById(data[0]._id, { projection: { name: 1 } })
        expect(r).toMatchSnapshot()
      })
      test('When a record does not exist', async () => {
        const r = await myService.getOneById(new ObjectId('5cc1db02dc067f5df93c5434'))
        expect(r).toBeUndefined()
      })
    })

    describe('getOne', () => {
      test('When it exists', async () => {
        expect(await myService.getOne({ name: 'Mark' })).toMatchSnapshot()
      })
      test('When it exists - with opts', async () => {
        expect(await myService.getOne({ name: 'Mark' }, { projection: { same: 0 } })).toMatchSnapshot()
      })
      test('When it does not exist', async () => {
        expect(await myService.getOne({ name: 'Sandra' })).toBeUndefined()
      })
    })
    describe('getMany()', () => {
      test('When fetching all', async () => {
        const r = await myService.getMany({})
        expect(r).toMatchSnapshot()
      })
      test('with projection', async () => {
        const r = await myService.getMany({ hi: 'hello' }, { projection: { same: 0 } })
        expect(r).toMatchSnapshot()
      })
      test('with sorting', async () => {
        const r = await myService.getMany({}, { sort: { name: 1 } })
        expect(r).toMatchSnapshot()
      })
      test('with skipping', async () => {
        const r = await myService.getMany({ same: 'same' }, { skip: 1 })
        expect(r).toMatchSnapshot()
      })
      test('When nothing matches', async () => {
        const r = await myService.getMany({ non: 'existing' })
        expect(r).toEqual([])
      })
    })
  })
  describe('getTotalCount()', () => {
    beforeEach(async () => {
      await fillCollection(collectionName, [{ x: 'y' }, { x: 'y' }, { x: 'y' }, { v: 'v' }])
    })
    test('When counting all', async () => {
      const r = await myService.getTotalCount()
      expect(r).toBe(4)
    })
    test('When counting some', async () => {
      const r = await myService.getTotalCount({ v: 'v' })
      expect(r).toBe(1)
    })
  })

  describe('Deleting data', () => {
    const data = [
      { _id: new ObjectId('5cc1db02dc067f5df93c5432'), hi: 'hello', same: 'same', name: 'Mark' },
      { _id: new ObjectId('5cc1db02dc067f5df93c5433'), tak: 'nie', same: 'same', name: 'John' },
    ]
    beforeEach(async () => {
      await fillCollection(collectionName, data)
    })
    describe('DeleteOne', () => {
      test('When record exists', async () => {
        const r = await myService.deleteOneById(data[0]._id)
        expect(r).toBe(1)
        expect(await getCollectionSnapshot({ collectionName })).toMatchSnapshot()
      })
      test('When record does not exist', async () => {
        const r = await myService.deleteOneById(new ObjectId('5cc1db02dc067f5df93c5620'))
        expect(r).toBeFalsy()
        expect(await getCollectionSnapshot({ collectionName })).toMatchSnapshot()
      })
    })
  })
})
