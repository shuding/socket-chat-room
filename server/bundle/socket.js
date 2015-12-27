/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/socket.js
 *  A wrapper of TCP sockets in the system `net` module
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var net = require('net');

var DEFAULT_HOST = '127.0.0.1';
var DEFAULT_PORT = 2015;

var ENCODING = 'utf8';

var Socket = (function () {
    function Socket(host, port) {
        var _this = this;

        _classCallCheck(this, Socket);

        this.host = host || DEFAULT_HOST;
        this.port = port || DEFAULT_PORT;

        this.onStartFn = [];
        this.onErrorFn = [];
        this.onDataFn = [];
        this.onEndFn = [];

        this.server = net.createServer(function (socket) {
            _this.onStartFn.forEach(function (fn) {
                fn.call(socket);
            });

            socket.setEncoding(ENCODING);
            socket.on('data', function (data) {
                _this.onDataFn.forEach(function (fn) {
                    fn.call(socket, data);
                });
            });
            socket.on('error', function (err) {
                _this.onErrorFn.forEach(function (fn) {
                    fn.call(socket, err);
                });
            });
            socket.on('end', function () {
                _this.onEndFn.forEach(function (fn) {
                    fn.call(socket);
                });
            });
        });
    }

    _createClass(Socket, [{
        key: 'on',
        value: function on(event, fn) {
            switch (event) {
                case 'start':
                    this.onStartFn.push(fn);
                    break;
                case 'error':
                    this.onErrorFn.push(fn);
                    break;
                case 'data':
                    this.onDataFn.push(fn);
                    break;
                case 'end':
                    this.onEndFn.push(fn);
            }
        }
    }, {
        key: 'start',
        value: function start(callback) {
            this.server.listen(this.port, this.host, callback);
        }
    }]);

    return Socket;
})();

module.exports = Socket;
