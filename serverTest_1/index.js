var app = require('express')();          // Get app var from express module (node)
var http = require('http').Server(app);  // Using the app base from express (via node) make http var
var io = require('socket.io')(http);     // Using the HTML object construct an io var for socket.io
var fs = require('fs');                  // Filesystem in JS

// Local vars
var messageCounter = 0;


app.get('/', function(req, res){
  
  // Look this line works but don't do it.
  //res.send('<!DOCTYPE html><html><head><title>Chat server: Admin page</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><script> window.setInterval(function(){ location.reload(); }, 1000); </script><body style="text-align:center;"><h1>Server Test</h1><h4>Messages Recieved: ' + messageCounter + '</h4></body></html>');
  // res.sendFile(__dirname + "/index.html");
  
  // Track pagevisits
  if(messageCounter % 10 == 0)
  	console.log("Page Requested " + messageCounter + " times!");
});


var port = process.env.PORT;

http.listen(port, "localhost", function(){
  console.log('listening on *:' +  port);
});


// Handle soc
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
