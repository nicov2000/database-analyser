import { removeDiffObjectMetadata } from '../classes/DiffsObject.js'
import { mergeStructures } from '../utils/structuresMerger.js'
import { getFieldsTypes } from '../utils/typesDetection.js'

const stats = {
  totalAnalysed: 0
}

// Get mongo database schema
export function getSchema (documents = [], { debug }) {
  console.log(`Total docs to analyse: ${documents.length}`)

  const structures = documents.map(getFieldsTypes)
  let schema = null

  for (const structure of structures) {
    if (!schema) {
      console.log('No schema defined before. Using first document as schema.')
      schema = structure
      stats.totalAnalysed++
    } else {
      console.log(`Merging (count: ${++stats.totalAnalysed})`)
      schema = mergeStructures(schema, structure, { debug })
    }
  }

  return removeDiffObjectMetadata(schema)
}
