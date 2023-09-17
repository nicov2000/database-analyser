import { users } from './data/users.js'
import { newDB } from './db.js'
import { getFieldsTypes, getSchema } from './utils.js'

export async function populate (collections) {
  const { usersCollection } = collections
  const res = await usersCollection.insertMany(users)

  return res
}

export async function drop (collections) {
  const { usersCollection } = collections

  const res = await usersCollection.deleteMany()

  return res
}

export async function read (collections) {
  const { usersCollection } = collections

  const res = await usersCollection.find().toArray()

  return res
}

export async function analyse (collections) {
  const { usersCollection } = collections
  const limit = parseInt(process.argv[3]) || 1 // default 1

  const data = await usersCollection.find().limit(limit).toArray()

  return data.map(getFieldsTypes)
}

export async function deepAnalyse () {
  const { db, collections } = await newDB()
  const { users: usersCollection } = collections
  const { name, collection } = usersCollection

  const documents = await db.collection('transactions').find().toArray()
  const result = getSchema(documents, { debug: false })

  const schema = {
    metadata: {
      creation: new Date(),
      collection: name
    },
    schema: result
  }

  console.log('Saving new schema into collection...')
  await db.collection('schemas').insertOne(schema)
  console.log('Done.')

  return schema
}
