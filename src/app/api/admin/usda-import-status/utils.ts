export let sharedImportStatus = {
  isDownloading: false,
  isParsing: false,
  isImporting: false,
  progress: 0,
  currentStep: '',
  logs: [] as string[],
}

// Function to update status (called by other endpoints)
export function updateImportStatus(status: Partial<typeof sharedImportStatus>) {
  sharedImportStatus = { ...sharedImportStatus, ...status }
}

// Function to get current status (for other endpoints to check)
export function getCurrentImportStatus() {
  return sharedImportStatus
}
