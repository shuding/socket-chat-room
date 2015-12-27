/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/socket.js
 *  A wrapper of TCP sockets in the system `net` module
 */

var net = require('net');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 2015;

const ENCODING = 'utf8';

class Socket {
    constructor(host, port) {
        this.host = host || DEFAULT_HOST;
        this.port = port || DEFAULT_PORT;

        this.onStartFn = [];
        this.onErrorFn = [];
        this.onDataFn  = [];
        this.onEndFn   = [];

        this.server = net.createServer((socket) => {
            this.onStartFn.forEach((fn) => {
                fn.call(socket);
            });

            socket.setEncoding(ENCODING);
            socket.on('data', (data) => {
                this.onDataFn.forEach((fn) => {
                    fn.call(socket, data);
                })
            });
            socket.on('error', (err) => {
                this.onErrorFn.forEach((fn) => {
                    fn.call(socket, err);
                })
            });
            socket.on('end', () => {
                this.onEndFn.forEach((fn) => {
                    fn.call(socket);
                })
            });
        });
    }

    on(event, fn) {
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

    start(callback) {
        this.server.listen(this.port, this.host, callback);
    }
}

module.exports = Socket;
