import { MongoClient } from 'mongodb'

const collectionsNames = [
  'users',
  'cars'
]

export async function newDB () {
  try {
    const client = new MongoClient('mongodb://127.0.0.1:27017/')
    await client.connect()

    const db = client.db('schemasDB')
    const collections = {}

    for (const name of collectionsNames) {
      collections[name] = {
        name,
        collection: db.collection(name)
      }
    }

    console.log('[DB] Online')
    return { client, db, collections }
  } catch (error) {
    console.error('Connection failed. Reason:', error)
    process.exit()
  }
}
