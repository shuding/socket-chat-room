/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

/**
 * client/protocol.js
 *  The protocol definition in client part
 */

module.exports = class {
    constructor(max_socket_len = 800) {
        this.hooks          = {};
        this.stack          = '';
        this.max_socket_len = max_socket_len;
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

    pipe(no, total, raw) {
        this.stack += raw;
        if (no == total) {
            var data = JSON.parse(this.stack);

            this.stack = '';
            switch (data.type) {
                case 'res':
                    this.hooks.res && this.hooks.res(data);
                    break;
                case 'push':
                    this.hooks.push && this.hooks.push(data);
                    break;
            }
        }
    }

    listener(raw) {
        var str = this.decode(raw);
        str.replace(/\.(\d+)\/(\d+)\.([^\.]+)/g, (str, ...data) => {
            this.pipe(+data[0], +data[1], data[2]);
            return '';
        });
    }

    sendLargeRawMsg(socket, str) {
        var len      = str.length;
        var cnt      = Math.ceil(len / this.max_socket_len);
        var tmp, num = 0;
        console.log(cnt);
        while (str.length) {
            num++;
            tmp = '.' + num + '/' + cnt + '.' + str.substr(0, this.max_socket_len);
            str = str.substr(this.max_socket_len);
            socket.send(this.encode(tmp));
        }
    }

    send(socket, data) {
        var str = '';
        switch (data.type) {
            case 'msg':
                str = JSON.stringify(data);
                break;
            case 'login':
                str = JSON.stringify(data);
                break;
        }
        this.sendLargeRawMsg(socket, str);
    }
};
