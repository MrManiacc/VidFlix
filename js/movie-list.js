
var fs = require('fs');
var genre = "";
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();
const os = require('os');
const storage = require('electron-json-storage');
var baseUrl;
var currentName;
var isTvShow = false;
var child;
function noscroll() {
    window.scrollTo( 0, 0 );
}

function disableScroll() {
    window.addEventListener('scroll', noscroll);
}

function enableScroll() {
    window.removeEventListener('scroll', noscroll);
}


$( window ).resize(function() {

});



var resizeTimer;

$(window).on('resize', function(e) {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        parseMovies();
        setTimeout(function () {
            fixSizing();
        }, 10);
    }, 200);

});
var isDel = false;
$(document).ready(function(){

    storage.setDataPath(os.tmpdir());
    parseMovies();


    $(".inp-cbx").click(function(){
        isTvShow = !isTvShow;

        if(isTvShow){
            $("#add-title").text("Add Tv Show");
        }else{
            $("#add-title").text("Add Movie");
        }
    });

    $("#movies-container").on("mouseenter", ".video-item", function(){
        $(this).find(".video-name").show();
    });
    $("#movies-container").on("mouseleave", ".video-item", function(){
        $(this).find(".video-name").hide();
    });

    $("#movies-container").on("mouseenter", ".del-btn", function(){
        isDel = true;
    });
    $("#movies-container").on("mouseleave", ".del-btn", function(){
        isDel = false;
    });

    $("#movies-container").on("mouseenter", ".genre-btn", function(){
        isDel = true;
    });
    $("#movies-container").on("mouseleave", ".genre-btn", function(){
        isDel = false;
    });

    $("#movies-container").on("click", ".video-item", function(){
        if(!isDel){
            let name = $(this).find(".video-name").text();
            let mp4 = $(this).data("mp4");
            baseUrl = $(this).data("baseurl");
            setCurrentMovie(name, mp4);
            win.loadFile('player.html');
        }
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

    $("#set-genre").click(function(){
        setGenre(currentName, $("#set-genre-text").val());
        setTimeout(function(){
            parseMovies();
            setTimeout(function () {
                fixSizing();
                $(".set-genre").slideUp();
            }, 10);
        }, 50);
    });

    $("#movies-container").on("click", ".del-btn", function(){
        var parent = $(this).parent().parent();
        deleteVideo(parent.data("name"));
        setTimeout(function(){
            parseMovies();
            setTimeout(function () {
                fixSizing();
                $(".set-genre").slideUp();
            }, 10);
        }, 50);
    });

    $("#movies-container").on("click", ".genre-btn", function(){
        var parent = $(this).parent().parent();
        var name = parent.data("name");
        console.log(name);
        currentName = name;
        $(".set-genre").slideDown();
    });

    $("#close-genre").click(function(){
        $(".set-genre").slideUp();
    });

    $("#add-movie").click(function(){
        var name = $("#movie-name").val();
        genre = $("#movie-genre").val();
        console.log(genre);
        if(!isTvShow)
            queryMovie(name, genre);
        else
            queryTv(name, genre);
    });


    checkSearch();
    checkRefresh();



    // setTimeout(function(){
    //     var currentGenre;
    //     var lastGenre;
    //
    //     var largest = 0;
    //     var lastLargest = 0;
    //     var reset = false;
    //     var widthAdd = 0;
    //     var realLast =
    //         $( ".video-item" ).each(function( index ) {
    //             currentGenre = $(this).parent().data("genre");
    //             if(currentGenre !== lastGenre){
    //                 reset = false;
    //                 console.log(currentGenre + ":" + lastGenre + "largest");
    //                 lastLargest = largest;
    //                 console.log(lastLargest);
    //                 largest = 0;
    //             }
    //
    //
    //             var offset = $(this).position();
    //             var right = (offset.left + 220);
    //             if(right > largest){
    //                 largest = right;
    //             }
    //             lastGenre = currentGenre;
    //             //console.log(right);
    //
    //         });
    // }, 2000);


    setTimeout(function () {
        fixSizing();
    }, 100);


});

function fixSizing() {
    $(".genre").each(function (index) {
        var largest = getLargest($(this));
        $(this).width(largest);
        console.log("fixing: " + largest);
    });

}

function getLargest(genre){
    var largest = 0;
    var child = genre.children();
    for (var i = 0; i < child.length; i++) {
        var item = $(child[i]);
        var offset = item.position();
        var right = (offset.left + 240);
        if(right > largest){
            largest = right;
        }
    }
    return largest;
}

jQuery.fn.swap = function(b){
    // method from: http://blog.pengoworks.com/index.cfm/2008/9/24/A-quick-and-dirty-swap-method-for-jQuery
    b = jQuery(b)[0];
    var a = this[0];
    var t = a.parentNode.insertBefore(document.createTextNode(''), a);
    b.parentNode.insertBefore(a, b);
    t.parentNode.insertBefore(b, t);
    t.parentNode.removeChild(t);
    return this;
};
var io = require('socket.io')();
io.on('connection', function(socket){



    socket.on('not_found', function(){
        alert('not found!');
    });

    socket.on('video', function(data){
        console.log(data);
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
            }, index * 4000);
        });
        setTimeout(function () {
            parseMovies();
            $(".add-movie").slideUp();
            $("#overlay").fadeOut();
            $(".lds-facebook").hide();
            enableScroll();
        }, waitTime * 5000);
    });
});




