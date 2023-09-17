import { newDB } from './db.js'
import { populate, read, drop, analyse, deepAnalyse } from './actions.js'
// import { sleep } from './utils.js'

const actions = {
  populate,
  read,
  drop,
  analyse,
  'deep-analyse': deepAnalyse
}

async function main () {
  const action = process.argv[2]
  if (!Object.keys(actions).includes(action)) {
    const availableActions = Object.values(Object.keys(actions))
    console.log()
    console.log('Available actions:', availableActions)
    console.log()
    process.exit(0)
  }

  try {
    const { collections } = await newDB()

    const res = await actions[action](collections)

    console.log()
    // console.dir(res, { depth: null })
    console.log(res)
    console.log()
  } catch (error) {
    console.log(error)
  } finally {
    process.exit(0)
  }
}

main()
