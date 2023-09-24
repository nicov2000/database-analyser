export const exitEvents = {
  SIGINT: 'SIGINT',
  UNHANDLED_REJECTION: 'unhandledRejection'
}

export default {
  dbName: 'schemasDB',
  collectionName: 'transactions',
  cursorField: 'txId',
  sortDir: -1,
  paginationLimit: 30000,
  resumeAtCursor: null,
  loggingThereshold: 10000,
  logResult: true,
  saveResultToDb: true,
  resultsCollectionName: 'schemasCheckpoints',
  samplesLimit: 999_999_999 // no limit
}
