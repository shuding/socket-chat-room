/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/pool.js
 *  Maintains a pool of current socket connections
 */

class Pool {
    constructor(index) {
        this.__sockets = new Set();
        this.__index   = index || 0;
    }

    add(socket) {
        // The unique id tag
        socket.id = this.__index++;
        this.__sockets.add(socket);
    }

    remove(socket) {
        for (let __socket of this.__sockets) {
            if (__socket.id === socket.id) {
                this.__sockets.delete(__socket);
                return;
            }
        }
    }

    each(fn) {
        for (let __socket of this.__sockets) {
            fn(__socket);
        }
    }

    count() {
        return this.__sockets.size;
    }
}

module.exports = Pool;
