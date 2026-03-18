import http from 'http'
import Gun from 'gun'

const port = process.env.PORT || 8765

const server = http.createServer((req, res) => {
  // CORS headers for browser clients
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }))
    return
  }

  // Gun handles the rest
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end('SharedBlacklist Gun Relay')
})

const gun = Gun({ web: server, file: 'data' })

server.listen(port, () => {
  console.log(`Gun relay server running on port ${port}`)
})
