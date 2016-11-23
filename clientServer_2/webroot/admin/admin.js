// Variables
var domain   = "http://home.rw0.pw";
var filepath = "/clientServer";
var socket = io(domain, { path: filepath + "/socket.io" });

var messages = -1;
var connections = -1;

socket.on("connect", function(){
	$("#status span").html("Actively Monitoring");
	socket.emit("register-admin");
});


socket.on("messages-recieved-admin", function(messagesCount){
	messages = messagesCount;
	changeText();
});


socket.on("connections-changed-admin", function(connectionsCount){
	connections = connectionsCount;
	changeText();
});


socket.on("boot-admin", function(){
	socket.disconnect();
});

socket.on("disconnect", function(){
	$("#status span").html("DEAD");
	messages = -1;
	connections = -1;
	changeText();
});


function changeText(){
	$("#msg span").html(messages);
	$("#total span").html(connections - 1);
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
