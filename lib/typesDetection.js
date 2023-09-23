import { ObjectId } from 'mongodb'

// Types serialization --------------------------------------------
export const serializedTypes = {
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
export const isUndefined = (value) => value === undefined
export const isNull = (value) => value === null
export const isString = (value) => typeof value === 'string'
export const isNumber = (value) => typeof value === 'number'
export const isBoolean = (value) => typeof value === 'boolean'
export const isBigInt = (value) => typeof value === 'bigint'
export const isSymbol = (value) => typeof value === 'symbol'
export const isPrimitive = (value) => isUndefined(value) || isNull(value) || isString(value) || isNumber(value) || isBoolean(value) || isBigInt(value) || isSymbol(value)
export const isDate = (value) => value instanceof Date
export const isRegExp = (value) => value instanceof RegExp
export const isFunction = (value) => typeof value === 'function'
export const isArray = (value) => Array.isArray(value)
export const isObject = (value) => typeof value === 'object' && !isArray(value) && !isRegExp(value) && !isDate(value) && !isPrimitive(value)
export const isDiffsObject = (value) => isObject(value) && value.diffsObjectMetadata && value.diffsObjectMetadata.type === serializedTypes.DIFFS_OBJECT
export const isObjectId = (value) => value instanceof ObjectId

// Get primitive type ---------------------------------------------
export function getPrimitiveType (value) {
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
