// Effectively includes that resolve namespaces.
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Standard variable declarations.
var visitorCounter = 0;

// Request for page
app.get('/', function(req, res){
  //res.send('<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="text-align:center;"><input id="toSend"><button type="button" onclick="changeText()">Go</button><h4 id="toChange">text!</h4></body></html>');
  res.sendFile(__dirname + "/index.html");
  
  // Track pagevisits
  if(visitorCounter % 10 == 0)
  	console.log("Page Requested " + visitorCounter + " times!");
});

// Handle external JS file request. Served on request from index.html, see line 14.
app.get('/my.js', function(req, res){
  res.sendFile(__dirname + "/my.js");
});

/*
app.get('/node_modules/socket.io-client/socket.io.js', function(req, res){
  res.sendFile(__dirname + "/node_modules/socket.io-client/socket.io.js");
});
*/

// On socket connection,
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

// Gets the operating port from the process config
var port = process.env.PORT;
http.listen(port, "localhost", function(){
  console.log('listening on *:' +  port);
});

