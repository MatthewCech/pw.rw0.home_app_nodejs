// Namespaces
var app = require('express')();          // Get app var from express module (node)
var http = require('http').Server(app);  // Using the app base from express (via node) make http var
var io = require('socket.io')(http);     // Using the HTML object construct an io var for socket.io
var fs = require('fs');                  // Filesystem in JS
var handlebars = require('handlebars');  // Handlebars magic for inserting values into html (.hbs) file.

// Local variables
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
    
    // Handle client vs admin
    if(socket.id == currAdmin)
      currAdmin = null;
    else
      DisconnectUser(socket.id);

    --totalConnections;
    SendAdmin("connections-changed-admin", totalConnections);
  });


  // Send the admin all the current information the server has
  socket.on("register-admin", function(){
    if(currAdmin != null)
      SendAdmin("boot-admin");
    
    // Update everything
    currAdmin = socket.id;
    SendAdmin("connections-changed-admin", totalConnections);
    SendAdmin("messages-recieved-admin", totalMessages);
    SendAdmin("clients-changed-admin", clientsConnected.length);
    SendAdmin("sessions-changed-admin", gameSessions.length);
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
    console.log("Recieved \"client-event\"")
    ++totalMessages;
    SendAdmin("messages-recieved-admin", totalMessages);
    
    if(!VerifyCurrentVersion(socket.id, data))
      return;

    if(data["message-type"] == "newClientConnect")
      NewClientConnect(socket.id, data);

    else if(data["message-type"] == "createSession")
      CreateSession(socket.id, data);

    else if(data["message-type"] == "gameEvent")
      StampGameEvent(socket.id, data);

    else if(data["message-type"] == "ping")
      PongMessage(socket.id, data);

    else if(data["message-type"] == "disconnect")
      DisconnectUser(socket.id);
  });

  socket.on("server-command", function(data){
    console.log("server command attempted");

  if(data["message-type"] == "getServerList")
    GetClientList(socket.id);
  });
});


// Server Vars
var clientsConnected=[];
var gameSessions=[];
var API_VERSION = 1;
var nextSessionID = 1;

  ///////////////////////////
 // Game Server Functions //
///////////////////////////
function SendClient(socketID, data){
  io.to(socketID).emit('client-command-verified', data);
}

function SendClientList(socketID){
  console.log("Sending client list of length " + clientsConnected.length);
  io.to(socketID).emit('server-command-verified', clientsConnected);
}

function GetClientList(socketID){
  SendClientList(socketID);
}

// Check through array and see if it has an object.
function ArrayHas(arr, toCheck){
  return arr.indexOf(toCheck) > -1;    
}



// Verify the current version of the API being used.
// At this point, we only accept the current version 
// and nothing else.
function VerifyCurrentVersion(socketID, data){
  if(data["api"] == undefined 
    || data["session-id"] == undefined
    || data["client-id"] == undefined
    || data["message-type"] == undefined  
    || data["timestamp"] == undefined 
    || data["message"] == undefined)
  {
    console.log(data);
    console.log("WARNING: JSON Field(s) missing!");
    return false;
  }

  if(data["api"] != API_VERSION)
  {
    console.log("WARNING: API Version does not match!");
    data["message"] = "WARNING: API Version does not match!";
    SendClient(socketID, data);
    return false;
  }

  return true;
}


// Handle new client connections.
// If the client does not exist, we add it to the list of available sockets.
// If the client does, we don't add it, but we reply with its ID anyways.
// Will prevent duplicates should they occur.
function NewClientConnect(socketID, data){
  console.log("New client connection attempted, socketID " + socketID);

  // Add client with a recognizable name
  // var client = { id: socketID } ;//, name: data["message"] };
  if(!ArrayHas(clientsConnected, socketID))
  {
    console.log("Pushing to the back of connected list");
    clientsConnected.push(socketID);
    SendAdmin("clients-changed-admin", clientsConnected.length);
  }

  data["client-id"] = socketID;

  // Return the updated client information
  SendClient(socketID, data);
}


// Checks if a session exists in the session aray, between two socket IDs regardless
// of orientation in the vector.
function SessionExists(id1, id2)
{
  var i = 0;
  for(i = 0; i < gameSessions.length; ++i)
  {
    if(gameSessions[i]["ID1"] == id1 && gameSessions[i]["ID2"] == id2)
      return true;

    if(gameSessions[i]["ID1"] == id2 && gameSessions[i]["ID2"] == id1)
      return true;
  }

  return false;
}


