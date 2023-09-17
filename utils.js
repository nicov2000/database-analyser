import { ObjectId } from 'mongodb'

/**
 * The sleep function returns a promise that resolves after a specified number of milliseconds.
 * @param ms - The parameter "ms" stands for milliseconds. It represents the number of milliseconds
 * that the function should wait before resolving the promise.
 * @returns a Promise object.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Equal check (does not work with functions or symbol as inputs)
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Types serialization --------------------------------------------
const serializedTypes = {
  // primitives
  UNDEFINED: 'undefined',
  NULL: 'null',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  BIGINT: 'bigint',
  SYMBOL: 'symbol',
  // non primitives
  DATE_OBJECT: 'Date object',
  REG_EXP_OBJECT: 'RegExp object',
  FUNCTION_OBJECT: 'Function object',
  ARRAY_OBJECT: 'Array object',
  OBJECT: 'object',
  DIFFS_OBJECT: 'Diffs object',
  OBJECT_ID: 'Object Id'
}

// Type getter functions ------------------------------------------
const isUndefined = (value) => value === undefined
const isNull = (value) => value === null
const isString = (value) => typeof value === 'string'
const isNumber = (value) => typeof value === 'number'
const isBoolean = (value) => typeof value === 'boolean'
const isBigInt = (value) => typeof value === 'bigint'
const isSymbol = (value) => typeof value === 'symbol'
const isPrimitive = (value) => isUndefined(value) || isNull(value) || isString(value) || isNumber(value) || isBoolean(value) || isBigInt(value) || isSymbol(value)
const isDate = (value) => value instanceof Date
const isRegExp = (value) => value instanceof RegExp
const isFunction = (value) => typeof value === 'function'
const isArray = (value) => Array.isArray(value)
const isObject = (value) => typeof value === 'object' && !isArray(value) && !isRegExp(value) && !isDate(value) && !isPrimitive(value)
const isDiffsObject = (value) => isObject(value) && value.diffsObjectMetadata && value.diffsObjectMetadata.type === serializedTypes.DIFFS_OBJECT
const isObjectId = (value) => value instanceof ObjectId

// Get primitive type ---------------------------------------------
function getPrimitiveType (value) {
  if (isUndefined(value)) {
    return serializedTypes.UNDEFINED
  } else if (isNull(value)) {
    return serializedTypes.NULL
  } else if (isString(value)) {
    return serializedTypes.STRING
  } else if (isNumber(value)) {
    return serializedTypes.NUMBER
  } else if (isBoolean(value)) {
    return serializedTypes.BOOLEAN
  } else if (isBigInt(value)) {
    return serializedTypes.BIGINT
  } else if (isSymbol(value)) {
    return serializedTypes.SYMBOL
  } else {
    throw new Error(`Type '${typeof value}' is not primitive`)
  }
}

// Get type -------------------------------------------------------
export function getType (value) {
  if (isPrimitive(value)) {
    return getPrimitiveType(value)
  } else if (isDate(value)) {
    return serializedTypes.DATE_OBJECT
  } else if (isRegExp(value)) {
    return serializedTypes.REG_EXP_OBJECT
  } else if (isFunction(value)) {
    return serializedTypes.FUNCTION_OBJECT
  } else if (isArray(value)) {
    return serializedTypes.ARRAY_OBJECT
  } else if (isDiffsObject(value)) {
    return serializedTypes.DIFFS_OBJECT
  } else if (isObjectId(value)) {
    return serializedTypes.OBJECT_ID
  } else if (isObject(value)) {
    return serializedTypes.OBJECT
  } else {
    return `Type ${typeof value} not contemplated for field '${value}'`
  }
}

// Get types and nested types (recursive) -------------------------
export function getFieldsTypes (value) {
  let result = {}

  if (isPrimitive(value)) {
    result = getPrimitiveType(value)
  } else if (isDate(value)) {
    result = serializedTypes.DATE_OBJECT
  } else if (isRegExp(value)) {
    result = serializedTypes.REG_EXP_OBJECT
  } else if (isFunction(value)) {
    result = serializedTypes.FUNCTION_OBJECT
  } else if (isObjectId(value)) {
    return serializedTypes.OBJECT_ID
  } else if (isArray(value)) { // recursive
    result = value.map(value => getFieldsTypes(value))
  } else if (isObject(value)) { // recursive
    for (const key in value) {
      result[key] = getFieldsTypes(value[key])
    }
  } else {
    result = `Type ${typeof value} not contemplated for field '${value}'`
  }

  return result
}

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

let recursions = 0
function mergeStructures (patternStructure, newStructure, { debug = false } = {}) {
  if (debug) {
    console.dir({
      patternStructure,
      newStructure,
      equal: equal(patternStructure, newStructure),
      sameType: getType(patternStructure) === getType(newStructure),
      areArrays: isArray(patternStructure) && isArray(newStructure),
      areObjects: isObject(patternStructure) && isObject(newStructure),
      types: {
        patternStructure: getType(patternStructure),
        newStructure: getType(newStructure)
      },
      recursions: recursions++
    }, { depth: null })
  }
  let result

  if (equal(patternStructure, newStructure)) {
    result = patternStructure // whichever works
  } else {
    // CHECK DIFFERENCES
    const sameType = getType(patternStructure) === getType(newStructure)

    if (sameType) {
      // Check complex datatypes first (take whichever for type check)
      // Can't be both 'DiffsObject' at same time (only one, the FIRST one, can be at this stage)
      if (isArray(patternStructure)) {
        // concat arrays
        const newItems = newStructure.filter(value => !patternStructure.includes(value))
        patternStructure.push(...newItems)

        // generalize array values structure
        const generalStructure = [patternStructure.reduce((acum, value) => mergeStructures(acum, value))]

        result = generalStructure
      } else if (isObject(patternStructure)) {
        for (const key in newStructure) {
          if (!patternStructure[key]) { // add
            patternStructure[key] = newStructure[key]
          } else if (!equal(patternStructure[key], newStructure[key])) { // merge
            patternStructure[key] = mergeStructures(patternStructure[key], newStructure[key], { currentKey: key })
          }
          // ignore missing patternStructure keys in newStructure
        }
        result = patternStructure
      } else {
        result = patternStructure // whichever is ok
      }
    } else { // type differs
      const diffsObject = new DiffsObject()
      if (isDiffsObject(patternStructure)) {
        // load previous state
        diffsObject.setState(patternStructure)
        diffsObject.addVariant(newStructure)
      } else {
        // add first variants
        diffsObject.addVariant(patternStructure)
        diffsObject.addVariant(newStructure)
      }

      result = diffsObject.serialize() // serialize as normal object
    }
  }

  if (debug) console.dir({ result }, { depth: null })
  return result
}

class DiffsObject {
  constructor () {
    this.diffsObjectMetadata = {
      type: serializedTypes.DIFFS_OBJECT
    }
    this.diffs = {}
    this.nextAvailableSlot = 0
  }

  // methods
  setState ({ diffs }) {
    this.diffs = diffs
    this.nextAvailableSlot = Object.keys(diffs).length
  }

  add (diff) {
    this.diffs[this.nextAvailableSlot] = diff
    this.nextAvailableSlot++
  }

  addVariant (diff) {
    if (isArray(diff)) { // arrays are merged into a single array
      const existingArray = this.getArray()
      if (!existingArray) {
        this.add(diff)
      } else {
        const newDistinctItems = diff.filter(item => !existingArray.includes(item))
        existingArray.push(...newDistinctItems)
      }
    } else { // other values
      const existingDiff = Object.values(this.diffs).map(v => JSON.stringify(v)).includes(JSON.stringify(diff))
      if (!existingDiff) {
        this.add(diff)
      }
    }
  }

  getArray () {
    return Object.values(this.diffs).find(diff => isArray(diff))
  }

  serialize () {
    const { diffsObjectMetadata, diffs, nextAvailableSlot } = this

    return {
      diffsObjectMetadata,
      diffs,
      nextAvailableSlot
    }
  }
}

function removeDiffObjectMetadata (structure) { // expects a structure of types (can be objects, arrays and strings for the types)
  let result

  if (isDiffsObject(structure)) {
    result = {
      note: 'This is a diffs object with several variants for the attribute',
      variants: {
        ...structure.diffs
      }
    }
  } else if (isObject(structure)) { // recursive
    result = {}
    for (const key in structure) {
      result[key] = removeDiffObjectMetadata(structure[key])
    }
  } else if (isArray(structure)) {
    // iterate recursively
    result = structure.map(value => removeDiffObjectMetadata(value))
  } else {
    // normal assignment
    result = structure
  }

  return result
}

// console.log(getType(undefined))
// console.log(getType(null))
// console.log(getType(new Date()))
// console.log(getType(/pepe/))
// console.log(getType(() => console.log(3) ))
// console.log(getType([{ a: 2 }]))
// console.log(getType({ a: 2 }))
// console.log(getType(1))
// console.log(getType("str"))
// console.log(getType(false))

// console.log(getType(BigInt('0x012738912acd')))
// console.log(getType(Symbol(2)))
// console.log(getType(Symbol("trer")))
// console.log(getType(Symbol(true)))

// console.log(getPrimitiveType())
// console.log(isPrimitive({}))

// const diffsObject = new DiffsObject()

// diffsObject.setState({ diffs: {} })
// console.log(diffsObject.serialize())

// diffsObject.addVariant({ name: 'string' })
// console.log(diffsObject.serialize())

// diffsObject.addVariant({ name: 'string', age: 'number' })
// console.log(diffsObject.serialize())

// diffsObject.addVariant(['number', 'string'])
// console.log(diffsObject.serialize())

// diffsObject.addVariant(['number', 'string', 'boolean', { a: 'boolean' }])
// console.dir(diffsObject.serialize(), { depth: null })

// console.log(getType(diffsObject.serialize()))
