import { Db, MongoClient, MongoClientOptions } from 'mongodb'
import * as mongoUri from 'mongodb-uri'

const databases: { [dbName: string]: { db: Db; client: MongoClient } } = {}

export const getDb = ({ dbName }: { dbName: string }): Db => {
  if (!databases[dbName]) throw new Error(`Database ${dbName} not yet initialized!`)
  return databases[dbName].db
}

export const getClient = ({ dbName }: { dbName: string }): MongoClient => {
  if (!databases[dbName]) throw new Error(`Database ${dbName} not yet initialized!`)
  return databases[dbName].client
}

export const initializeMongoDB = async ({
  uri,
  dbName,
  options = {},
}: {
  uri: string
  dbName: string
  options?: MongoClientOptions
}): Promise<void> => {
  if (databases[dbName]) return
  const { database } = mongoUri.parse(uri)
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    j: true,
    w: 1,
    useUnifiedTopology: true,
    ...options,
  })
  const db = client.db(database)
  databases[dbName] = { client, db }
  const signals: NodeJS.Signals[] = [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`]
  signals.forEach(s => process.once(s, async () => await client.close()))
}
