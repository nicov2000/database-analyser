import { processSchemaResult } from './processors.js'
import { exitEvents } from './settings.js'

// Error handlers
export const generateErrorHandlers = (status) => {
  process.on(exitEvents.SIGINT, async () => {
    console.log('Process stopped by the user')

    await processSchemaResult({
      status,
      partialResult: true,
      partialSaveReason: exitEvents.SIGINT
    })
    process.exit(0)
  })

  process.on(exitEvents.UNHANDLED_REJECTION, async (error) => {
    let retries = 0
    try {
      console.log('Process stopped by an unexpected error')
      console.log(error)

      await processSchemaResult({
        status,
        partialResult: true,
        partialSaveReason: exitEvents.UNHANDLED_REJECTION
      })
    } catch (error) {
      if (retries < 5) {
        console.log(error)

        await processSchemaResult({
          status,
          partialResult: true,
          partialSaveReason: exitEvents.UNHANDLED_REJECTION
        })

        retries++
      }
    }
    process.exit(0)
  })
}
