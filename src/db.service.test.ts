import { getDb, initializeMongoDB } from './db.service'

describe('Database tests', () => {
  test('Could be initialized and used', async () => {
    const connectionName = 'testDb'
    await initializeMongoDB({ uri: 'mongodb://localhost/test-mongo-lib', connectionName })
    const db = getDb({ connectionName })
    const { ok } = await db.stats()
    expect(ok).toBeTruthy()
  })
})
