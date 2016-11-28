// Namespaces
var domain   = "http://home.rw0.pw";
var filepath = "/clientServer";
var socket = io(domain, { path: filepath + "/socket.io" });

// Variables
var APIVer = 1;
var myID = -1;
var sessionID = -1;


// Handle server command verification
socket.on("server-command-verified", function(data){
  console.log("Got verified server command, recieved:");
  console.log(data);
  console.log("myID = " + myID);
  var i = 0;
  for(i = 0; i < data.length; ++i)
    if("" + data[i] != "" + myID)
      otherUser.value = data[i];
});

// Possible message-type Contents:
// gameEvent
// newClientConnect
// disconnect
// createSession
// ping
socket.on("client-command-verified", function(data){
  console.log("Got verified client command, recieved:")
  console.log(data);
  
  if(data["message-type"] == "gameEvent")
    $("#msg span").html(data["message"] + " ts: " + data["timestamp"]);

  else if(data["message-type"] == "newClientConnect")
    myID = data["client-id"];

  else if(data["message-type"] == "createSession")
    sessionID = data["session-id"];

  else if(data["message-type"] == "pong")
    $("#pingButton span").html((Date.now() - data["message"]) + "ms");
});

// Called to change the text in the relevant h4 element
function ChangeText(){
  var input = document.getElementById("toSend").value;
  console.log("Attempting to send: " + input);
  socket.emit('message-event', { data: input });
  document.getElementById("toChange").innerHTML = "Sent: " + input;
}


  //////////////////////////////////////
 // Client Command Version 1 support //
//////////////////////////////////////
function MockClientConnect(){
  console.log("Attempting to perform mock client connection"); 
  var data = {
    "api"          : APIVer,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "newClientConnect",
    "timestamp"    : 0,
    "message"      : ""
  }
  socket.emit("client-command", data);
}

function MockStartSession(){
  var input = document.getElementById("otherUser").value;
  console.log("Attempting to create session between IDs " + myID + " and " + input); 
  var data = {
    "api"          : APIVer,
    "session-id"   : 0,
    "client-id"    : myID,
    "message-type" : "createSession",
    "timestamp"    : 0,
    "message"      : input
  }
  socket.emit("client-command", data);
}

function MockGameEvent(){
  console.log("Attempting to mock a game event, assuming session exists."); 
  var input = document.getElementById("gameEventInput").value;
  var data = {
    "api"          : APIVer,
    "session-id"   : sessionID,
    "client-id"    : myID,
    "message-type" : "gameEvent",
    "timestamp"    : 0,
    "message"      : input
  }
  socket.emit("client-command", data);
}

function PingServer(){
  console.log("Attempting Ping!"); 
  var time = Date.now();
  var data = {
    "api"          : APIVer,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "ping",
    "timestamp"    : 0,
    "message"      : time
  }
  socket.emit("client-command", data);
}

function RequestDisconnect(){
  console.log("Requesting Full disconnect.");
  var data = {
    "api"          : APIVer,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "disconnect",
    "timestamp"    : 0,
    "message"      : ""
  }
  socket.emit("client-command", data);
}

  //////////////////////////////////////
 // Server Command Version 1 Support //
//////////////////////////////////////
function MockGetClientList(){
  console.log("Attempting to get client list from server");  
  var data = {
    "api"          : APIVer,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "getServerList",
    "timestamp"    : 0,
    "message"      : ""
  }
  socket.emit("server-command", data);
}