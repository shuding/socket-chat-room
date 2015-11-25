/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

'use babel';

const electron = require('electron');
var Client   = require('./app');

var ipc           = electron.ipcMain;
var app           = electron.app;
var BrowserWindow = electron.BrowserWindow;
var mainWindow    = null;

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width:             800,
        height:            600,
        'title-bar-style': 'hidden'
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });

    // Init
    var client = new Client();
    client.on('connect', function () {
        mainWindow.webContents.send('connect');
    });
    client.on('end', function () {
        mainWindow.webContents.send('end');
    });
    client.on('error', function () {
        mainWindow.webContents.send('error');
    });
    client.on('res', function (data) {
        mainWindow.webContents.send('res', data);
    });
    client.on('push', function (data) {
        mainWindow.webContents.send('push', data);
    });

    ipc.on('synchronous-message', function (event, data) {
        // Apis
        if (data === 'connect') {
            return client.start();
        }
        client.send(data);
    });

    /*
     client.ondata(function (raw) {
     var data = protocol.decode(raw);
     if (data) {
     switch (data.type) {
     case 'msg':
     return mainWindow.webContents.send('msg', data.content);
     case 'syncusers':
     return mainWindow.webContents.send('syncusers', data.content);
     }
     }
     });
     client.onerror(function () {
     mainWindow.webContents.send('error');
     setTimeout(function () {
     mainWindow.webContents.send('connect');
     client.connect();
     }, 1000);
     });
     client.onend(function () {
     mainWindow.webContents.send('end');
     setTimeout(function () {
     mainWindow.webContents.send('connect');
     client.connect();
     }, 1000);
     });
     */

    /*
     ipc.on('synchronous-message', function (event, data) {
     client.send(protocol.encode(data));
     });
     */
    //mainWindow
});
