/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

'use strict';

var Pool = require('./pool');
var Socket = require('./socket');
var Protocol = require('./protocol');
var config = require('./config');

var message = new Protocol(config.MAX_SOCKET_LEN);
var mainPool = new Pool();
var mainSocket = new Socket(config.HOST, config.PORT);

var users = [];

function syncUser() {
    mainPool.each(function (client) {
        message.push(client, {
            type: 'syncuser',
            data: users
        });
    });
}

function onConnect() {
    console.log('- Socket connect');
    mainPool.add(this);
}

function onDisconnect() {
    var _this = this;

    console.log('- Socket disconnect');
    var user = users.filter(function (user) {
        return user.sid == _this.id;
    })[0];
    if (user) {
        user.state = 0;
    }
    mainPool.remove(this);
    syncUser();
}

function onError() {
    var _this2 = this;

    console.log('- Socket error');
    var user = users.filter(function (user) {
        return user.sid == _this2.id;
    })[0];
    if (user) {
        user.state = 0;
    }
    mainPool.remove(this);
    syncUser();
}

function onData(data) {
    console.log('- Data transmit');
    message.listener(this, data);
}

message.on('login', function (req, res, sid) {
    var user = users.filter(function (u) {
        return u.name == req.content.name;
    })[0];
    if (user && user.state) {
        // Still online, res with an err
        return res({
            error: 1,
            message: 'ERROR: This user has already logged in.'
        });
    } else if (user) {
        // Login
        user.state = 1;
    } else {
        // New user
        users.push({
            name: req.content.name,
            state: 1,
            sid: sid
        });
    }
    res();
    syncUser();
});

message.on('msg', function (req, res) {
    res();
    mainPool.each(function (client) {
        message.push(client, {
            type: 'msg',
            data: req.content
        });
    });
});

mainSocket.on('start', onConnect);
mainSocket.on('end', onDisconnect);
mainSocket.on('error', onError);
mainSocket.on('data', onData);
mainSocket.start();
