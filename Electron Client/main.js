const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const prompt = require('electron-prompt');

var socket = require('socket.io-client').connect('http://localhost:3000');

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 700
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'airhockey.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', () => {
        mainWindow = null
    });
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
});
