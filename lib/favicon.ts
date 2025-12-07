/**
 * Validates if a string is a valid HTTP(S) URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

/**
 * Fetches a favicon for a given URL and converts it to a base64 data URL
 *
 * @param url - The website URL to fetch favicon for
 * @returns Base64 data URL of the favicon, or empty string on failure
 */
export async function fetchFaviconAsDataUrl(url: string): Promise<string> {
  try {
    // Validate URL first
    if (!isValidUrl(url)) {
      console.warn("Invalid URL for favicon fetch:", url)
      return ""
    }

    // Extract domain
    const domain = new URL(url).hostname

    // Fetch from Google's favicon service (32x32 for smaller size)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const response = await fetch(faviconUrl, {
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to fetch favicon for ${domain}:`, response.status)
      return ""
    }

    // Get blob
    const blob = await response.blob()

    // Check size (limit to 100KB)
    if (blob.size > 100 * 1024) {
      console.warn(`Favicon too large for ${domain}:`, blob.size)
      return ""
    }

    // Convert to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (typeof result === "string") {
          resolve(result)
        } else {
          reject(new Error("Failed to convert favicon to data URL"))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    // Silent failure - favicons are non-critical
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Favicon fetch timed out for:", url)
    } else {
      console.error("Error fetching favicon:", error)
    }
    return ""
  }
}
