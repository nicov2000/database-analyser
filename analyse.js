import settings, { exitEvents } from './lib/settings.js'
import { databaseInstance } from './database/db.js'
import { colored } from './utils/colors.js'
import { processDocuments, processSchemaResult } from './lib/processors.js'

// TODO: add median and processed estimation

const status = {
  schema: null,
  schemaCheckpoint: null,
  totalAnalysed: 0
}

export async function analyse () {
  const { dbName, cursorField, sortDir, paginationLimit: limit, collectionName, loggingThereshold, samplesLimit } = settings
  const sort = { [cursorField]: sortDir }
  let { resumeAtCursor } = settings
  let hasNext = true
  let cursor

  console.log('Target collection: ' + colored(collectionName))
  console.log('Cursor field: ' + colored(cursorField))
  console.log('Sort dir: ' + colored(sortDir))
  console.log('Pagination limit: ' + colored(limit))
  console.log('Logging threshold: ' + colored(loggingThereshold))
  if (resumeAtCursor) console.log('Resuming at cursor: ' + colored(resumeAtCursor))

  try {
    const { db } = await databaseInstance({ dbName })
    const collection = db.collection(collectionName)
    const estimatedCount = await collection.estimatedDocumentCount()

    console.log('Documents inside collection (aprox): ' + colored(estimatedCount))
    console.log()
    console.log('Starting process...')
    console.log()

    // START Paginated processing
    while (hasNext && status.totalAnalysed < samplesLimit) {
      const time = Date.now()
      const startFromScratch = !cursor && !resumeAtCursor
      let documents
      let query = {}

      if (startFromScratch) {
        documents = await collection.find(query, { sort, limit }).toArray()
        if (!documents.length) throw new Error('Database has no documents')
      } else {
        if (resumeAtCursor) {
          query = { [cursorField]: { $lt: resumeAtCursor } }
          resumeAtCursor = null
        } else {
          query = { [cursorField]: { $lt: cursor } }
        }

        console.log()
        console.log('Fetching documents...')
        documents = await collection.find(query, { sort, limit }).toArray()
      }

      const { updatedCursor, next } = await processDocuments({ collection, documents, cursorField, status })

      cursor = updatedCursor
      hasNext = !!next

      console.log(`Finished processing current batch (Time: ${(Date.now() - time) / 1000} secs)`)
    }
    // END paginated processing

    console.log(`Finished processing schema for collection '${collectionName}'`)
    console.log(`Total analysed: ${status.totalAnalysed}`)

    await processSchemaResult({ currentDb: db, status })
  } catch (error) {
    console.log(error)

    await processSchemaResult({
      status,
      partialResult: true,
      partialSaveReason: error.message
    })
  }

  process.exit(0)
}

// Error handlers
process.on(exitEvents.SIGINT, async () => {
  console.log('Process stopped by the user')

  await processSchemaResult({
    status,
    partialResult: true,
    partialSaveReason: exitEvents.SIGINT
  })
  process.exit(0)
})

process.on(exitEvents.UNHANDLED_REJECTION, async (error) => {
  let retries = 0
  try {
    console.log('Process stopped by an unexpected error')
    console.log(error)

    await processSchemaResult({
      status,
      partialResult: true,
      partialSaveReason: exitEvents.UNHANDLED_REJECTION
    })
  } catch (error) {
    if (retries < 5) {
      console.log(error)
      retries++
    }
  }
  process.exit(0)
})

analyse()
