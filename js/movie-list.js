
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
let info = undefined;

var baseAddr = '162.208.8.88';

function readInfo(){
    const app = electron.remote.app;
    let base = app.getAppPath();
    fs.readFile(base + "/user.json", "utf8", (err, data) => {
        if (err) {
            console.log("doesn't exsist");
        }
        setTimeout(function(){
            info = JSON.parse(data.toString());

        }, 150)
    });
}

readInfo();


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

/**
 * Step 1: Loop through the json objects of videos
 * count the number of items in the genre,
 * assign a count to number of items in the genre
 * Step 2: Determinene the the max number of items
 * per row using the screens size (will require trial
 * and error to come up with the right formula)
 * Step 3: Begin to try and add the some genres together
 * using the
 * */
function sortAlgorithm(){




}

function registerDebug(){
    var control = false;

    document.addEventListener('keydown', (event) => {
       if(event.key === 'Control') control = true;
       if(control){
           if(event.key === 'd'){
               electron.remote.getCurrentWindow().webContents.toggleDevTools();
           }
       }

    });
    document.addEventListener('keyup', (event) => {
        if(event.key === 'Control') control = false;

    });

}
var isDel = false;
$(document).ready(function(){




    setTimeout(function(){
            $("#username").html("Welcome, " + info.Username + ". <a id='signout' href='login.html'>Sign out?</a>");
            $("#username").slideDown();
        }, 400);


    registerDebug();
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', './assets/sounds/click.mp3');


    storage.setDataPath(os.tmpdir());
    parseMovies();
    //
    // $("#debug").click(function(){
    //     electron.remote.getCurrentWindow().webContents.toggleDevTools();
    // });

    $(".inp-cbx").click(function(){
        isTvShow = !isTvShow;

        if(isTvShow){
            $("#add-title").text("Add Tv Show");
        }else{
            $("#add-title").text("Add Movie");
        }
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

    $("#movies-container").on("mouseenter", ".video-item", function(){
        $(this).find(".video-name").addClass("slideName");
        $(this).find(".menu-bar").addClass("slideMenu");
    });
    $("#movies-container").on("mouseleave", ".video-item", function(){
        $(this).find(".video-name").removeClass("slideName");
        $(this).find(".menu-bar").removeClass("slideMenu");
    });

    $("#movies-container").on("click", ".genre-label", function(){
        var genreObj = $(this).parent().parent();
        var genreName = $(this).text();
        console.log(name);
        if(genreObj.hasClass("min")){
            genreObj.removeClass("min");
            writeMin(genreName, false);
        }else{
            genreObj.addClass("min");
            writeMin(genreName, true);
        }
    });

    $("#movies-container").on("mouseleave", ".del-genre", function(){
    });

    $("#movies-container").on("click", ".video-item", function(){
        if(!isDel){
            let name = $(this).find(".video-name").text();
            let mp4 = $(this).data("mp4");
            baseUrl = $(this).data("baseurl");
            setCurrentMovie(name, mp4);

            audioElement.play();
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

    $("#addItem").click(function(){
        $(".add-movie").slideDown();
        $("#overlay").fadeIn();
        disableScroll();
        startJava();
        shown = false;
        shown2 = false;
    });

    $("#pushItem").click(function(){
        uploadMovie();
    });


    $("#pullItem").click(function(){
        pullLibrary();
    })



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

    setTimeout(function () {
        fixSizing();
    }, 100);
});




function loadMin(){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        uploadMovie();
        var file = JSON.parse(data.toString());
        var movies = [];
        var contains = false;
        $.each(file.movies, function(index, element) {
            var genre = element.genre;
            var min = element.min;

            if(min){
                $('.genre').each(function(i, obj) {
                   if($(obj).data('genre') === genre){
                       $(obj).addClass('min');
                   }
                });
            }

        });
    });
}


function writeMin(genre, value){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8", (err, data) => {
        if (err) {
            return console.error(err);
        }
        ;
        uploadMovie();
        var file = JSON.parse(data.toString());
        var movies = [];
        var contains = false;
        var realVideo;
        var found = false;
        $.each(file.movies, function(index, element) {
            if(element.genre === genre){
                realVideo = {
                    "mp4": element.mp4,
                    "img": element.img,
                    "genre": element.genre,
                    "name": element.name,
                    "time": element.time,
                    "baseUrl": element.baseUrl,
                    "min": value
                };
                movies.push(realVideo);
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
    });
}

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



    socket.on('not_found', function(data){
        stopJava();
        $(".add-movie").slideUp();
        $("#overlay").fadeOut();
        $(".lds-facebook").hide();
        enableScroll();
        Alert.info("Not found!", data.name);
    });

    socket.on("log", function(data){
        if(data.name !== "NA"){
            Alert.info(data.message, data.name);
        }else{
            Alert.info(data.message);
        }
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
            }, index * 500);
        });
        setTimeout(function () {
            parseMovies();
            $(".add-movie").slideUp();
            $("#overlay").fadeOut();
            $(".lds-facebook").hide();
            enableScroll();
            uploadMovie();
        }, (waitTime * 500) + 100);
    });
});




function stopJava(){
    $(".add-movie").slideUp();
    $("#overlay").fadeOut();
    $(".lds-facebook").hide();
    enableScroll();


    console.log("stop java");

    child.kill();
}


function startJava(){
    console.log('start java');
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    console.log(basepath);
    var executablePath;
    var gecko;
    var bin;

    if(process.platform === "win32"){
        executablePath = basepath + "\\assets\\adder.jar";
        gecko = basepath + "\\assets\\geckodriver.exe";
        bin = basepath + "\\assets\\winFox\\firefox.exe";
    }else{
        executablePath = basepath + "/assets/adder.jar";
        gecko = basepath + "/assets/geckodriver";
        bin = basepath + "/assets/macFox/Firefox.app/Contents/MacOS/firefox";
    }



    var spawn = require('child_process').spawn;
    child = spawn('java', ['-jar', executablePath, gecko, bin]);
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
    $("#refreshItem").click(function(){
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
        if(query === ""){
            $('.video-item').each(function(i, obj) {
                var parent = $(this).parent();
                parent.show();
                $(this).show();
            });

                parseMovies();
                fixSizing();

        }else{
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

        }
        setTimeout(function(){
            fixSizing();
        }, 50);
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


        loadMin();
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


function uploadMovie(){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    fs.readFile(basepath + "/movies.json", "utf8",  (err, data)  => {
        if (err) {
            return console.error(err);
        }else {
            setTimeout(function () {
                let text = data.toString();
                $.post('http://162.208.8.88/push.php', {data: text, library: info.Library},
                    function (returnedData) {
                        Alert.info("Success!", "Saved your library!")
                    });
            }, 300);
        }
    });
}

function pullLibrary(){
    const app = electron.remote.app;
    var basepath = app.getAppPath();
    $.post('http://162.208.8.88/pull.php', {library: info.Library},
        function (data) {
            fs.writeFile(basepath + "/movies.json", data.toString(), (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                    console.log("success");
                    parseMovies();
                }
            });
        });
}


function success(result) {
    alert('Process achieved!');
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