var app = require('express')();          // Get app var from express module (node)
var http = require('http').Server(app);  // Using the app base from express (via node) make http var
var io = require('socket.io')(http);     // Using the HTML object construct an io var for socket.io
var fs = require('fs');                  // Filesystem in JS
var handlebars = require('handlebars');  // Handlebars magic for inserting values into html (.hbs) file.

// Local vars
var totalMessages = 0;
var totalConnections = 0;

// Slow file read plz do not do often sir
var template_src = fs.readFileSync("templates/index.hbs", "utf8");
var template = handlebars.compile(template_src);


// Request for page at "page root"
app.get('/', function(req, res){
  // Construct data object, give to pre-compiled template object, shove data in, then send out the 
  // spewed out result from the template object back to the person requesting the page.
  var data = {
    messageCounter : totalMessages,
    numConnections : totalConnections
  };
  res.end(template(data));
s

  // Track pagevisits
  if(totalMessages % 10 == 0)
  	console.log("Page Requested " + totalMessages + " times!");
});


// Setup local port to listen to requests on.
var port = process.env.PORT;
http.listen(port, "localhost", function(){
  console.log('listening on *:' +  port);
});


// MOVE THIS DOWN BELOW FUNC TO TEST LATER
var currAdmin = null;
function SendAdmin(eventName, value)
{
  if(currAdmin == null) 
    return;

  io.to(currAdmin).emit(eventName, value);
}

// Handle socket.io connections
io.on('connection', function(socket){
  
  // Keep track of the fact that someone has connected.
  console.log('a user connected');

  ++totalConnections; 
  SendAdmin("connections-changed-admin", totalConnections);


  // Register our disconnect event.
  socket.on('disconnect', function(){
    console.log('user disconnected');
    
    if(socket.id == currAdmin)
      currAdmin = null;

    --totalConnections;
    SendAdmin("connections-changed-admin", totalConnections);
  });


  socket.on("register-admin", function(){
    if(currAdmin != null)
      SendAdmin("boot-admin");
    
    currAdmin = socket.id;
    SendAdmin("connections-changed-admin", totalConnections);
    SendAdmin("messages-recieved-admin", totalMessages);
  });


  // Process message events 
  socket.on('message-event', function (data){
    console.log(data);
    
    ++totalMessages;
    SendAdmin("messages-recieved-admin", totalMessages);
  });
});
