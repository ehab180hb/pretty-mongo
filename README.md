Get up and running with MongoDB in a few lines of code!

Pretty Mongo offers a set of handy methods that abstract away many of the complexities of using MongoDB in your project. Written in Typescript.

# The why

The Native MongoDB driver is awesome! But in the era of serverless and microservices, we find ourselves having to constantly write boilerplate code to get up and running.

This library allows you to easily establish one or more database connections, and will also provide an abstraction layer that works really well Typescript and gives you a set of nicely-named methods that'll cover the use cases of the majority of projects out there.

# Installation

[![NPM Info](https://nodei.co/npm/pretty-mongo.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.org/package/pretty-mongo)

[![Build Status](https://travis-ci.org/ehab180hb/pretty-mongo.svg?branch=master)](https://travis-ci.org/ehab180hb/pretty-mongo)

## Example usage

```typescript
import { initializeMongoDB, getDb, MongoCollectionMethods } from 'pretty-mongo'
const run = async () => {
  const uri = `mongodb://localhost/myApp`
  const dbName = 'myMainDbConnection' // We set the name here, allowing us to later create different connections and give then different labels to fetch them.
  await initializeMongoDB({ uri, dbName })

  // Now we could easily access that connection from a different module synchronously.
  const myMainDb = getDb({ dbName })

  // This will return the native MongoDB `Collection` object.
  const userCollection = myMainDb.collection('Users')

  // The library also offers a set of methods that will make building your app much easier. And it works really well with Typescript! By defining your Model here, you'll be getting typed objects when for example scanning the DB.

  interface userDbModel {
    _id: ObjectId
    firstName: string
    lastName: string
    createdAt: Date
    balance: number
    isAdmin?: boolean
  }
  const usersCollectionMethods = new MongoCollectionMethods<userDbModel>(userCollection)

  // When creating a new object, it will give you an autocomplete feature in your IDE.
  const created = await usersCollectionMethods.createOne({
    _id: new ObjectId(), // it will be created automatically if you do not include it
    firstName: 'Roger',
    lastName: 'Smith',
    balance: 0,
    createdAt: new Date(),
  })

  // And typescript will nag you if you tried to pass a field that does not exist or provided the wrong type for a field
  const created = await usersCollectionMethods.createOne({
    _id: new ObjectId(), // it will be created automatically if you do not include it
    lastName: 'Smith',
    balance: 0,
    createdAt: new Date(),
  }) // ts error, missing required field

  const created = await usersCollectionMethods.createOne({
    _id: new ObjectId(), // it will be created automatically if you do not include it
    firstName: 2,
    lastName: 'Smith',
    balance: 0,
    createdAt: new Date(),
  }) // ts error, firstName must be a string

  // It also gives you a set of new methods like
  const totalUserCount = await usersCollectionMethods.getTotalCount()
}

run()
```

Full API documentation [here](https://github.com/ehab180hb/pretty-mongo/blob/master/API.md)

## Author

[Ehab Khaireldin](https://github.com/ehab180hb)
Feel free to get in touch, raise issues or submit feature requests!

## License

This project is licensed under the MIT License
