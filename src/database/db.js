import { MongoClient } from 'mongodb'
import { isString } from '../lib/typesDetection.js'

export async function databaseInstance ({ dbName }) {
  if (!dbName) throw new Error('Missing database name')
  if (!isString(dbName)) throw new Error('Database name must be a string')

  try {
    const mongoClient = new MongoClient('mongodb://127.0.0.1:27017/')
    await mongoClient.connect()

    const db = mongoClient.db(dbName)

    console.log('Connected to Database')
    return { mongoClient, db }
  } catch (error) {
    console.error('Connection failed. Reason:', error)
    process.exit()
  }
}
