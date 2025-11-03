export async function safeDownload(
  blob: Blob,
  filename: string,
  mimeType: string = 'application/octet-stream',
): Promise<void> {
  const isNativeApp =
    typeof window !== 'undefined' && (window as any).isNativeApp === true
  const hasNativeDownload =
    isNativeApp && typeof (window as any).nativeApp?.downloadFile === 'function'

  if (hasNativeDownload) {
    const base64Data = await blobToBase64(blob)
    ;(window as any).nativeApp.downloadFile({
      base64Data,
      filename,
      mimeType,
    })
  } else {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'

    try {
      document.body.appendChild(a)
      a.click()
    } finally {
      URL.revokeObjectURL(url)
      if (document.body.contains(a)) {
        document.body.removeChild(a)
      }
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function safeDownloadFromUrl(
  url: string,
  filename: string,
  mimeType: string = 'application/octet-stream',
): Promise<void> {
  const isNativeApp =
    typeof window !== 'undefined' && (window as any).isNativeApp === true
  const hasNativeDownload =
    isNativeApp && typeof (window as any).nativeApp?.downloadFile === 'function'

  if (hasNativeDownload) {
    const response = await fetch(url)
    const blob = await response.blob()
    await safeDownload(blob, filename, mimeType)
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'

    try {
      document.body.appendChild(a)
      a.click()
    } finally {
      if (document.body.contains(a)) {
        document.body.removeChild(a)
      }
    }
  }
}
