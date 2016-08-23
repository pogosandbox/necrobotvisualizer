// Install

if(require('electron-squirrel-startup')) return;

// App

const electron = require('electron')
const app = electron.app

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 1200, height: 900})

  if (process.argv.indexOf("--local") >= 0) {
    console.log("Using local version.");
    mainWindow.loadURL(`file://${__dirname}/index.html`);
  } else {
    mainWindow.loadURL(`http://necrovisualizer.nicontoso.eu`);
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

