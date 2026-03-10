function normalizeIpcError(message: string) {
  return message
    .replace(/^Error invoking remote method '[^']+':\s*/i, '')
    .replace(/^(\w+):\s*/i, (_full, code: string) => {
      return code === 'Error' ? '' : ''
    })
    .trim()
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const normalized = normalizeIpcError(error.message)
    return normalized || 'Unknown error'
  }
  return 'Unknown error'
}
