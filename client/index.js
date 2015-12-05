/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

'use babel';

const electron = require('electron');
var Client     = require('./app');

var ipc           = electron.ipcMain;
var app           = electron.app;
var BrowserWindow = electron.BrowserWindow;

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
    client.on('disconnect', function () {
        mainWindow.webContents.send('disconnect');
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
        } else if (data.name === 'setting') {
            return client.setting(data.host, data.port);
        }
        client.send(data);
    });
});
