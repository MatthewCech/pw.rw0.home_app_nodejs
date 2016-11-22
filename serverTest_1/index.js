var app = require('express')();          // Get app var from express module (node)
var http = require('http').Server(app);  // Using the app base from express (via node) make http var
var io = require('socket.io')(http);     // Using the HTML object construct an io var for socket.io
var fs = require('fs');                  // Filesystem in JS
var handlebars = require('handlebars');  // Handlebars magic for inserting values into html (.hbs) file.

// Local vars
var messageCounter = 0;
var totalConnections = 0;

// Slow file read plz do not do often sir
var template_src = fs.readFileSync("templates/index.hbs", "utf8");
var template = handlebars.compile(template_src);


// Request for page at "page root"
app.get('/', function(req, res){
  // Look this line works but don't do it.
  //res.send('<!DOCTYPE html><html><head><title>Chat server: Admin page</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><script> window.setInterval(function(){ location.reload(); }, 1000); </script><body style="text-align:center;"><h1>Server Test</h1><h4>Messages Recieved: ' + messageCounter + '</h4></body></html>');
  //res.sendFile(__dirname + "/index.html");
  
  // Construct data object, give to pre-compiled template object, shove data in, then send out the 
  // spewed out result from the template object back to the person requesting the page.
  var data = {
    messageCounter : messageCounter,
    numConnections : totalConnections
  };
  res.send(template(data));


  // Track pagevisits
  if(messageCounter % 10 == 0)
  	console.log("Page Requested " + messageCounter + " times!");
});


// Setup local port to listen to requests on.
var port = process.env.PORT;
http.listen(port, "localhost", function(){
  console.log('listening on *:' +  port);
});


// Handle socket.io connections
io.on('connection', function(socket){
  
  // Keep track of the fact that someone has connected.
  console.log('a user connected');
  totalConnections++;
  
  // Register our disconnect event.
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
