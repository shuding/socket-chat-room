/**
 * Created by shuding on 11/24/15.
 * <ds303077135@gmail.com>
 */

/**
 * server/protocol.js
 *  The protocol definition (server part) in this app, including APIs, split, encode and decode methods, etc.
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
    function _class(max_socket_len) {
        _classCallCheck(this, _class);

        this.hooks = {};
        this.stack = {};
        this.max_socket_len = max_socket_len || 800;
    }

    _createClass(_class, [{
        key: 'encode',
        value: function encode(str) {
            return new Buffer(str).toString('binary');
        }
    }, {
        key: 'decode',
        value: function decode(str) {
            return new Buffer(str, 'binary').toString('utf8');
        }
    }, {
        key: 'on',
        value: function on(event, fn) {
            this.hooks[event] = fn;
        }
    }, {
        key: 'pipe',
        value: function pipe(socket, no, total, raw) {
            var _this = this;

            if (typeof this.stack[socket.id] === 'undefined') {
                this.stack[socket.id] = '';
            }
            this.stack[socket.id] += raw;
            if (no == total) {
                var data = JSON.parse(this.stack[socket.id]);

                this.stack[socket.id] = '';
                switch (data.type) {
                    case 'login':
                        this.hooks.login && this.hooks.login(data, function (res) {
                            _this.response(socket, data, res);
                        }, socket.id);
                        break;
                    case 'msg':
                        this.hooks.msg && this.hooks.msg(data, function (res) {
                            _this.response(socket, data, res);
                        }, socket.id);
                        break;
                }
            }
        }
    }, {
        key: 'sendLargeRawMsg',
        value: function sendLargeRawMsg(socket, str) {
            str = str.replace(/\./g, '(dot)');
            var len = str.length;
            var cnt = Math.ceil(len / this.max_socket_len);
            var tmp,
                num = 0;
            while (str.length) {
                num++;
                tmp = '.' + num + '/' + cnt + '.' + str.substr(0, this.max_socket_len);
                str = str.substr(this.max_socket_len);
                socket.write(this.encode(tmp));
            }
        }
    }, {
        key: 'push',
        value: function push(socket, data) {
            this.sendLargeRawMsg(socket, JSON.stringify({
                type: 'push',
                timestamp: new Date().getTime(),
                content: data
            }));
        }
    }, {
        key: 'response',
        value: function response(socket, data, res) {
            if (typeof res === 'undefined') {
                this.sendLargeRawMsg(socket, JSON.stringify({
                    type: 'res',
                    token: data.token,
                    timestamp: new Date().getTime()
                }));
            } else {
                this.sendLargeRawMsg(socket, JSON.stringify({
                    type: 'res',
                    token: data.token,
                    timestamp: new Date().getTime(),
                    content: res
                }));
            }
        }
    }, {
        key: 'listener',
        value: function listener(socket, raw) {
            var _this2 = this;

            var str = this.decode(raw);
            str.replace(/\.(\d+)\/(\d+)\.([^\.]+)/g, function (str) {
                _this2.pipe(socket, parseInt(arguments[1]), parseInt(arguments[2]), arguments[3].replace(/\(dot\)/g, '.'));
                return '';
            });
        }
    }]);

    return _class;
})();
