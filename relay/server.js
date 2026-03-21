const express = require('express')
const Gun = require('gun')

const app = express()
const port = process.env.PORT || 8765

const IMGLOC_API_URL = 'https://imgloc.com/api/1/upload'
const IMGLOC_API_KEY = process.env.IMGLOC_API_KEY || 'chv_Duh0_9ab83f6a46fc68cd37b4a1a6c24e048d2291e8f52ee44f86a5d011e3855ff1379ca240ade3fddc8931a0d31234089687736166e44696e52e62bf671c55c60f3b'

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// 健康检查
app.get('/', (req, res) => res.status(200).send('Gun relay is running'))

// 图片上传代理 — 转发到 imgloc.com 绕过 CORS
app.post('/api/upload', (req, res) => {
  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', async () => {
    try {
      const body = Buffer.concat(chunks)
      const contentType = req.headers['content-type']
      const resp = await fetch(IMGLOC_API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': IMGLOC_API_KEY,
          'Content-Type': contentType,
        },
        body,
      })
      const data = await resp.json()
      res.status(resp.status).json(data)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

const server = app.listen(port, () => {
  console.log(`Gun relay server listening on port ${port}`)
})

Gun({ web: server })
