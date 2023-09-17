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
  const { name } = usersCollection

  const documents = await db.collection('transactions').find().toArray()
  const schema = getSchema(documents, { debug: false })

  const result = {
    creation: new Date(),
    collection: name,
    schema
  }

  console.log('Saving new schema into collection...')
  await db.collection('schemas').insertOne(result)
  console.log('Done.')

  return result
}
