import fs from 'fs/promises'
import { isJsonString } from './utils/helpers.js'
import { getFieldsTypes, isArray } from './lib/typesDetection.js'
import { mergeStructures } from './lib/structuresMerger.js'
import { processSchemaResult } from './lib/processors.js'
import { fileAnalyserSettings } from './lib/settings.js'
import { generateErrorHandlers } from './lib/errorHandlers.js'

const status = {
  schema: null,
  totalAnalysed: 0
}

async function analyseFile () {
  const filepath = process.argv[2]

  if (!filepath) throw new Error('Invalid file path')

  const rawData = await fs.readFile(`./${filepath}`, { encoding: 'utf8' })
  if (!isJsonString(rawData)) throw new Error('Invalid JSON file provided')

  const data = JSON.parse(rawData)

  generateErrorHandlers(status)
  processFile({ data, filepath, status })
}

export async function processFile ({ data, filepath, status }) {
  console.log()
  console.log(`Start processing file '${filepath}'`)
  const { loggingThereshold } = fileAnalyserSettings

  let current
  try {
    if (isArray(data)) { // process array of jsons
      console.log('File type: Array of JSON')
      console.log()

      current = data[0]
      status.schema = getFieldsTypes(data[0])
      status.totalAnalysed++
      for (const doc of data) {
        current = doc
        status.schema = mergeStructures(status.schema, getFieldsTypes(doc))
        status.totalAnalysed++
        if (status.totalAnalysed % loggingThereshold === 0) console.log(`Merging schemas... (count: ${status.totalAnalysed})`)
      }
    } else { // process json
      console.log('File type: Single JSON')
      current = data
      status.schema = getFieldsTypes(data)
    }

    await processSchemaResult({
      status,
      isFile: true,
      filepath
    })

    console.log()
    console.log(`Finished processing file '${filepath}'`)
    console.log()
  } catch (error) {
    console.log(error)
    console.log({ whenProcessingDoc: current })

    await processSchemaResult({
      status,
      isFile: true,
      filepath,
      partialResult: true,
      partialSaveReason: error.message
    })
  }

  process.exit(0)
}

analyseFile()