// Attempts to create a session between the socketID of the current socket and the specified
// ID of the other person specified in the message field of the JSON object.
// The new pair is added to the gameSessions array, with sessionID, ID1, and ID2.
function CreateSession(socketID, data)
{
  var otherSocketID = data["message"];
  console.log("Attempted to create session: " + socketID + ", " + otherSocketID);
  
  // Check if opponent exists in the player list
  var opponentLoc = clientsConnected.indexOf(otherSocketID);
  if(opponentLoc <= -1)
  {
    console.log("WARNING: Requested Opponent " + otherSocketID + "could not be found.");
    return;
  }

  // Check if we exist in the player list
  var playerLoc = clientsConnected.indexOf(socketID);
  if(playerLoc <= -1)
  {
    console.log("WARNING: Player socketID " + socketID + " is not a registered connected client.");
    return;
  }

  // Create session if it does not exist.  
  var sid = ++nextSessionID;
  var newObj = {sessionID: sid, ID1: socketID, ID2: otherSocketID};
  if(!SessionExists(socketID, otherSocketID))
  {
    data["session-id"] = sid;
    gameSessions.push(newObj);
    SendAdmin("sessions-changed-admin", gameSessions.length);
  }
  else
  {
    var warn = "WARNING: Session already exists!";
    console.log(warn);
    data["message"] = warn; 
    SendClient(socketID, data);
  }

  SendClient(socketID, data);
  SendClient(otherSocketID, data);
}


// Gets the location of a specific sessionID in the sessions array
function GetSessionLoc(sid)
{
  for(var i = 0; i < gameSessions.length; ++i)
    if(gameSessions[i].sessionID == sid)
      return i;

  return -1;
}


// Stamps a game event from one of the game event pairs and sends it out to both of the
// people in the group specified by the `session-id` field.
function StampGameEvent(socketID, data)
{
  console.log("Attempting to deal with a gameEvent from " + socketID);

  // Ensure session was specified
  if(data["session-id"] == 0)
  {
    console.log("WARNING: Session ID was 0 for socket " + socketID);
    return;
  }

  // Get location in session array
  var index = GetSessionLoc(data["session-id"]);
  if(index == -1)
  {
    console.log("WARNING: Session requested, " + data["session-id"] + ", did not exist!");
    return;
  }

  // Send message to both after stamping
  data["timestamp"] = Date.now(); 
  SendClient(gameSessions[index].ID1, data);
  SendClient(gameSessions[index].ID2, data);
}


// Stamps the message field of a ping command with the time the server thinks it is.
// Message type is also changed to pong, this is the only time a message type is ever changed.
function PongMessage(socketID, data)
{
  console.log("Ping from " + socketID + " recieved!");
  data["message-type"] = "pong";
  data["timestamp"] = Date.now();
  SendClient(socketID, data);
}


// Creates a default JSON client message to be sent
function DefaultData(){
    var data = {
    "api"          : API_VERSION,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "",
    "timestamp"    : 0,
    "message"      : ""
  };

  return data;
}


// Remvoes the selected user ID from the sessions list where they appear in groups.
// Alerts the other user that this person has been disconnected by populating the
// "message" field with the user ID of the person disconnecting.
function RemoveFromSessions(uID)
{
  // Construct event to send out
  var msg = DefaultData();
  msg["message"] = uID;

  // Disconnect and alert those other than this user.
  for(var i = 0; i < gameSessions.length;)
  {
    if(gameSessions[i].ID1 == uID)
    {
      SendClient(gameSessions[i].ID2, msg);
      gameSessions.splice(i, 1);
    }
    else if(gameSessions[i].ID2 == uID)
    {
      SendClient(gameSessions[i].ID1, msg);
      gameSessions.splice(i, 1);
    }
    else
      ++i;
  }
}


// Disconnects the specified socketID
function DisconnectUser(socketID)
{
  console.log("Client Disconnecting: " + socketID);
  RemoveFromSessions(socketID);

  for(var i = 0; i < clientsConnected.length; ++i)
    if(clientsConnected[i] == socketID)
    {
      clientsConnected.splice(i, 1);
      break;
    }
  
  // Update information and inform user they've disconnected.
  var msg = DefaultData();
  msg["message"] = socketID;
  SendAdmin("sessions-changed-admin", gameSessions.length);
  SendAdmin("clients-changed-admin", clientsConnected.length);
  SendClient(socketID, msg);
}
