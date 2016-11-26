// Variables
var domain   = "http://home.rw0.pw";
var filepath = "/clientServer";
var socket = io(domain, { path: filepath + "/socket.io" });


// Called to change the text in the relevant h4 element
function ChangeText(){
  var input = document.getElementById("toSend").value;
  console.log("Attempting to send: " + input);
  socket.emit('message-event', { data: input });
  document.getElementById("toChange").innerHTML = "Sent: " + input;
}

function MockClientConnect(){
  console.log("Attempting to perform mock client connection");
  
    
  var data = {
    "api"          : 1,
    "session-id"   : 0,
    "client-id"    : 0,
    "message-type" : "newClientConnect",
    "timestamp"    : 0,
    "message"      : ""
  }
  

  socket.emit("client-command", data);
}