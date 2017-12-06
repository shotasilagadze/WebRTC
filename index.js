var https = require('https');
var fs = require('fs');
var express = require('express');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";




 
var options = {
  key: fs.readFileSync('privateKey.key'),
  cert: fs.readFileSync('certificate.crt')
};
 
https.createServer(options, function (req, res) {
  res.writeHead(200);
    res.end("hello world\n");
  

}).listen(9090);
 
console.log("listening to port 8000");
