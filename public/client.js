$(document).ready(init);

var username;

function init() {
    var socket = io();
    usercolor = "000000";

    // On message send
    $('form').submit(function () {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    // On message receive
    socket.on('chat message', function (msg, usr, color, time) {
        if(username == usr) {
            $('#messages').append($('<li><b>' + time + ' ' + usr.fontcolor(color) + ': ' + msg + '</b></li>'));
        }

        else {
            $('#messages').append($('<li>' + time + ' ' + usr.fontcolor(color) + ': ' + msg + '</li>'));
        }
        window.scrollTo(0, document.body.scrollHeight);
    });

    // On name change of client
    socket.on('requestName', function (name) {
        if (username == name) {
            $('#messages').append($('<li>Invalid: That nickname is already in use. Please choose a unique nickname.</li>'))
        }
        else {
            username = name;
            $('#messages').append($('<li>' + 'You are ' + username + '.</li>'));
        }
    });


    // On name change of anyone in chat update username list
    socket.on('userChange', function (userlist) {
        var tmplist = document.getElementById('usernames');
        tmplist.innerHTML = '';
        for (let i in userlist) {
            $('#usernames').append($('<li>' + userlist[i] + '</li>'));
        }
    })

    // When client receives chat history from new connection, print out history
    socket.on('chatHistory', function (history) {
        for (let i in history) {
            $('#messages').append($('<li>' + history[i] + '</li>'));
        }
    })

    socket.emit('newConnection');
}