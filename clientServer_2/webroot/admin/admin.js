// Namespaces
var domain   = "http://home.rw0.pw";
var filepath = "/clientServer";
var socket = io(domain, { path: filepath + "/socket.io" });

// Local Variables
var messages = -1;
var connections = -1;
var clients = -1;
var sessions = -1;


  ///////////////////
 // Info updating //
///////////////////
socket.on("messages-recieved-admin", function(messagesCount){
	messages = messagesCount;
	changeText();
});

socket.on("connections-changed-admin", function(connectionsCount){
	connections = connectionsCount;
	changeText();
});

socket.on("clients-changed-admin", function(clientsCount){
	clients = clientsCount;
	changeText();
});

socket.on("sessions-changed-admin", function(sessionsCount){
	sessions = sessionsCount;
	changeText();
});


  ///////////////////////////
 // Connection management //
///////////////////////////
socket.on("connect", function(){
	$("#status span").html("Actively Monitoring");
	socket.emit("register-admin");
});

socket.on("boot-admin", function(){
	socket.disconnect();
});

socket.on("disconnect", function(){
	$("#status span").html("DEAD");
	messages = -1;
	connections = -1;
	clients = -1;
	sessions = -1;
	changeText();
});


// Updates all of the text fields on the webpage with the most current info.
// Uses spans to populate the information, total connections does not count
// the current admin.
function changeText(){
	$("#msg span").html(messages);
	$("#total span").html(connections - 1);
	$("#clients span").html(clients);
	$("#sessions span").html(sessions);
}

// JQuery, on document load.
$( document ).ready(function() {
	changeText();
});

// // Called to change the text in the relevant h4 element
// function changeText(){
//   var input = document.getElementById("toSend").value;
//   console.log("Attempting to send: " + input);
//   socket.emit('messageEvent', { data: input });
//   document.getElementById("toChange").innerHTML = "Sent: " + input;
// }
