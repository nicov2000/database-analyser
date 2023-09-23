import { removeDiffObjectMetadata } from './classes/DiffsObject.js'
import { databaseInstance } from './database/db.js'
import { colored } from './utils/colors.js'
import { mergeStructures } from './utils/structuresMerger.js'
import { getFieldsTypes } from './utils/typesDetection.js'

const settings = {
  collectionName: 'transactions',
  cursorField: 'txId',
  sortDir: -1,
  paginationLimit: 10000
}

let totalAnalysed = 0

export async function analyse () {
  const { cursorField, sortDir, paginationLimit: limit, collectionName } = settings
  const sort = { [cursorField]: sortDir }

  let schema = null
  let schemaCheckpoint = null
  let hasNext = true
  let cursor

  console.log('Target collection: ' + colored(collectionName))
  console.log('Cursor field: ' + colored(cursorField))
  console.log('Sort dir: ' + colored(sortDir))
  console.log('Pagination limit: ' + colored(limit))
  try {
    const { db } = await databaseInstance()
    const collection = db.collection(collectionName)
    const estimatedCount = await collection.estimatedDocumentCount()

    console.log('Documents inside collection (aprox): ' + colored(estimatedCount))
    console.log('Starting process...')

    while (hasNext) {
      let documents
      if (!cursor) {
        documents = await collection.find({}, { sort, limit }).toArray()
        if (!documents.length) throw new Error('Database has no documents')
      } else {
        const query = { [cursorField]: { $lt: cursor } }

        console.log('Fetching more documents...')
        documents = await collection.find(query, { sort, limit }).toArray()
      }

      const {
        newSchema,
        newSchemaCheckpoint,
        updatedCursor,
        next
      } = await processDocuments({ collection, documents, schema, cursorField })

      schema = newSchema
      schemaCheckpoint = newSchemaCheckpoint
      cursor = updatedCursor
      hasNext = !!next
    }

    console.log(`Finished. Total analysed: ${totalAnalysed}`)

    const result = {
      creation: new Date(),
      totalAnalysed,
      [collectionName]: removeDiffObjectMetadata(schema)
    }

    console.log(`Saving schema for collection "${collectionName}"...`)

    await db.collection('schemas').insertOne(result)

    console.log('Done.')
    console.dir(result, { depth: null })
    process.exit(0)
  } catch (error) {
    console.error('Error analysing schema:', error)

    // save partial result
    const partialResult = {
      creation: new Date(),
      totalAnalysed,
      schemaCheckpoint: true,
      error: error.message, // check later how to save error
      [collectionName]: removeDiffObjectMetadata(schemaCheckpoint)
    }

    const { db } = await databaseInstance()
    const { insertedId } = await db.collection('schemasCheckpoints').insertOne(partialResult)
    console.log(`Saved last schema checkpoint before erroring (id: ${insertedId})`)
    console.dir(schemaCheckpoint, { depth: null })
    process.exit(0)
  }
}

async function processDocuments ({ collection, documents, schema, cursorField }) {
  let updatedCursor
  let newSchema = schema
  let next = null

  if (documents.length) {
    const lastItem = documents[documents.length - 1]
    updatedCursor = lastItem[cursorField]
    if (!updatedCursor) throw new Error(`Missing cursor field ${cursorField} for item ${lastItem}`)

    const nextItem = await collection.findOne({ [cursorField]: { $lt: updatedCursor } }, { projection: { [cursorField]: 1 } })

    if (nextItem) {
      next = nextItem[cursorField]
    }
  }

  // merge
  for (const structure of documents.map(getFieldsTypes)) {
    if (!newSchema) {
      console.log('No schema set before. Using first document as schema.')
      newSchema = structure
    } else {
      newSchema = mergeStructures(newSchema, structure, { debug: false })
    }

    if (totalAnalysed % 1000 === 0) console.log(`Merging schemas... (count: ${totalAnalysed})`)
    totalAnalysed++
  }

  // Generate checkpoint if the whole loop went ok
  const newSchemaCheckpoint = newSchema
  return {
    newSchema,
    newSchemaCheckpoint,
    updatedCursor,
    next
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unexpected error:', error)
  process.exit(0)
})

analyse()
