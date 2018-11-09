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

let videoPlayer = $("#video-player");
var io = require('socket.io')();

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
            }, 3000);
        }
        else if(req.status === 200 || req.status === 206){
            //stopJava();
        }
    }, 3000);
}


io.on('connection', function(socket){
    socket.on('redownload', function(data){
        console.log("APPEND REDLOADED: " + data.mp4);
        currentMp4 = data.mp4;
        writeMp4(currentName, data.mp4);
        setTimeout(function(){
            changeMp4();
            stopJava();
        }, 1000);
        setTimeout(function(){
            stopJava();
        }, 2000);
     });


});



function startJava(){
    console.log('start java');
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    console.log(basepath);
    var child = require('child_process').execFile;
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
    var child = spawn('java', ['-jar', executablePath, gecko]);

    child.stdout.on('data', function (data) {
        console.log('stdout: ' + data.toString());
    });

    child.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
    });

    child.on('exit', function (code) {
        console.log('child process exited');
    });

}



function stopJava(){
    console.log("stop java");
    if(process.platform === "win32"){
        find('name', 'firefox', true)
            .then(function (list) {
                console.log(list);
                var arrayLength = list.length;
                for (var i = 0; i < arrayLength; i++) {
                    console.log(list[i]);

                    ps.kill( list[i].pid, {
                        signal: 'SIGKILL',
                        timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
                    }, function(){});
                }
            });
    }else{
        find('name', 'firefox-bin', true)
            .then(function (list) {
                console.log(list);


                var arrayLength = list.length;
                for (var i = 0; i < arrayLength; i++) {
                    console.log(list[i]);

                    ps.kill( list[i].pid, {
                        signal: 'SIGKILL',
                        timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
                    }, function(){});
                }
            });
    }
    find('name', 'java', true)
        .then(function (list) {
            console.log(list);


            var arrayLength = list.length;
            for (var i = 0; i < arrayLength; i++) {
                console.log(list[i]);

                ps.kill( list[i].pid, {
                    signal: 'SIGKILL',
                    timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
                }, function(){});
            }
        });


}



io.listen(3000);



$(document).ready(function(){
    //startJava();
    storage.setDataPath(os.tmpdir());
    $("#back-button").click(function(){
        getTime();
        setTimeout(function(){
            writeTime(currentName, currertTime);
        }, 200);
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
            writeTime(currentName,time);
        });
        myPlayer.on("play", function () {
            console.log('played');
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
                    console.log("success");
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
                    console.log("success");
                }
            });
        }
    })
}

function getTime(){
    let time1 = 0;

    videojs("video-player", {}, function(){
        time1 = this.currentTime();
        console.log("HERE: " + time1);
        currertTime = time1;
    });
}


function changeMp4(){
    $("#source").attr("src", currentMp4);

    videojs("video-player", {}, function(){
        this.currentTime(currertTime);
        this.load();
        this.play();
        getTime();

        setTimeout(function(){
            console.log("Current: " + currertTime);
            $("#redownload-overlay").hide();
            $(".lds-facebook").hide();
        }, 1500);
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
        readTime(data.name);


        $("#source").attr("src", currentMp4);
        setTimeout(function(){

            checkResource(data.mp4);
            videojs("video-player", {}, function(){
                this.currentTime(currertTime);
                this.load();
                this.play();
                getTime();

            });
        }, 100);
    });


}


