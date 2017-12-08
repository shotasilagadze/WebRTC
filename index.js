var express = require('express');
var env = require('dotenv').config();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var signaling = io.of('/signaling');

server.listen(process.env.SERVER_PORT);
app.set('view engine', 'ejs');
app.use(express.static('assets'));



signaling.on('connection',function(socket){

	socket.on('add ice candidate', function(data) {
		console.log(data);
	});

	socket.on('set description', function(data) {
		console.log(data);
	});

	socket.on('set answer desc', function(data) {
		console.log(data);
	})


});


app.get('/',function(req,res) {
	res.render('video',{ IP : process.env.IP });
});





