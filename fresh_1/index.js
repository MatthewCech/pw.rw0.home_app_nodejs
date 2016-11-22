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


app.get('/loaderio-1faf17299ebdeac8f9ac10a5a5e2e659.txt', function(req, res){
  res.sendFile(__dirname + "/loaderio-1faf17299ebdeac8f9ac10a5a5e2e659.txt");

});

app.get('/loaderio-fe8638f46950b37b0a1adbd8a96c53b6.txt', function(req, res){
  res.sendFile(__dirname + "/loaderio-fe8638f46950b37b0a1adbd8a96c53b6.txt");

});

var port = process.env.PORT;

http.listen(port, "localhost", function(){
  console.log('listening on *:' +  port);
});

