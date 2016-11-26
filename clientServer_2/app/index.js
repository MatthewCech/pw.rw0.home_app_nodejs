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
  socket.on('message-event', function(data){
    console.log(data);
    
    ++totalMessages;
    SendAdmin("messages-recieved-admin", totalMessages);
  });





    ///////////////////////
   // Game Server Mimic //
  ///////////////////////
  socket.on("client-command", function(data){
    console.log("New client connection attempted!");

    if(!VerifyCurrentVersion(socket.id, data))
      return;

    if(data["message-type"] == "newClientConnect")
      NewClientConnect(socket.id, data);
  });

  socket.on("server-command", function(data){
    console.log("server command attempted");

  if(data["message-type"] == "getServerList")
    GetClientList(socketID);
  });
});


// Server Vars
var clientsConnected=[];
var gameSessions=[];
var API_VERSION = 1;


  ///////////////////////////
 // Game Server Functions //
///////////////////////////
function SendClient(socketID, data){
  io.to(socketID).emit('client-command-verified', data);
}

function SendClientList(socketID){
  io.to(socketID).emit('server-command-verified', data);
}

// Verify the current version of the API being used.
// At this point, we only accept the current version 
// and nothing else.
function VerifyCurrentVersion(socketID, data){
  console.log("Verifying JSON");

  if(data["api"] == undefined 
    || data["session-id"] == undefined
    || data["client-id"] == undefined
    || data["message-type"] == undefined  
    || data["timestamp"] == undefined 
    || data["message"] == undefined)
  {
    console.log(data);
    console.log("Fields missing!");
    return false;
  }

  if(data["api"] != API_VERSION)
  {
    console.log("Invalid Version Detected!");
    data["message"] = "WARNING: API Version does not match!";
    SendClient(socketID, data);
    return false;
  }

  return true;
}


// Handle new client connections.
function NewClientConnect(socketID, data){
  console.log("New client connected, socketID " + socketID);

  // Handle current API version
  if(data.api == API_VERSION)
  {
    // Add client with a recognizable name
    var client = { id: socketID, name: data["message"] };
    if(!$.inArray(client, clientsConnected))
      clientsConnected.push(client);
    data["client-id"] = socketID;
  }
  else
  {
    console.log("API version " + data["api"] + " usage attempted. This is not a supported version.");
    return;
  }

  // Return the updated client information
  SendClient(socketID, data);
}

function GetClientList(socketID){
  SendClientList(socketID);
}

function ArrayHas(arr, toCheck){
  var i;
  for(i = 0; i < arr.length; ++i)
    if(arr[i] === toCheck)
      return true;

  return false;    
}
