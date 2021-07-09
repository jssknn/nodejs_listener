var http = require('http'),
    socketio = require('socket.io'),
    dgram = require('dgram'),
	net = require('net'),
	format = require('date-format');
	
var app = http.createServer(handleRequest),
    io = socketio.listen(app),
    socket = dgram.createSocket('udp4');	
	
var fs = require('fs');
	
var HOST = '127.0.0.1';
var PORT = 6969;

socket.on('message', function(content, rinfo) {
    //console.log('got message', content, 'from', rinfo.address, rinfo.port);
	var datos = format.asString('dd/MM/yyyy hh:mm:ss', new Date()) + ' - '+ content.toString() +' - IP: ' + rinfo.address.toString() +' - Puerto: ' + rinfo.port.toString() + ' UDP\n'
    io.sockets.emit('udp message', datos);
	fs.appendFileSync('log/'+format.asString('dd-MM-yyyy', new Date())+'_log.txt',datos, 'utf8');
});

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    //console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        var datos1 = format.asString('dd/MM/yyyy hh:mm:ss', new Date()) + ' - '+ data.toString() +' - IP: ' + sock.remoteAddress.toString() +' - Puerto: ' + sock.remotePort + ' TCP\n'
        //console.log('DATA ' + sock.remoteAddress + ': ' + data);
		io.sockets.emit('udp message', datos1);
        fs.appendFileSync('log/'+format.asString('dd-MM-yyyy', new Date())+'_log.txt',datos1, 'utf8');
		// Write the data back to the socket, the client will receive it as data from the server
        sock.write('You said "' + data + '"');
        
    });
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        //console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

function handleRequest(req, res) {
    res.writeHead(200, {'content-type': 'text/html', 'Access-Control-Allow-Origin' : '*'});
    res.end("<!doctype html> \
        <html><head> <title>Monitor Puerto 6969</title> <link rel=\"icon\" href=\"https://i.imgur.com/ON9Rqaj.png\">\
        <script src='/socket.io/socket.io.js'></script> \
        <script> \
            var socket = io.connect('localhost:8000', {port: 8000}); \
            socket.on('udp message', function(message) { document.getElementById(\"documento\").innerHTML  +='<div>' + message + '</div>' }); \
        </script></head><body bgcolor=\"#E3E6E9\"><p id=\"documento\"></p></body></html>");
}

socket.bind(6969);
app.listen(8000);

console.log('Servidor escuchando el puerto UDP/TCP: '+ PORT);
