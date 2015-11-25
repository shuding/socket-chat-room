/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

/**
 * client/protocol.js
 *  The protocol definition in client part
 */

module.exports = class {
    constructor() {
        this.hooks = {};
    }

    on(event, fn) {
        this.hooks[event] = fn;
    }

    listener(raw) {
        var data = JSON.parse(raw);
        switch (data.type) {
            case 'res':
                this.hooks.res && this.hooks.res(data);
                break;
            case 'push':
                this.hooks.push && this.hooks.push(data);
                break;
        }
    }

    send(data) {
        switch (data.type) {
            case 'msg':
                return JSON.stringify(data);
            case 'login':
                return JSON.stringify(data);
        }
    }
};
