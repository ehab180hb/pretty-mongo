import { getDb, initializeMongoDB } from './db.service'

describe('Database tests', () => {
  test('Could be initialized and used', async () => {
    const dbName = 'testDb'
    await initializeMongoDB({ uri: 'mongodb://localhost/test-mongo-lib', dbName })
    const db = getDb({ dbName })
    const { ok } = await db.stats()
    expect(ok).toBeTruthy()
  })
})
