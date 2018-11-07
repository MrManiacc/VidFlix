
var fs = require('fs');
var genre = "";
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();
const os = require('os');
const storage = require('electron-json-storage');

function noscroll() {
    window.scrollTo( 0, 0 );
}

function disableScroll() {
    window.addEventListener('scroll', noscroll);
}

function enableScroll() {
    window.removeEventListener('scroll', noscroll);
}

$(document).ready(function(){

    storage.setDataPath(os.tmpdir());
    parseMovies();

    $("#movies-container").on("mouseenter", ".video-item", function(){
        $(this).find(".video-name").show();
    });
    $("#movies-container").on("mouseleave", ".video-item", function(){
        $(this).find(".video-name").hide();
    });

    $("#movies-container").on("click", ".video-item", function(){
        let name = $(this).find(".video-name").text();
        let mp4 = $(this).data("mp4");
        setCurrentMovie(name, mp4);
        win.loadFile('player.html');
    });
    $("#close-add").click(function(){
        $(".add-movie").slideUp();
        $("#overlay").fadeOut();
        $(".lds-facebook").hide();
        enableScroll();
        stopJava();
    });

    $("#add").click(function(){
        $(".add-movie").slideDown();
        $("#overlay").fadeIn();
        disableScroll();
        startJava();
        shown = false;
        shown2 = false;

    });

    $("#add-movie").click(function(){
        var name = $("#movie-name").val();
        genre = $("#movie-genre").val();
        console.log(genre);

        queryMovie(name, genre);
    });


    checkSearch();
    checkRefresh();

});

var io = require('socket.io')();
io.on('connection', function(socket){



    socket.on('not_found', function(){
        alert('not found!');
    });

    socket.on('video', function(data){
        appendMovie(data);
        $(".add-movie").slideUp();
        $("#overlay").fadeOut();
        $(".lds-facebook").hide();
        enableScroll();
    });

    socket.on('bulkvideo', function(data){
        var waitTime = data.bulk.length;
        data.bulk.forEach(function(item, index) {
            setTimeout(function () {
                const movie = JSON.parse(item);
                console.log(movie);
                appendMovie(movie);
                waitTime = index;
            }, index * 2000);
        });
        setTimeout(function () {
            parseMovies();
            $(".add-movie").slideUp();
            $("#overlay").fadeOut();
            $(".lds-facebook").hide();
            enableScroll();
        }, waitTime * 2200);
    });


});

function stopJava(){
    $(".add-movie").slideUp();
    $("#overlay").fadeOut();
    $(".lds-facebook").hide();
    enableScroll();


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



io.listen(3000);

function queryMovie(query, genre){
    $(".lds-facebook").show();
    io.sockets.emit('query',  {'query': query, genre: genre});
}





function setCurrentMovie(name, mp4){
    storage.set('current-movie', { name: name, mp4: mp4}, function(error) {
        if (error) throw error;
    });
}

function checkRefresh(){
    $("#refresh").click(function(){
        parseMovies();
    });
}

function checkSearch(){
    $("#search-bar").on('input', function(e){
        var query = $(this).val().toLowerCase();
        $('.video-item').each(function(i, obj) {
            var name = $(this).find(".video-name").text().toLowerCase();
            var parent = $(this).parent();
            if(!name.includes(query)){
                $(this).hide();
                var allHidden = true;

                parent.children(".video-item").each(function(){
                    var videoItem = $(this);
                    if(videoItem.is(':visible')) allHidden = false;
                });

                if(allHidden)
                    parent.hide();

            }else{
                var parent = $(this).parent();
                parent.show();
                $(this).show();
            }
        });
    });
}


function parseMovies(){
    $("#movies-container").empty();
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8",  (err, data)  => {
        if (err)console.log(err);
        const obj = JSON.parse(data);
        $.each(obj.movies, function(index, element) {
            addMovie(element.genre, element.name, element.img, element.mp4);
        });
        return obj;
    });
    setTimeout(function(){
        $('.genre').each(function(i, obj) {
            var label = $(obj).find(".genre-label");
            label.text($(obj).data("genre"));
            if($(obj).children().length === 1) $(obj).hide();
        });
    }, 50);
}
var shown = false;

function appendMovie(video){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8",  (err, data)  => {
        if (err) {
            return console.error(err);
        };
        var videoObject = video;
        if(genre !== ""){
            video.genre = genre;
            var realvideo = {
                "mp4": video.mp4,
                "img": video.img,
                "genre": genre,
                "name": video.name
            };
            videoObject = realvideo;
        }
        var file = JSON.parse(data.toString());
        var contains = false;
        $.each(file.movies, function(index, element) {
           if(element.name === video.name) contains = true;
        });
        if(!contains){
            file['movies'].push(videoObject);
            var writeData = fs.writeFile(basepath + "/movies.json", JSON.stringify(file, null, 2), (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                    console.log(result);
                    console.log("Success");
                }

            });
        }
    });
}

function addMovie(genre, name, img, mp4){
    var added = false;
    $('.genre').each(function(i, obj) {
        var genreName = $(obj).data("genre");
        if(genre === genreName){
            var selectedGenre = $(obj);
            selectedGenre.append(getMovieObject(name, img, mp4));
            added = true;
        }
    });


    if(!added){
        addGenre(genre);
        addMovie(genre, name, img, mp4);
    }
}

function addGenre(name){
    $("#movies-container").append(getGenreObject(name));
}

function getGenreObject(name){
    return '<div class="genre" data-genre="' + name + '">' +
        '<div class="box">' +
            '<h1 class="genre-label"></h1>' +
        '</div>' +
        '</div>'
}



function getMovieObject(name, img, mp4){
    return '<div class="video-item" data-mp4="' + mp4 + '">' +
        '<img class="video-img" src="' + img + '">' +
        '<h2 class="video-name">' + name + '</h2>' +
        '</div>';
}