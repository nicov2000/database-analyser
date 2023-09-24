export const exitEvents = {
  SIGINT: 'SIGINT',
  UNHANDLED_REJECTION: 'unhandledRejection'
}
// TODO: Validate settings
// TODO: Add median when processing database batches
// TODO: Add total time taken
// TODO: distinguish between file and collection when choosing database
// TODO: check arrays merging in new object keys (future same array keys arent being merged into a single structure)

const schemasStorageSettings = {
  dbName: 'schemasDB', // this is the name of the database to store schemas
  resultsCollectionName: 'schemasCollection'
}

export const databaseAnalyserSettings = {
  dbName: schemasStorageSettings.dbName, // this should be the name of the database from which the analysis will be performed
  resultsCollectionName: schemasStorageSettings.resultsCollectionName,
  collectionName: 'transactions',
  cursorField: 'txId',
  sortDir: -1,
  paginationLimit: 30000,
  resumeAtCursor: null,
  loggingThereshold: 10000,
  logResult: true,
  saveResultToDb: true,
  samplesLimit: 999_999_999 // no limit
}

export const fileAnalyserSettings = {
  dbName: schemasStorageSettings.dbName,
  resultsCollectionName: schemasStorageSettings.resultsCollectionName,
  saveResultToDb: true,
  loggingThereshold: 1,
  logResult: true
}
