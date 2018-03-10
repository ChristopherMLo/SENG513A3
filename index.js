var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(__dirname + "public/index.html");
});

var usernames = [];
var messageHistory = [];

// Incoming connection
io.on('connection', function(socket){

    // Receiving new chat message
    socket.on('chat message', function(msg){

        if (msg.substring(0,6) == "/nick ") {
            let newNick = msg.substring(6,);
            if (usernames.indexOf(newNick) < 0) {
                socket.emit('requestName', newNick);
                usernames.splice(usernames.indexOf(socket.username),1);
                usernames.push(newNick);
                socket.username = newNick;
                io.emit('userChange', usernames);
            }
            else {
                socket.emit('requestName', socket.username);
            }
        }

        else if (msg.substring(0,11) == "/nickcolor ") {
            let newColor = msg.substring(11,17);
            if (/[0-9A-F]{6}$/i.test(newColor)) {
                socket.color = newColor;
            }
        }

        else {
            if (messageHistory.length < 200) {
                messageHistory.push(getTime() + ' ' + socket.username.fontcolor(socket.color) + ': ' + msg)
            }
            else {
                messageHistory.splice(0, 1);
                messageHistory.push(getTime() + ' ' + socket.username.fontcolor(socket.color) + ': ' + msg)
            }


            io.emit('chat message', msg, socket.username, socket.color, getTime());
        }
    });

    socket.on('disconnect', function() {
        if (usernames.indexOf(socket.username) > 0) {
            usernames.splice(usernames.indexOf(socket.username), 1);
            io.emit('userChange', usernames);
            console.log("Disconnected: " + usernames[usernames.indexOf(socket.username)]);
            console.log(usernames);
        }
    });

    // New connection
    socket.on('newConnection', function (name = "User") {
        socket.color = "000000"; //set default color as black
        let tmpuser = name;
        let i = 0;
        while (usernames.includes(tmpuser+i)) {
            i++;
        }
        socket.username = tmpuser+i;
        socket.emit('requestName', tmpuser+i); //Send client its username
        usernames.push(tmpuser+i); //Push new username into username array
        io.emit('userChange', usernames); //Tell all connected users username list has changed
        socket.emit('chatHistory', messageHistory); //Send new client message history
        console.log("Connected: " + socket.username);
    });

});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

function getTime() {
    return (new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: "numeric",
        minute: "numeric"
    }))
}