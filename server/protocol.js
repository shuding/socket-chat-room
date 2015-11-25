/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/protocol.js
 *  The protocol definition (server part) in this app, including APIs, split, encode and decode methods, etc.
 */

module.exports = class {
    constructor() {
        this.hooks = {};
    }

    on(event, fn) {
        this.hooks[event] = fn;
    }

    push(socket, data) {
        socket.write(JSON.stringify({
            type:      'push',
            timestamp: (new Date()).getTime(),
            content:   data
        }));
    }

    response(socket, data, res) {
        if (typeof res === 'undefined') {
            socket.write(JSON.stringify({
                type:      'res',
                token:     data.token,
                timestamp: (new Date()).getTime()
            }));
        } else {
            socket.write(JSON.stringify({
                type:      'res',
                token:     data.token,
                timestamp: (new Date()).getTime(),
                content:   res
            }));
        }
    }

    listener(socket, raw) {
        var data = JSON.parse(raw);
        switch (data.type) {
            case 'login':
                this.hooks.login && this.hooks.login(data, (res) => {
                    this.response(socket, data, res);
                }, socket.id);
                break;
            case 'msg':
                this.hooks.msg && this.hooks.msg(data, (res) => {
                    this.response(socket, data, res);
                }, socket.id);
                break;
        }
    }
};
