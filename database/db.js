import { MongoClient } from 'mongodb'

export async function databaseInstance () {
  const dbName = 'schemasDB'
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
