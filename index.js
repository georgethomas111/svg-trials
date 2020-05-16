const express = require('express')
const plot = require('./plot')
const app = express()
const port = 8080

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send(plot.respBody(req))
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
