import { databaseInstance } from './database/db.js'
import { getSchema } from './database/getSchema.js'

// TODO: Add cursor processing for large samples (multiple queries to database)
export async function analyse () {
  const { db } = await databaseInstance()
  const collectionName = 'transactions'

  const documents = await db.collection(collectionName).find().limit(2).toArray()
  const schema = getSchema(documents, { debug: false })
  const result = {
    creation: new Date(),
    [collectionName]: schema
  }

  console.log(`Saving schema for collection "${collectionName}"...`)

  await db.collection('schemas').insertOne(result)

  console.log('Done.')
  console.dir(result, { depth: null })
  process.exit(0)
}

analyse()
