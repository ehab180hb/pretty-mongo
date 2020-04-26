### `initializeMongoDB({ uri, dbName, options })`

Will initialize the DB connection and allow you to use the rest of the functions.

- `uri` - The MongoDB connection string
- `dbName` - An arbitrary name to assign to the specific instance of MongoDB, that will allow you later on to get that very same instance by the name. This feature allows you to easily create multiple database connections.
- `options` - Optional. The native MongoDbClientOptions. (see the types)

```typescript
await initializeMongoDB({ uri: 'mongodb://localhost/my-db', dbName: 'myDB' })

// or set your options
await initializeMongoDB({ uri: 'mongodb://localhost/my-db', dbName: 'myDB', options: { useUnifiedTopology: false } })

// getting it later on (it's a synchronous operation)
const myDb = getDb({ dbName: 'myDb' })
```

### `getDb({ dbName })`

Will return the native MongoDB `Db` object. Throws if no database by the name of `dbName` was initialized.

- `dbName` - The arbitrary name you've assigned to the database instance while initializing it.

```typescript
const myDb = getDb({ dbName: 'myDb' })
```

### `getClient({ dbName })`

Will return the native MongoDB `MongoClient` object. Throws if no database by the name of `dbName` was initialized.

- `dbName` - The arbitrary name you've assigned to the database instance while initializing it.

```typescript
const myDbClient = getClient({ dbName: 'myDb' })
```

### `MongoCollectionMethods(collection)`

A class that gives you a set of useful methods to abstract away some of the complexity of working with MongoDB.

- `collection` - The MongoDB `Collection` object. The one you get by calling `getClient({ dbName }).collection('MyCollectionName')`

```typescript
interface userDbModel {
  _id: ObjectId
  firstName: string
  lastName: string
  createdAt: Date
  balance: number
  isAdmin?: boolean
}

const dbName = 'myApp'
const collection = getClient({ dbName }).collection('Users')

const usersCollectionMethods = new MongoCollectionMethods<userDbModel>(collection)

const totalUserCount = await usersCollectionMethods.getTotalCount()
```

## MongoCollectionMethods API

### `createOne(record)`

Will create a record in the DB, the type system will expect the `record` to match the one you defined when you instantiated the MongoCollectionMethods class.

- `record` - the MongoDB connection string

```typescript
const userToCreate = {
  _id: new ObjectId(), // it will be created automatically if you do not include it
  firstName: 'Roger',
  lastName: 'Smith',
  balance: 0,
  createdAt: new Date(),
}

// Will return a boolean indicated whether or not it was created
const created = await usersCollectionMethods.createOne(userToCreate)
```

### `updateOne(criteria, update, [options])`

Will update a given record using MongoDB's `$set` method.

- `criteria` - The criteria of which to find the record to update
- `update` - The fields you'd like to update
- `options` - Optional. The native MongoDB FindOneAndUpdateOption option.

```typescript
// Will return a boolean indicated whether or not it was updated (false if, for example, that user does not exist)
const updated = await usersCollectionMethods.updateOne(
  { _id: new ObjectId('5ea5ae9af24e795018224841') },
  { isAdmin: true },
)

// To remove the user from the admin list (will remove the field `isAdmin` from the object)
const removedFromAdminList = await usersCollectionMethods.updateOne(
  { _id: new ObjectId('5ea5ae9af24e795018224841') },
  { isAdmin: undefined },
)
```

### `updateFieldsWithSpecialOp(criteria, update, [options])`

That's an abstraction over the native driver's `findOneAndUpdate` method, which will allow you to use operators such is `$inc` and `$unset`.

- `criteria` - The criteria of which to find the record to update
- `update` - The fields you'd like to update
- `options` - Optional. A MongoDB FindOneAndUpdateOption object.

```typescript
// Will return a boolean indicated whether or not it was updated (false if, for example, that user does not exist)
const updated = await usersCollectionMethods.updateFieldsWithSpecialOp(
  { _id: new ObjectId('5ea5ae9af24e795018224841') },
  { balance: { $inc: 100 },
)
```

### `getOneById(id, [options])`

Will grab one object from the collection by its ID.

- `id` - The MongoDB ObjectId
- `options` - Optional. A MongoDB FindOneOptions object.

```typescript
// Will return a typed User object or undefined if not found (instead of the native driver's Null object)
const user = await usersCollectionMethods.getOneById(new ObjectId('5ea5ae9af24e795018224841'))
```

### `getOne(criteria, [options])`

Will fetch a single record from the database by the given `criteria`. First matching record is returned. Otherwise `undefined`.

- `criteria` - The fields of which to filter the search by.
- `options` - Optional. A MongoDB FindOneOptions object.

```typescript
// Will return a typed User object or undefined if not found (instead of the native driver's Null object)
const user = await usersCollectionMethods.getOne({ firstName: 'Roger' })
```

### `getMany(criteria, [options])`

Will fetch all the records matching the search criteria. Returning a typed array. If nothing is found the array should be empty.

- `criteria` - The fields of which to filter the search by.
- `options` - Optional. A MongoDB FindOneOptions object.

```typescript
// Will return a typed User array or an empty array if none were found
const usersNamedRoger = await usersCollectionMethods.getMany({ firstName: 'Roger' })
```

### `getTotalCount([criteria], [options])`

Will get a total count of the records matching the search criteria, if no criteria is set, it will count all the records in the collection.

- `criteria` - Optional. The fields of which to filter the search by.
- `options` - Optional. A MongoDB FindOneOptions object.

```typescript
const totalUserCount = await usersCollectionMethods.getTotalCount()
const totalCountOfUsersNamedRoger = await usersCollectionMethods.getTotalCount({ firstName: 'Roger' })
```

### `deleteOneById(id)`

Will delete the record with the given `id`

- `id` - The ObjectId of the record you want to get rid of.

```typescript
// Will return `false` if no records with that ID existed.
const userDeleted = await usersCollectionMethods.deleteOneById(new ObjectId('5ea5ae9af24e795018224841'))
```

### `createMany(records)`

Will create a batch of records at once. Returning an array of the `ObjectId`s of said records.

- `records` - the MongoDB connection string

```typescript
const usersToCreate = [
  {
    _id: new ObjectId(),
    firstName: 'Roger',
    lastName: 'Smith',
    balance: 0,
    createdAt: new Date(),
  },
  {
    _id: new ObjectId(),
    firstName: 'Samantha',
    lastName: 'Anderson',
    balance: 0,
    createdAt: new Date(),
  },
]

const ids = await usersCollectionMethods.createMany(usersToCreate)
```
