const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);



app.use(express.json());
app.use('/examples',  express.static('./examples'))
app.use('/dist', express.static('./dist'))
console.log(__dirname)
app.get('/', (req, res)=>{
    res.redirect('/examples')
})


//Accept Client Request
io.on('connection', (socket)=>{
    console.log('Socket Connection Established ID:', socket.id);
})


var server = http.listen(8080, () => {
    console.log('server is running at http://localhost:' + server.address().port);
  });