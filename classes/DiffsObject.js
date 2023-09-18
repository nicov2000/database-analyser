import { isArray, isDiffsObject, isObject, serializedTypes } from '../utils/typesDetection.js'

export class DiffsObject {
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

// Expects a types structure (only strings, arrays and objects)
export function removeDiffObjectMetadata (structure) {
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
