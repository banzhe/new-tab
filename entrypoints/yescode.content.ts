import {
  type ConfigResponse,
  MessageType,
  type SaveConfigMessage,
} from "@/types/messages"

export default defineContentScript({
  matches: ["https://co.yes.vg/*"],
  async main(ctx) {
    const LOG_PREFIX = "[yescode.content]"
    const AUTH_TOKEN_KEY = "authToken"
    const POLL_INTERVAL_MS = 1000
    const MAX_POLLS = 30

    let pollCount = 0

    const maskToken = (token: string) => {
      if (!import.meta.env.DEV) {
        return
      }
      if (token.length <= 8) return "●".repeat(token.length)
      return `${token.slice(0, 4)}${"●".repeat(8)}${token.slice(-4)}`
    }

    const syncAuthTokenToApiKey = async (): Promise<"done" | "continue"> => {
      pollCount += 1

      console.log(`${LOG_PREFIX} sync attempt`, {
        attempt: pollCount,
        href: window.location.href,
      })

      let authToken = window.localStorage.getItem(AUTH_TOKEN_KEY)?.trim()
      if (!authToken) {
        if (pollCount === 1 || pollCount % 5 === 0) {
          console.log(`${LOG_PREFIX} authToken not found in localStorage yet`)
        }
        return "continue"
      }

      authToken = `Bearer ${authToken}`

      if (import.meta.env.DEV) {
        console.log(`${LOG_PREFIX} authToken found`, {
          authToken: maskToken(authToken),
        })
      }


      const response: ConfigResponse = await browser.runtime.sendMessage({
        type: MessageType.GET_CONFIG,
      })
      if (!response.success || !response.data) {
        console.warn(`${LOG_PREFIX} failed to load config`, {
          success: response.success,
        })
        return "continue"
      }

      if (response.data.apiKey === authToken) {
        console.log(`${LOG_PREFIX} apiKey already matches authToken; skipped`)
        return "done"
      }

      await browser.runtime.sendMessage<SaveConfigMessage>({
        type: MessageType.SAVE_CONFIG,
        payload: {
          ...response.data,
          apiKey: authToken,
        },
      })

      console.log(`${LOG_PREFIX} saved authToken into apiKey`)
      return "done"
    }

    console.log(`${LOG_PREFIX} loaded`)

    const firstRun = await syncAuthTokenToApiKey().catch((error) => {
      console.error(`${LOG_PREFIX} initial sync failed`, error)
      return "continue"
    })
    if (firstRun === "done") return

    const intervalId = ctx.setInterval(() => {
      if (pollCount >= MAX_POLLS) {
        console.log(`${LOG_PREFIX} giving up; max polls reached`, {
          max: MAX_POLLS,
        })
        clearInterval(intervalId)
        return
      }

      syncAuthTokenToApiKey()
        .then((result) => {
          if (result === "done") clearInterval(intervalId)
        })
        .catch((error) => {
          console.error(`${LOG_PREFIX} sync failed`, error)
        })
    }, POLL_INTERVAL_MS)
  },
})
