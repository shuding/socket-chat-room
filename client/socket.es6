/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

/**
 * client/socket.js
 *  Socket wrapper in the client part
 */

var net = require('net');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 2015;

const ENCODING = 'utf8';

class Socket {
    constructor(host, port) {
        this.host = host || DEFAULT_HOST;
        this.port = port || DEFAULT_PORT;

        this.socket = new net.Socket();
        this.socket.setEncoding(ENCODING);
    }

    connect() {
        this.socket.connect(this.port, this.host);
    }

    onconnect(fn) {
        this.socket.on('connect', fn);
    }

    onerror(fn) {
        this.socket.on('error', fn);
    }

    ondata(fn) {
        this.socket.on('data', fn);
    }

    onend(fn) {
        this.socket.on('end', fn);
    }

    send(data) {
        this.socket.write(data);
    }
}

module.exports = Socket;
