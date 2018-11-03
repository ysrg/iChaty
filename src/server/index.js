const express = require('express');

const app = express()
const server = require('http').Server(app);

const io = module.exports.io = require('socket.io')(server)
const SocketManager = require('./socketManager')
app.use(express.static(`build`))
const PORT = process.env.PORT || 3231
io.on('connection', SocketManager)
server.listen(PORT)