function stopJava(){
    $(".add-movie").slideUp();
    $("#overlay").fadeOut();
    $(".lds-facebook").hide();
    enableScroll();


    console.log("stop java");
    // if(process.platform === "win32"){
    //     find('name', 'firefox', true)
    //         .then(function (list) {
    //             console.log(list);
    //             var arrayLength = list.length;
    //             for (var i = 0; i < arrayLength; i++) {
    //                 console.log(list[i]);
    //
    //                 ps.kill( list[i].pid, {
    //                     signal: 'SIGKILL',
    //                     timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
    //                 }, function(){});
    //             }
    //         });
    // }else{
    //     find('name', 'firefox-bin', true)
    //         .then(function (list) {
    //             console.log(list);
    //
    //
    //             var arrayLength = list.length;
    //             for (var i = 0; i < arrayLength; i++) {
    //                 console.log(list[i]);
    //
    //                 ps.kill( list[i].pid, {
    //                     signal: 'SIGKILL',
    //                     timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
    //                 }, function(){});
    //             }
    //         });
    // }
    // find('name', 'java', true)
    //     .then(function (list) {
    //         console.log(list);
    //
    //
    //         var arrayLength = list.length;
    //         for (var i = 0; i < arrayLength; i++) {
    //            console.log(list[i]);
    //
    //             ps.kill( list[i].pid, {
    //                 signal: 'SIGKILL',
    //                 timeout: 10,  // will set up a ten seconds timeout if the killing is not successful
    //             }, function(){});
    //         }
    //     });

    child.kill();
}


function startJava(){
    console.log('start java');
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    console.log(basepath);
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



io.listen(3000);

function queryMovie(query, genre){
    $(".lds-facebook").show();
    io.sockets.emit('query',  {'query': query, 'genre': genre});
}

function queryTv(query, genre){
    $(".lds-facebook").show();
    io.sockets.emit('series',  {'query': query, 'genre': genre});
}





function setCurrentMovie(name, mp4){
    storage.set('current-movie', { name: name, mp4: mp4}, function(error) {
        if (error) throw error;
    });

    storage.set('current-baseUrl', { baseUrl: baseUrl }, function(error){
        if(error) throw error;
        console.log(baseUrl);
    });
}

function checkRefresh(){
    $("#refresh").click(function(){
        parseMovies();
        setTimeout(function () {
            fixSizing();
        }, 50);

    });
}

function checkSearch(){


    // genre-label
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
            var baseDir = element.baseUrl;
            console.log(element.baseUrl);
            addMovie(element.genre, element.name, element.img, element.mp4, element.baseUrl);
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
                "name": video.name,
                "baseUrl": video.baseUrl
            };
            videoObject = realvideo;
        }
        var file = JSON.parse(data.toString());
        console.log(videoObject);
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
                   parseMovies();
                }

            });
        }
    });
}


function setGenre(name, genre){
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
        var realVideo;
        var found = false;
        $.each(file.movies, function(index, element) {
            if(element.name === name){
                found = true;
                    realVideo = {
                    "mp4": element.mp4,
                    "img": element.img,
                    "genre": genre,
                    "name": element.name,
                    "time": element.time,
                    "baseUrl": element.baseUrl
                };
            }else{
                movies.push(element);
            }
        });
        if(found) movies.push(realVideo);
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

function deleteVideo(vidName) {
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
            if(element.name !== vidName){
                movies.push(element);
            }
        });
        var output = "{\"movies\":" + JSON.stringify(movies) + "}";
        if (!contains) {

            var writeData = fs.writeFile(basepath + "/movies.json",  output, (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                    parseMovies();
                }

            });
        }
    });
}





function addMovie(genre, name, img, mp4, baseUrl){
    var added = false;
    $('.genre').each(function(i, obj) {
        var genreName = $(obj).data("genre");
        if(genre === genreName){
            var selectedGenre = $(obj);
            console.log(baseUrl);
            selectedGenre.append(getMovieObject(name, img, mp4, baseUrl));
            added = true;
        }
    });


    if(!added){
        addGenre(genre);
        addMovie(genre, name, img, mp4, baseUrl);
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



function getMovieObject(name, img, mp4, baseUrl){
    return '<div class="video-item" data-mp4="' + mp4 + '" + data-name="' + name + '" + data-baseUrl="' + baseUrl + '">' +
        '<img class="video-img" src="' + img + '">' +
        '<h2 class="video-name">' + name + '</h2>' +
        '<div class="menu-bar"><button class="genre-btn">genre</button><button class="del-btn">delete</button></div>' +
        '</div>';
}