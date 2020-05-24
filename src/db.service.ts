import { Db, MongoClient, MongoClientOptions } from 'mongodb'
import * as mongoUri from 'mongodb-uri'

const databases: { [connectionName: string]: { db: Db; client: MongoClient } } = {}

export const getDb = ({ connectionName }: { connectionName: string }): Db => {
  if (!databases[connectionName]) throw new Error(`Database ${connectionName} not yet initialized!`)
  return databases[connectionName].db
}

export const getClient = ({ connectionName }: { connectionName: string }): MongoClient => {
  if (!databases[connectionName]) throw new Error(`Database ${connectionName} not yet initialized!`)
  return databases[connectionName].client
}

export const initializeMongoDB = async ({
  uri,
  connectionName,
  options = {},
}: {
  uri: string
  connectionName: string
  options?: MongoClientOptions
}): Promise<void> => {
  if (databases[connectionName]) return
  const { database } = mongoUri.parse(uri)
  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    j: true,
    w: 1,
    useUnifiedTopology: true,
    ...options,
  })
  const db = client.db(database)
  databases[connectionName] = { client, db }
  const signals: NodeJS.Signals[] = [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`]
  signals.forEach(s => process.once(s, async () => await client.close()))
}
