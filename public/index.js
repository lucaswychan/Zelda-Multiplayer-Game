const app = require('./server')
const http = require('http')

const server = http.createServer(app)
server.listen(8000, () => {
    console.log(`Server is listening on 8000`)
})