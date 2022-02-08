var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/assets'));
app.use(express.json());


//Accept Client Request
io.on('connection', (socket)=>{
    console.log('Socket Connection Established ID:', socket.id);
})


var server = http.listen(8080, () => {
    console.log('server is running on port', server.address().port);
  });