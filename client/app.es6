/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

const Socket = require('./socket');
const Protocol = require('./protocol');
const config = require('./config');

class Client {
    constructor() {
        this.hooks = {};

        let message    = new Protocol(config.MAX_SOCKET_LEN);
        let mainSocket = new Socket(config.HOST, config.PORT);

        mainSocket.onconnect(() => {
            this.hooks.connect && this.hooks.connect();
        });
        mainSocket.onend(() => {
            this.hooks.disconnect && this.hooks.disconnect();
        });
        mainSocket.onerror((err) => {
            this.hooks.error && this.hooks.error.call(this, err);
        });
        mainSocket.ondata((data) => {
            message.listener(data);
        });

        this.mainSocket = mainSocket;
        this.message    = message;
    }

    on(event, fn) {
        if (['connect', 'disconnect', 'error'].indexOf(event) !== -1) {
            this.hooks[event] = fn;
        } else {
            this.message.on(event, fn);
        }
    }

    send(data) {
        this.message.send(this.mainSocket, data);
    }

    setting(host, port) {
        this.mainSocket.host = host;
        this.mainSocket.port = port;
    }

    start() {
        this.mainSocket.connect();
    }
}

module.exports = Client;
