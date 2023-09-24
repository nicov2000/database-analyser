import { DiffsObject } from '../classes/DiffsObject.js'
import { equal } from '../utils/helpers.js'
import { getType, isArray, isDiffsObject, isObject, isString } from './typesDetection.js'

const debugMetrics = {
  recursions: 0
}

// Structures merger -------------------------
export function mergeStructures (patternStructure, newStructure, { debug = false } = {}) {
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
      recursions: debugMetrics.recursions++
    }, { depth: null })
  }

  // Start
  let result

  // Case 1: equal
  if (equal(patternStructure, newStructure)) {
    result = patternStructure // pick anyone
  } else {
    // Case 2: Find differences
    const sameType = getType(patternStructure) === getType(newStructure)

    // Case 2.1: Same type
    if (sameType) {
      // Check if strings first since all types (except objects and arrays) are descripted as strings
      // Then check if are arrays or objects to iterate. Also can't be both 'DiffsObject' at same time (only one, the FIRST one, can be at this stage)

      // Case 2.1.1: Strings (types are noted as strings)
      if (isString(patternStructure)) {
        const notSameString = patternStructure !== newStructure

        // Case 2.1.1.1: Strings differ (eg: 'number' !== 'boolean')
        if (notSameString) {
          // First strings difference found. Generate diffs object
          const diffsObject = new DiffsObject()
          diffsObject.addVariant(patternStructure)
          diffsObject.addVariant(newStructure)

          result = diffsObject.serialize() // serialize
        } else { // Case 2.1.1.2: equal strings
          result = patternStructure // pick anyone
        }
      } else if (isArray(patternStructure)) { // Case 2.1.2: Arrays
        // push to pattern any new structures
        const newItems = newStructure.filter(value => !patternStructure.includes(value))
        patternStructure.push(...newItems)

        // merge array structures into a single general structure
        const generalStructure = [patternStructure.reduce((acum, value) => mergeStructures(acum, value))]

        result = generalStructure
      } else { // Case 2.1.3: Objects
        // Iterate newStructure keys, adding new keys and merging differing keys
        for (const key in newStructure) {
          if (!patternStructure[key]) {
            patternStructure[key] = newStructure[key] // add
          } else if (!equal(patternStructure[key], newStructure[key])) {
            patternStructure[key] = mergeStructures(patternStructure[key], newStructure[key]) // merge
          }
          // Doesnt matter if newStructure lacks keys from patternStructure
        }

        result = patternStructure
      }
    } else { // Case 2.2: Types differ
      // Case 2.2.1: patternStructure is an existent diffs object (previously serialized)
      let diffsObject
      if (isDiffsObject(patternStructure)) {
        diffsObject = new DiffsObject()

        // load previous state
        diffsObject.setState(patternStructure)

        // add variant
        diffsObject.addVariant(newStructure)
      } else { // Case 2.2.2: First difference found. Generate diffs object
        diffsObject = new DiffsObject()

        // add diffs as variants
        diffsObject.addVariant(patternStructure)
        diffsObject.addVariant(newStructure)
      }

      result = diffsObject.serialize() // serialize
    }
  }

  if (debug) console.dir({ result }, { depth: null })
  return result
}
