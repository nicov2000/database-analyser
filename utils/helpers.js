// Delay
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Equal check (does not work with functions or symbol as inputs)
export const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export const isJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}
