/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

const low = require('lowdb');

const Pool     = require('./pool');
const Socket   = require('./socket');
const Protocol = require('./protocol');
const config   = require('./config');

var message    = new Protocol(config.MAX_SOCKET_LEN);
var db         = low(config.DB, {async: false});
var mainPool   = new Pool(db('sid').get('0'));
var mainSocket = new Socket(config.HOST, config.PORT);

function syncUser() {
    var data = db('users');
    mainPool.each((client) => {
        message.push(client, {
            type: 'syncuser',
            data: data
        });
    });
}

function onConnect() {
    console.log('- Socket connect');
    mainPool.add(this);
    db('sid').set('0', mainPool.__index);
}

function onDisconnect() {
    console.log('- Socket disconnect');
    db('users').chain().find({sid: this.id}).assign({'state': 0}).value();
    mainPool.remove(this);
    syncUser();
}

function onError() {
    console.log('- Socket error');
}

function onData(data) {
    console.log('- Data transmit');
    message.listener(this, data);
}

message.on('login', function (req, res, sid) {
    var user = db('users').find({name: req.content.name});
    if (user && user.state) {
        // Still online, res with an err
        return res({
            error:   1,
            message: 'still online'
        });
    } else if (user) {
        // Login
        db('users').chain().find({name: req.content.name}).assign({
            state: 1,
            sid:   sid
        }).value();
    } else {
        // New user
        db('users').push({
            name:  req.content.name,
            state: 1,
            sid:   sid
        });
    }
    res();
    syncUser();
});

message.on('msg', function (req, res) {
    db('msg').push(req.content);
    res();
    mainPool.each((client) => {
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
