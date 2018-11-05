var fs = require('fs');

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
    startJava();
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
    });

    $("#add").click(function(){
        $(".add-movie").slideDown();
        $("#overlay").fadeIn();
        disableScroll();
    });

    $("#add-movie").click(function(){
        var name = $("#movie-name").val();
        queryMovie(name);
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


});


function startJava(){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    console.log(basepath);
    var child = require('child_process').execFile;
    var executablePath = basepath + "\\assets\\adder.jar";


    var spawn = require('child_process').spawn;
    var child = spawn('java', ['-jar', executablePath]);

}



io.listen(3000);

function queryMovie(query){
    $(".lds-facebook").show();
    io.sockets.emit('query',  {'query': query})
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
    fs.readFile("./movies.json", "utf8",  (err, data)  => {
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

function appendMovie(video){
    fs.readFile("./movies.json", "utf8",  (err, data)  => {
        if (err) {
            return console.error(err);
        };

        var file = JSON.parse(data.toString());
        file['movies'].push(video)
        var writeData = fs.writeFile("./movies.json", JSON.stringify(file), (err, result) => {  // WRITE
            if (err) {
                return console.error(err);
            } else {
                console.log(result);
                console.log("Success");
            }

        });
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
        '<h1 class="genre-label"></h1>' +
        '</div>'
}



function getMovieObject(name, img, mp4){
    return '<div class="video-item" data-mp4="' + mp4 + '">' +
        '<img class="video-img" src="' + img + '">' +
        '<h2 class="video-name">' + name + '</h2>' +
        '</div>';
}