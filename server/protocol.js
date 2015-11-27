/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/protocol.js
 *  The protocol definition (server part) in this app, including APIs, split, encode and decode methods, etc.
 */

module.exports = class {
    constructor(max_socket_len) {
        this.hooks          = {};
        this.stack          = {};
        this.max_socket_len = max_socket_len || 800;
    }

    encode(str) {
        return new Buffer(str).toString('binary');
    }

    decode(str) {
        return new Buffer(str, 'binary').toString('utf8');
    }

    on(event, fn) {
        this.hooks[event] = fn;
    }

    pipe(socket, no, total, raw) {
        if (typeof this.stack[socket.id] === 'undefined') {
            this.stack[socket.id] = '';
        }
        this.stack[socket.id] += raw;
        if (no == total) {
            var data = JSON.parse(this.stack[socket.id]);

            this.stack[socket.id] = '';
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
    }

    sendLargeRawMsg(socket, str) {
        var len      = str.length;
        var cnt      = Math.ceil(len / this.max_socket_len);
        var tmp, num = 0;
        while (str.length) {
            num++;
            tmp = '.' + num + '/' + cnt + '.' + str.substr(0, this.max_socket_len);
            str = str.substr(this.max_socket_len);
            socket.write(this.encode(tmp));
        }
    }

    push(socket, data) {
        this.sendLargeRawMsg(socket, JSON.stringify({
            type:      'push',
            timestamp: (new Date()).getTime(),
            content:   data
        }));
    }

    response(socket, data, res) {
        if (typeof res === 'undefined') {
            this.sendLargeRawMsg(socket, JSON.stringify({
                type:      'res',
                token:     data.token,
                timestamp: (new Date()).getTime()
            }));
        } else {
            this.sendLargeRawMsg(socket, JSON.stringify({
                type:      'res',
                token:     data.token,
                timestamp: (new Date()).getTime(),
                content:   res
            }));
        }
    }

    listener(socket, raw) {
        var str = this.decode(raw);
        str.replace(/\.(\d+)\/(\d+)\.([^\.]+)/g, (str, ...data) => {
            this.pipe(socket, parseInt(data[0]), parseInt(data[1]), data[2]);
            return '';
        });
    }
};
