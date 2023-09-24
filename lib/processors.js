import settings from './settings.js'
import { removeDiffObjectMetadata } from '../classes/DiffsObject.js'
import { databaseInstance } from '../database/db.js'
import { mergeStructures } from './structuresMerger.js'
import { getFieldsTypes } from './typesDetection.js'

export async function processDocuments ({
  collection,
  documents,
  status,
  cursorField
}) {
  const { loggingThereshold, samplesLimit } = settings
  let updatedCursor
  let next = null
  let currentDocument

  try {
    if (documents.length) {
      const lastItem = documents[documents.length - 1]
      updatedCursor = lastItem[cursorField]
      if (!updatedCursor && updatedCursor !== 0) {
        console.dir({ missingCursorItem: lastItem }, { depth: null })
        throw new Error(`Missing cursor field '${cursorField}' in last item (cannot continue fetching)`)
      }

      const nextItem = await collection.findOne({ [cursorField]: { $lt: updatedCursor } }, { projection: { [cursorField]: 1 } })

      if (nextItem) {
        next = nextItem[cursorField]
      }
    }

    // merge
    for (const document of documents) {
      if (status.totalAnalysed >= samplesLimit) break // check samplesLimit when iterating the documents batch

      currentDocument = document
      const structure = getFieldsTypes(document)
      if (!status.schema) {
        console.log('No schema set before. Using first document as schema.')
        status.schema = structure
      } else {
        status.schema = mergeStructures(status.schema, structure, { debug: false })
      }

      if (status.totalAnalysed % loggingThereshold === 0) console.log(`Merging schemas... (count: ${status.totalAnalysed})`)
      status.totalAnalysed++
    }
  } catch (error) {
    console.error('processDocuments():')
    console.dir({ documentBeingProcessedWhenErrored: currentDocument }, { depth: 6 })

    throw error
  }

  // Update checkpoint if the whole loop went ok
  status.schemaCheckpoint = status.schema

  console.log(`Merged all schemas in this batch (count: ${status.totalAnalysed})`)
  console.log()
  return { updatedCursor, next }
}

// To save/output final schema or last checkpoint
export async function processSchemaResult ({
  currentDb = null,
  status: {
    schema,
    schemaCheckpoint,
    totalAnalysed
  },
  partialResult = false,
  partialSaveReason = null
} = {}) {
  const { dbName, collectionName, logResult, saveResultToDb, resultsCollectionName } = settings
  const result = {
    creation: new Date(),
    totalAnalysed,
    collectionName
  }

  if (partialResult) {
    Object.assign(result, {
      partialSchema: removeDiffObjectMetadata(schemaCheckpoint),
      partialSaveReason,
      processablePartialSchema: schemaCheckpoint
    })
  } else {
    Object.assign(result, {
      finalSchema: removeDiffObjectMetadata(schema),
      processableFinalSchema: schema
    })
  }

  let id
  if (saveResultToDb) {
    let db
    if (!currentDb) {
      const { db: newDbInstance } = await databaseInstance({ dbName })
      db = newDbInstance
    } else {
      db = currentDb
    }

    const { insertedId } = await db.collection(resultsCollectionName).insertOne(result)
    console.log(`Saved last schema checkpoint (id: ${insertedId})`)
    id = insertedId
  }

  if (logResult) {
    if (saveResultToDb) result._id = id.toString()
    console.dir({ result }, { depth: null })
  }
}
