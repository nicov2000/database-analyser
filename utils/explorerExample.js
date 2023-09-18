// import BigNumber from 'bignumber.js'
// import Db from '../lib/Db'

// async function main () {
//   const dbInstance = new Db({ db: 'blockDB_old_mongoDB' })
//   const db = await dbInstance.db()

//   const collection = process.argv[2]
//   const limit = parseInt(process.argv[3]) || 0
//   const docs = await db.collection(collection).find().limit(limit).toArray()
//   if (!docs) {
//     console.log('No documents found.')
//     process.exit(0)
//   }

//   const schema = getSchema(docs, { debug: false })

//   const result = {
//     creation: new Date(),
//     collection,
//     schema
//   }

//   console.log('Saving new schema into collection...')
//   await db.collection('schemas').insertOne(result)
//   console.log('Done.')

//   console.dir(result, { depth: null })
//   process.exit()
// }

// main()
