/**
 * Created by shuding on 11/25/15.
 * <ds303077135@gmail.com>
 */

'use babel';

const electron = require('electron');
var Client     = require('./index');

var ipc           = electron.ipcMain;
var app           = electron.app;
var BrowserWindow = electron.BrowserWindow;

app.on('window-all-closed', function () {
    app.quit();
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width:             400,
        height:            300
    });
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
});
