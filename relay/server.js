const express = require('express')
const Gun = require('gun')

const app = express()
const port = process.env.PORT || 8765

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// 健康检查
app.get('/', (req, res) => res.status(200).send('Gun relay is running'))

const server = app.listen(port, () => {
  console.log(`Gun relay server listening on port ${port}`)
})

Gun({ web: server })
