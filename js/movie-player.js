const electron = window.require("electron")
const win = electron.remote.getCurrentWindow();
const os = require('os');
const storage = require('electron-json-storage');
let currentName = "";
let currentMp4 = "";
let videoPlayer = $("#video-player");

$(document).ready(function(){
    storage.setDataPath(os.tmpdir());
    $("#back-button").click(function(){
        win.loadFile("index.html");
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
        myPlayer.on("pause", function () {
            console.log('paused');
        });
        myPlayer.on("play", function () {
            console.log('played');
        });
    });
}

function changeMp4(){
}


function setMovie(){
    storage.get('current-movie', function(error, data) {
        if (error) throw error;
        currentName = data.name;
        currentMp4 = data.mp4;

        $("#source").attr("src", currentMp4);
        videojs("video-player", {}, function(){
            this.load();
            this.play();
        });

    });


}


