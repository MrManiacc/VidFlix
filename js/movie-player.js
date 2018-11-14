const electron = window.require("electron")
const win = electron.remote.getCurrentWindow();
const os = require('os');
const storage = require('electron-json-storage');
const fs = require('fs');
let currentName = "";
let currentMp4 = "";
var currentObj;
var currertTime;
var currentBaseUrl;
var child;
var timeRead;
var nextName;
var nextBaseUrl;
var nextMp4;

let videoPlayer = $("#video-player");
var io = require('socket.io')();

var Alert = undefined;

(function(Alert) {
    var alert, error, info, success, warning, _container;
    info = function(message, title, options) {
        return alert("info", message, title, "icon-info-sign", options);
    };
    warning = function(message, title, options) {
        return alert("warning", message, title, "icon-warning-sign", options);
    };
    error = function(message, title, options) {
        return alert("error", message, title, "icon-minus-sign", options);
    };
    success = function(message, title, options) {
        return alert("success", message, title, "icon-ok-sign", options);
    };
    alert = function(type, message, title, icon, options) {
        var alertElem, messageElem, titleElem, iconElem, innerElem, _container;
        if (typeof options === "undefined") {
            options = {};
        }
        options = $.extend({}, Alert.defaults, options);
        if (!_container) {
            _container = $("#alerts");
            if (_container.length === 0) {
                _container = $("<ul>").attr("id", "alerts").appendTo($("body"));
            }
        }
        if (options.width) {
            _container.css({
                width: options.width
            });
        }
        alertElem = $("<li>").addClass("alert").addClass("alert-" + type);
        setTimeout(function() {
            alertElem.addClass('open');
        }, 1);
        if (icon) {
            iconElem = $("<i>").addClass(icon);
            alertElem.append(iconElem);
        }
        innerElem = $("<div>").addClass("alert-block");
        alertElem.append(innerElem);
        if (title) {
            titleElem = $("<div>").addClass("alert-title").append(title);
            innerElem.append(titleElem);
        }
        if (message) {
            messageElem = $("<div>").addClass("alert-message").append(message);
            innerElem.append(messageElem);
        }
        if (options.displayDuration > 0) {
            setTimeout((function() {
                leave();
            }), options.displayDuration);
        } else {
            innerElem.append("<em>Click to Dismiss</em>");
        }
        alertElem.on("click", function() {
            leave();
        });
        function leave() {
            alertElem.removeClass('open');
            alertElem.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',  function() { return alertElem.remove(); });
        }
        return _container.prepend(alertElem);
    };
    Alert.defaults = {
        width: "",
        icon: "",
        displayDuration: 3000,
        pos: ""
    };
    Alert.info = info;
    Alert.warning = warning;
    Alert.error = error;
    Alert.success = success;
    return _container = void 0;


})(Alert || (Alert = {}));

this.Alert = Alert;

$('#test').on('click', function() {
    Alert.info('Message');
});


function checkResource (url) {
    var req = new XMLHttpRequest();
    req.open('HEAD', url, true);
    req.send();

    setTimeout(function(){
        if (req.status === 403) {
            startJava();
            if($('#redownload-overlay:visible').length === 0)
            {
                $("#redownload-overlay").show();
                $(".lds-facebook").show();
            }
            //TODO: emit redownload
            console.log(currentBaseUrl);
            setTimeout(function() {
                io.sockets.emit("redl", currentBaseUrl);
            }, 5000);
        }
        else if(req.status === 200 || req.status === 206){
            startTimeWrite();
        }
    }, 3000);

}

function startTimeWrite(){
    var myPlayer = videojs('video-player');
    window.setInterval(function(){
        writeTime(currentName, myPlayer.currentTime());
    }, 1000);
}


io.on('connection', function(socket){
    socket.on('redownload', function(data){
        console.log("APPEND REDLOADED: " + data.mp4);
        currentMp4 = data.mp4;
        writeMp4(currentName, data.mp4);
        setTimeout(function(){
            changeMp4();
        }, 1000);
        setTimeout(function(){
            stopJava();
        }, 3000);
     });

    socket.on("log", function(data){
        if(data.name !== "NA"){
            Alert.info(data.message, data.name);
        }else{
            Alert.info(data.message);
        }
    });
});



function startJava(){
    console.log('start java');
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    var executablePath;
    var gecko;

    if(process.platform === "win32"){
        executablePath = basepath + "\\assets\\adder.jar";
        gecko = basepath + "\\assets\\geckodriver.exe";
    }else{
        executablePath = basepath + "/assets/adder.jar";
        gecko = basepath + "/assets/geckodriver";
    }



    var spawn = require('child_process').spawn;
    child = spawn('java', ['-jar', executablePath, gecko]);
    var shown2 = false;
    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
        if(data.toString().includes('Suc')){
            stopJava();
        }
    });

    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
        if(data.toString().includes('Suc')){
            stopJava();
        }
        if(data.toString().includes('Exception')){
            stopJava();
            if(!shown2){
                alert("Not found!");
                shown2 = true;
            }
        }
    });

    child.on('exit', function (code) {
        console.log('child process exited');
    });

}




