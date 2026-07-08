import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import handler from '../api/ingest.js'

/**
 * Minimal local stand-in for Vercel's serverless runtime, so `npm run dev`
 * works without the Vercel CLI/account. Production deploys run api/ingest.ts
 * as an actual Vercel function -- this file is dev-only.
 */
const PORT = 3001

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.url !== '/api/ingest') {
    res.statusCode = 404
    res.end('Not found')
    return
  }

  let rawBody = ''
  for await (const chunk of req) rawBody += chunk

  const vercelReq = Object.assign(req, {
    body: rawBody ? JSON.parse(rawBody) : {},
  })

  const vercelRes = Object.assign(res, {
    status(code: number) {
      res.statusCode = code
      return vercelRes
    },
    json(payload: unknown) {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(payload))
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await handler(vercelReq as any, vercelRes as any)
})

server.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`)
})
