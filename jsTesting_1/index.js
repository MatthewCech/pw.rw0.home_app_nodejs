var app = require('express')();
var http = require('http').Server(app);

var visitorCounter = 0;

app.get('/', function(req, res){
  res.send('<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="text-align:center;"><a href="https://www.youtube.com/embed/oNVfrxkHj1M"><h1>Get Certified Fresh™</h1></a> <h4>Basement Lords Certified: ' + visitorCounter++ + '</h4></body></html>');
  //res.sendFile(__dirname + "/index.html");
  
  // Track pagevisits
  if(visitorCounter % 5 == 0)
  	console.log("Page Requested " + visitorCounter + " times!");
});

var port = process.env.PORT;

http.listen(port, function(){
  console.log('listening on *:' +  port);
});