function stopJava(){
    $(".add-movie").slideUp();
    $("#overlay").fadeOut();
    $(".lds-facebook").hide();
    console.log("stop java");

    child.kill();
}



io.listen(3000);



$(document).ready(function(){
    registerDebug();
    storage.setDataPath(os.tmpdir());
    $("#back-button").click(function(){

        setTimeout(function(){
            win.loadFile("index.html");
        }, 300);
    });
    setMovie();
    fixPlayer();
});




function fixPlayer(){
    videojs("video-player").ready(function(){

        var myPlayer = this;
        var time;
        myPlayer.on("pause", function () {
            console.log('paused');
            time = myPlayer.currentTime();
        });
        myPlayer.on("play", function () {
            console.log('played');
        });

        myPlayer.on('ended', function() {


            setNext();

            setTimeout(function(){
                storage.set('current-movie', { name: nextName, mp4: nextMp4}, function(error) {
                    if (error) throw error;
                });

                storage.set('current-baseUrl', { baseUrl: nextBaseUrl }, function(error){
                    if(error) throw error;
                });
            }, 500);

            setTimeout(function(){
                location.reload();
            }, 1000);
        });

    });
}


function setNext(){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }

        var next = false;
        var genre = "";
        var file = JSON.parse(data.toString());
        $.each(file.movies, function (index, element) {
            if (element.name === currentName) {
                next = true;
                genre = element.genre;
            }else{
                if(next){
                    if(element.genre === genre){
                        nextMp4 = element.mp4;
                        nextBaseUrl = element.baseUrl;
                        nextName = element.name;
                        next = false;
                    }
                }
            }
        });
    });
}


function readTime(name){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        var file = JSON.parse(data.toString());
        $.each(file.movies, function (index, element) {
            if (element.name === name) {
                currentObj = element;
                console.log(currentObj);
            }
        });
    });
}


function readTime(name){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        var file = JSON.parse(data.toString());
        var movies = [];
        var contains = false;
        $.each(file.movies, function(index, element) {
            if (element.name === name) {
                timeRead = element.time;
                console.log("TIME READ: " + element.time);
            }
        });
    })
}
function writeTime(name, time){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        var file = JSON.parse(data.toString());
        var movies = [];
        var contains = false;
        $.each(file.movies, function(index, element) {
            if(element.name === name){
                var realvideo = {
                    "mp4": element.mp4,
                    "img": element.img,
                    "genre": element.genre,
                    "name": element.name,
                    "time": time,
                    "baseUrl": element.baseUrl
                };
                movies.push(realvideo);
            }else{
                movies.push(element);
            }
        });
        var output = "{\"movies\":" + JSON.stringify(movies, null, 2) + "}";
        if (!contains) {
            var writeData = fs.writeFile(basepath + "/movies.json",  output, (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                }
            });
        }
    })
}


function writeMp4(name){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        var file = JSON.parse(data.toString());
        var movies = [];
        var contains = false;

        $.each(file.movies, function(index, element) {
            if(element.name === name){
                var realvideo = {
                    "mp4": currentMp4,
                    "img": element.img,
                    "genre": element.genre,
                    "name": element.name,
                    "time": element.time,
                    "baseUrl": element.baseUrl
                };
                currertTime = element.time;

                movies.push(realvideo);
            }else{
                movies.push(element);
            }
        });
        var output = "{\"movies\":" + JSON.stringify(movies, null, 2) + "}";
        if (!contains) {
            var writeData = fs.writeFile(basepath + "/movies.json",  output, (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                }
            });
        }
    })
}



function changeMp4(){
    $("#source").attr("src", currentMp4);
    readTime(currentName);
    videojs("video-player", {}, function(){
        this.currentTime(timeRead);
        this.load();
        this.play();

        setTimeout(function(){
            startTimeWrite();
            $("#redownload-overlay").hide();
            $(".lds-facebook").hide();
        }, 1500);
    });
}

function registerDebug(){
    var control = false;

    document.addEventListener('keydown', (event) => {
        if(event.key === 'Control') control = true;
        if(control){
            if(event.key === 'd'){
                //electron.remote.getCurrentWindow().webContents.toggleDevTools();

            }
        }

    });
    document.addEventListener('keyup', (event) => {
        if(event.key === 'Control') control = false;

    });

}

function setMovie(){
    storage.get('current-baseUrl', function(error, data){
        currentBaseUrl = data.baseUrl;
    });

    storage.get('current-movie', function(error, data) {
        if (error) throw error;

        currentName = data.name;
        currentMp4 = data.mp4;
        console.log(data);

        $("#video-title").text(data.name);
        $("#video-title").show();
        readTime(data.name);

        $("#source").attr("src", currentMp4);
        setTimeout(function(){
            checkResource(data.mp4);
            videojs("video-player", {}, function(){
                this.currentTime(timeRead);
                this.load();
                this.play();
            });
        }, 500);
    });


}


