const electron = window.require("electron")
const win = electron.remote.getCurrentWindow();
const os = require('os');
const storage = require('electron-json-storage');
const fs = require('fs');
let currentName = "";
let currentMp4 = "";
var currentObj;
var currertTime;

let videoPlayer = $("#video-player");

$(document).ready(function(){
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
    setTimeout(function(){
         main();
    }, 10);
    fixPlayer();
});



function main(){
    changeMp4();
}

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
                    "time": time
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

function getTime(){
    let time1 = 0;

    videojs("video-player", {}, function(){
        time1 = this.currentTime();
        console.log("HERE: " + time1);
        currertTime = time1;
    });
}


function changeMp4(){
}


function setMovie(){
    storage.get('current-movie', function(error, data) {
        if (error) throw error;
        currentName = data.name;
        currentMp4 = data.mp4;
        readTime(data.name);

        $("#source").attr("src", currentMp4);
        setTimeout(function(){
            videojs("video-player", {}, function(){
                this.currentTime(currentObj.time);
                this.load();
                this.play();
                getTime();
                setTimeout(function(){
                    console.log("Current: " + currertTime);
                }, 1500);
            });
        }, 100);
    });


}


