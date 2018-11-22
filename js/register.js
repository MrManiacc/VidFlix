let fs = require('fs');
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();
let username;
let password;

checkUserInfo();

$(document).ready(function(){
    $( ".btn" ).click(function( ) {
        username = $("#username").val();
        password = $("#password").val();
        registerAccount(username, password);
    });
});


function registerAccount(username, password){
    $.get( "http://162.208.8.88/reg.php", { Username: username, Password: password } )
        .done(function( data ) {
            processData(data.type, data.data);
    });
}

function processData(type, data){
    if(type.includes("message")){
        Alert.info(data);
    }
    if(type.includes("accountStatus")){
        Alert.success("Welcome, " + username);
        let info = {"Username": username, "Password": password, "Library": data};
        writeUserInfo(info);

    }
}

function checkUserInfo(){
    const app = electron.remote.app;
    let base = app.getAppPath();
    fs.readFile(base + "/user.json", "utf8", (err, data) => {
        if (err) {
            console.log("doesn't exsist");
        }
        let user = JSON.parse(data.toString());
        setTimeout(function(){
            $.get( "http://162.208.8.88/log.php", { Username: user.Username, Password: user.Password } )
                .done(function( data ) {
                    if(data.logged){
                        console.log("logged in");

                    }
                });
        }, 500)
    });
}


function writeUserInfo(info){
    const app = electron.remote.app;
    let base = app.getAppPath();
    fs.writeFile(base + "/user.json", JSON.stringify(info, null, 2), (err, result) => {  // WRITE
        if (err) {
            return console.error(err);
        } else {
            fs.writeFile(base + "/movies.json",  "{\"movies\":[]}", (err, result) => {  // WRITE
                if (err) {
                    return console.error(err);
                } else {
                    win.loadFile("index.html");
                }
            });

        }
    });
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
