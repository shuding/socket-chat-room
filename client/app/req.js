/**
 * Created by shuding on 11/26/15.
 * <ds303077135@gmail.com>
 */

(function (window) {

    var ipc = require('electron').ipcRenderer;

    /**
     * Keeps a request-response queue, like HTTP
     *
     *  Push the callback function into the queue after setup a request,
     *  Triggers the callback after gets the response of the same session from the server.
     *
     *  Using random token to specific the request session.
     */
    var requestQueue = {};
    ipc.on('res', function (event, data) {
        if (requestQueue[data.token]) {
            if (data.content && data.content.error) {
                requestQueue[data.token](data.content.message, data);
            } else {
                requestQueue[data.token](null, data);
            }
            delete requestQueue[data.token];
        }
    });
    function $(request, callback) {
        request.timestamp = (new Date()).getTime();
        request.token = Math.random().toFixed(10).toString().split('.')[1];
        requestQueue[request.token] = callback;
        ipc.send('synchronous-message', request);
    }

    window.$ = $;
    window.ipc = ipc;

})(window);
