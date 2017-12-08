var express = require('express');
var env = require('dotenv').config();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var signaling = io.of('/signaling');

server.listen(process.env.SERVER_PORT);
app.set('view engine', 'ejs');
app.set('view engine', 'ejs');
app.use(express.static('assets'));



signaling.on('connection',function(socket){
 	console.log("Connected");
});


app.get('/',function(req,res) {
	res.render('video',{ IP : process.env.IP });
});





