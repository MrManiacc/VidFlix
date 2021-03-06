// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
var path = require('path')
const Menu = require('electron').Menu
app.on('login', function(event, webContents, request, authInfo, callback) {
    if(authInfo.isProxy) { callback('Ddo14120203', '6jfvWtmwUJ'); }
})
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
//require('electron-reload')(__dirname);
function createMenu() {
    const application = {
        label: "Application",
        submenu: [
            {
                label: "About Application",
                selector: "orderFrontStandardAboutPanel:"
            },
            {
                type: "separator"
            },
            {
                label: "Quit",
                accelerator: "Command+Q",
                click: () => {
                    app.quit()
                }
            }
        ]
    }

    const edit = {
        label: "Edit",
        submenu: [
            {
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                selector: "undo:"
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                selector: "redo:"
            },
            {
                type: "separator"
            },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                selector: "cut:"
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                selector: "copy:"
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                selector: "paste:"
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                selector: "selectAll:"
            }
        ]
    }

    const template = [
        application,
        edit
    ]

   Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1280, height: 720, title: "VideoFlix", icon: path.join(__dirname, 'assets/icons/win/icon.png')})


    mainWindow.loadFile('login.html');

  // and load the index.html of the app.
  //

    // Open the DevTools.
  // mainWindow.webContents.openDevTools()
    app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  //mainWindow.setMenu(null);
  // Emitted when the window is closed.
 //  mainWindow.webContents.toggleDevTools();
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
    if (process.platform === 'darwin') {
        createMenu();
    }

}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
