//socket.io script
var socket = io();
var audio = new Object();

var ccuHide = {
    status: false,
    oldWindowWidth: $(window).width(),
    originalCCUWidth: 0,
    originalChatBoxWidth: 0
};

socket.on('disconnect', function () {
    swal({
        title: 'Disconnected',
        text: 'Disconnected from server',
        type: 'error',
        allowOutsideClick: false
    }).then(function () {
        window.location.href = 'about:blank';
    });
});

socket.on('reconnecting', attempt => {
    if (attempt > 3)
        socket.close();
});

socket.on('reconnect', attempt => {
    socket.close();
});

socket.on('server-send-reg-result', function (data) {
    if (!data)
        swal('Something wrong', 'The username has been used!', 'error');
    else {
        $('#reg-page').fadeOut(() => {
            $('#chat-page').fadeIn({
                progress: (animation, progress, remainingMs) => {
                    if ((progress >= 0.15 && progress <= 0.25) && $('body').css('background-color') != 'rgb(217, 220, 224)')
                        $('body').css('background-color', 'rgb(217, 220, 224)');
                }
            });
            //fix chat page
            if ($('#ccu-icon').css('padding') == '0px') {
                let a = ($('#ccu > div > div').height() + 20) / 2 - $('#ccu-icon').height() / 2 + 1;
                $('#ccu-icon').css({
                    'padding': '10px 10px 10px 10px',
                    'top': parseFloat($('#ccu > div > div').css('padding-top'))
                });
            }
            $('#msg-input').css('padding-left', (parseFloat($('#msg-input').css('height')) - parseFloat($('#msg-input').css('line-height'))) / 2);
            $('#chatlog > div > div#mCSB_1_container').css('left', ($('#ccu-icon').width() + 20) + 10 + 'px');
            $('div#ccu > div.panel.panel-default > ul.list-group').height($(window).height() - $('div#logout').height() - $('div#ccu > div.panel.panel-default > div.panel-heading').height() - 23);
            $('#chatbox').height(($(window).height() - $('div#logout').height()));
            if (checkClientSystemInfo().mobile) {
                $('#chatlog').height(($('#chatbox').height() * 95 / 100) - 6);
                $('#msg-btn').height($('#chatbox').height() * 5 / 100 + 4);
                $('#msg-input').height($('#chatbox').height() * 5 / 100);
            } else {
                $('#chatlog').height(($('#chatbox').height() * 97 / 100) - 6);
                $('#msg-btn').height($('#chatbox').height() * 3 / 100 + 4);
                $('#msg-input').height($('#chatbox').height() * 3 / 100);
            }
            $('#msg-btn').css({
                width: $('#msg-btn').height() + 15.5 + 'px',
                top: '1px',
                right: '2px'
            });
            $('div#tools.pull-right').css('margin', () => $('div#nav-bar.row').height() / 2 - $('div#tools.pull-right > a.tools').height() / 2 + 'px 10px 0 0px');
            $('div#tools.pull-right > a').each((index, element) => {
                if (index != $('div#tools.pull-right > a.tools').length - 1)
                    $(element).css('margin-right', '10px');
            });
        });
    }
});

socket.on('server-updated-cculist', function (data) {
    $('#mCSB_2_container > li.list-group-item').remove();//remove all li tag
    $.each(data.ccu, function (index, item) {
        var exist = false;
        //Continue next loop if any user in list existed
        $('#mCSB_2_container > li.list-group-item').each((index, element) => {
            if ($(element).text() == item) {
                exist = true;
                return false;
            }
        });
        if (exist) return true;
        //add users to CCU panel
        $('div#mCSB_2_container').append('<li class="list-group-item text-center" style="word-wrap:break-word;" data-username="' + item + '">' + item + '</li>');
        if (item == data.user) {
            $('div#mCSB_2_container > li.list-group-item[data-username="' + item + '"]').addClass('animated bounceInLeft');
            $('div#mCSB_2_container > li.list-group-item[data-username="' + item + '"]').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
                $('div#mCSB_2_container > li.list-group-item[data-username="' + item + '"]').removeClass('animated bounceInLeft');
            });
        };
    });
    //play sound XD
    if ($('#chat-page').css('display') != 'none') {
        setTimeout(function () {
            audio.in.play();
        }, 500);
    }
});

socket.on('server-send-logout-info', function (data) {
    $('div#mCSB_2_container > li.list-group-item').each(function (index, element) {
        if ($(element).text() == data) {
            $(element).addClass('animated bounceOutLeft');
            if ($(element).text() == $('#currentUserName').text()) {
                setTimeout(function () {
                    $('div#mCSB_2_container > li.list-group-item[data-username="' + data + '"]').removeClass('animated bounceInLeft');
                    $(element).remove();
                }, 1001);
            }
            else {
                $(element).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
                    $('div#mCSB_2_container > li.list-group-item[data-username="' + data + '"]').removeClass('animated bounceInLeft');
                    $(element).remove();
                });
            }
            if ($('#chat-page').css('display') != 'none') {
                audio.out.play();
            }
            return false;
        }
    });
});

socket.on('server-send-msg', function (data) {
    let fontSize = $('#ccu > div > div > p').css('font-size');
    $('#chatlog > div > div#mCSB_1_container').append('<p style="font-size:' + fontSize + ';word-wrap:break-word;"><span style="color:#ffc4c4;">' + data.user + '</span><span>: ' + data.msg + '</span></p>');
    if ($('#chat-page').css('display') != 'none' && $('#currentUserName').text() != data.user) {
        audio.msg.play();
    }
});
$(function () {
    //load sounds effect
    //-GOOGLE DRIVE BLOCK 24H
    // audio.in = new Audio('https://drive.google.com/uc?export=download&id=0B6OTfTktDXsKSWpmVUh6dWZtdlk');
    // audio.out = new Audio('https://drive.google.com/uc?export=download&id=0B6OTfTktDXsKcWJHZGRxN3FVbFE');
    // audio.msg = new Audio('https://drive.google.com/uc?export=download&id=0B6OTfTktDXsKZzNNX2xmZ19KNVE');
    // audio.typing = new Audio('https://drive.google.com/uc?export=download&id=0B6OTfTktDXsKYXlnQUlfSnFtdk0');
    //-DROPBOX
    audio.in = new Audio('https://www.dropbox.com/s/dx8psffosukivut/capisci.mp3?dl=1');
    audio.out = new Audio('https://www.dropbox.com/s/3kekrb3khejwjhn/out.mp3?dl=1');
    audio.msg = new Audio('https://www.dropbox.com/s/tk1w2hs95yqg8oh/235911_thegertz_notification-sound.mp3?dl=1');
    audio.typing = new Audio('https://www.dropbox.com/s/9vqq4m2qjy0zwx8/159723__kentvideoproduction__ipad-button-sound-effect.mp3?dl=1');
    //on user resize browser
    var mobileOldSize = {
        width: $(window).width(),
        height: $(window).height()
    };
    $(window).resize(function () {
        $('#reg-page').css('margin-top', ($(window).height() / 2) - ($('#reg-page').height() / 2));
        let fontSize = $('#ccu > div > div > p').css('font-size');
        $('#chatlog > div > div#mCSB_1_container > p').css('font-size', fontSize);
        if ($('#chat-page').css('display') == 'block' && $(window).width != ccuHide.oldWindowWidth) {
            ccuHide.status = false;
        }
        $('#chatlog > div > div#mCSB_1_container').css('left', ($('#ccu-icon').width() + 20) + 10 + 'px');
        $('#msg-input').css('padding-left', (parseFloat($('#msg-input').css('height')) - parseFloat($('#msg-input').css('line-height'))) / 2);
        if (checkClientSystemInfo().mobile) {
            if ($(window).height() < mobileOldSize.height && $(window).width() == mobileOldSize.width) {
                //this case trigger when user keyboard showing up and we will ingnore/not do anything
            }
            else {
                // $('#chatlog > div > div#mCSB_1_container').append('<p style="margin:0 0 0 10px;font-size:25px;word-wrap:break-word;"><span style="color:#ffc4c4;">window resize</p>');
                $('div#ccu > div.panel.panel-default > ul.list-group').height($(window).height() - $('div#logout').height() - $('div#ccu > div.panel.panel-default > div.panel-heading').height() - 23);
                $('#chatbox').height(($(window).height() - $('div#logout').height()));
                $('#chatlog').height(($('#chatbox').height() * 95 / 100) - 6);
                $('#msg-btn').height($('#chatbox').height() * 5 / 100 + 4);
                $('#msg-input').height($('#chatbox').height() * 5 / 100);
            }
        } else {
            $('div#ccu > div.panel.panel-default > ul.list-group').height($(window).height() - $('div#logout').height() - $('div#ccu > div.panel.panel-default > div.panel-heading').height() - 23);
            $('#chatbox').height(($(window).height() - $('div#logout').height()));
            $('#chatlog').height(($('#chatbox').height() * 97 / 100) - 6);
            $('#msg-btn').height($('#chatbox').height() * 3 / 100 + 4);
            $('#msg-input').height($('#chatbox').height() * 3 / 100);
        }
        $('#msg-btn').css({
            width: $('#msg-btn').height() + 15.5 + 'px',
            top: '1px',
            right: '2px'
        });
        mobileOldSize.width = $(window).width();
        mobileOldSize.height = $(window).height()
    });

    //set #reg-page to middle of browser
    $('#reg-page').css('margin-top', ($(window).height() / 2) - ($('#reg-page').height() / 2));
    //fix for a.tools
    $('div#tools.pull-right > a').css({
        'color': 'black',
        'text-decoration': 'none'
    });
    //mCustomScrollbar
    $('#chatlog').mCustomScrollbar({
        axis: 'y',
        theme: "dark-3",
        scrollButtons: { enable: false },
        keyboard: { enable: false },
        contentTouchScroll: 10,
        documentTouchScroll: true,
        autoHideScrollbar: true,
        callbacks: {
            onOverflowY: () => $('#chatlog').mCustomScrollbar("scrollTo", 'bottom'),
            onUpdate: () => {
                if ($('#chatlog').height() < $('#chatlog > div > div#mCSB_1_container').height()) {
                    $('#chatlog').mCustomScrollbar("scrollTo", 'bottom', {
                        scrollEasing: "easeOut"
                    });
                }
            }
        }
    });

    $('div#ccu > div.panel.panel-default > ul.list-group').mCustomScrollbar({
        axis: 'y',
        theme: "dark-3",
        scrollButtons: { enable: false },
        keyboard: { enable: false },
        contentTouchScroll: 10,
        documentTouchScroll: true,
        autoHideScrollbar: true
    });


    //tooltip
    $('#reg-username').tooltip({ trigger: 'manual' });
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });
    $('.tools').tooltip({ trigger: 'hover' });

    //trigger when user close/reload/etc web
    $(window).on('beforeunload', function () {
        if ($('#chat-page').css('display') != 'none') socket.emit('client-send-logout', $('#currentUserName').text());
    });

    //==================reg page
    $('#reg-btn').click(function (e) {
        checkRegistration();
    });

    $("#reg-username").on('keydown', function (e) {
        if (e.keyCode == 13) {
            checkRegistration();
            return false;
        }
    });

    //==================chatting page
    //clear # href
    $('div#tools > a').click((e) => e.preventDefault());
    $('#ccu-icon').click((e) => e.preventDefault());
    // //trigger when user click canvas icon
    // $('a#canvas-icon.tools').click(() => {
    //     if ($('div#private-chat-page').css('display') != 'none') {

    //     }
    // });

    //trigger when user click hide/show CCUs button
    $('#ccu-icon').click(() => {
        if (!ccuHide.status) {//no need to check devices size cause we checked it in JQuery .resize handle event
            if ($('#ccu').width()) {
                ccuHide.originalCCUWidth = $('#ccu').width();
                ccuHide.originalChatBoxWidth = $('#chatbox').width();
            } else {
                if ($(window).width() < 768) {//extra small devices
                    ccuHide.originalCCUWidth = $(window).width() / 12 * 4;
                    ccuHide.originalChatBoxWidth = $(window).width() / 12 * 8;
                } else {
                    ccuHide.originalCCUWidth = $(window).width() / 12 * 2;
                    ccuHide.originalChatBoxWidth = $(window).width() / 12 * 10;
                }
            }
            ccuHide.status = true;
        }
        if ($('#ccu').width()) {//HIDE
            $('#chatbox').css({ float: 'right', clear: 'right' }).width((ccuHide.originalCCUWidth + ccuHide.originalChatBoxWidth));
            $('#ccu').width(0);
            setTimeout(function () {//fix panel heading of ccu list
                $('div.panel-heading').css('display', 'none');
            }, 500 / 2);
            setTimeout(function () {//replace col-* class
                $('#chatbox').addClass('col-xs-12');
                $('#chatbox').removeClass('col-xs-8 col-sm-10').css('width', '');
            }, 501);
        } else {//SHOW
            $('#ccu').width(ccuHide.originalCCUWidth);
            $('#chatbox').width(ccuHide.originalChatBoxWidth);
            setTimeout(function () {//fix panel heading of ccu list
                $('div.panel-heading').css('display', '');
                setTimeout(function () {
                    $('div#ccu > div.panel.panel-default > ul.list-group').height($(window).height() - $('div#logout').height() - $('div#ccu > div.panel.panel-default > div.panel-heading').height() - 23);
                }, 100);
            }, 500 / 2);
            setTimeout(function () {//replace col-* class
                $('#chatbox').addClass('col-xs-8 col-sm-10').removeClass('col-xs-12').css({ float: 'right', clear: 'right', width: '' });
                $('#ccu').css('width', '');
            }, 501);
        }
    });

    //trigger when user click logout button
    $('#logout-btn').click(function () {
        $('#chat-page').fadeOut({
            done: (animation, jumpedToEnd) => {
                $('#reg-page').fadeIn({
                    start: (animation) => {
                        if ($('body').css('background-color') != 'rgb(255, 255, 255)')
                            $('body').css('background-color', 'rgb(255, 255, 255)');
                    }
                });
            }
        });
        socket.emit('client-send-logout', $('#currentUserName').text());
    });

    //trigger when user click send msg button
    $('#msg-btn').click(function () {
        checkMessage();
        return false;
    });

    //trigger when user press enter key
    $("#msg-input").on('keydown', function (e) {
        if (e.keyCode == 13) {
            checkMessage();
            return false;
        }
    });

    //copy right
    let date = new Date();
    $('#copy-right').append(date.getFullYear());
});

function checkMessage() {
    $('#msg-input').val($.trim($('#msg-input').val()));
    if ($('#msg-input').val() == '') {
        $('[data-toggle="tooltip"]').tooltip('show');
        setTimeout(function () {
            $('[data-toggle="tooltip"]').tooltip('hide');
        }, 2000);
    } else {
        var encodedMessage = he.encode($('#msg-input').val(), { useNamedReferences: true });
        socket.emit('client-send-chat-msg', { user: $('#currentUserName').text(), msg: encodedMessage });
        $('#msg-input').val('');
        audio.typing.play();
    }
}

function checkRegistration() {
    $('#reg-username').val($.trim($('#reg-username').val()));
    var registerRegexUnicode = {
        check1: XRegExp('^[\\p{L}\\p{Z}\\p{N}]+$').test($('#reg-username').val()),
        check2: 0
    };
    XRegExp.forEach($('#reg-username').val(), /\s/, (match, i) => {
        registerRegexUnicode.check2++;
    });
    //console.log('check1: ' + registerRegexUnicode.check1 + '\tcheck2: ' + registerRegexUnicode.check2);
    if ($('#reg-username').val() == '') {
        $('#reg-username').attr('data-original-title', 'Please input username!');
        $('#reg-username').tooltip('show');
        setTimeout(function () {
            $('#reg-username').tooltip('hide');
        }, 2000);
    }
    else if ($('#reg-username').val().length > 20) {
        $('#reg-username').attr('data-original-title', 'Username must less than 20 character');
        $('#reg-username').tooltip('show');
        setTimeout(function () {
            $('#reg-username').tooltip('hide');
        }, 2000);
    }
    else if (!registerRegexUnicode.check1) {
        $('#reg-username').attr('data-original-title', 'Please input valid username');
        $('#reg-username').tooltip('show');
        setTimeout(function () {
            $('#reg-username').tooltip('hide');
        }, 2000);
    }
    else if (registerRegexUnicode.check2 > 3) {
        $('#reg-username').attr('data-original-title', 'Too many whitespace, maximum is 4!');
        $('#reg-username').tooltip('show');
        setTimeout(function () {
            $('#reg-username').tooltip('hide');
        }, 2000);
    }
    else {
        socket.emit('client-send-reg-info', $('#reg-username').val());
        $('#currentUserName').text($('#reg-username').val());
        $('#msg-input').focus();
        $('#chatlog > div > div#mCSB_1_container').html('');
    }
}
function checkClientSystemInfo() { !function (s) { var e = "-", i = ""; screen.width && (width = screen.width ? screen.width : "", height = screen.height ? screen.height : "", i += "" + width + " x " + height); var r, n, o, d = navigator.appVersion, a = navigator.userAgent, t = navigator.appName, c = "" + parseFloat(navigator.appVersion), w = parseInt(navigator.appVersion, 10); -1 != (n = a.indexOf("Opera")) && (t = "Opera", c = a.substring(n + 6), -1 != (n = a.indexOf("Version")) && (c = a.substring(n + 8))), -1 != (n = a.indexOf("OPR")) ? (t = "Opera", c = a.substring(n + 4)) : -1 != (n = a.indexOf("Edge")) ? (t = "Microsoft Edge", c = a.substring(n + 5)) : -1 != (n = a.indexOf("MSIE")) ? (t = "Microsoft Internet Explorer", c = a.substring(n + 5)) : -1 != (n = a.indexOf("Chrome")) ? (t = "Chrome", c = a.substring(n + 7)) : -1 != (n = a.indexOf("Safari")) ? (t = "Safari", c = a.substring(n + 7), -1 != (n = a.indexOf("Version")) && (c = a.substring(n + 8))) : -1 != (n = a.indexOf("Firefox")) ? (t = "Firefox", c = a.substring(n + 8)) : -1 != a.indexOf("Trident/") ? (t = "Microsoft Internet Explorer", c = a.substring(a.indexOf("rv:") + 3)) : (r = a.lastIndexOf(" ") + 1) < (n = a.lastIndexOf("/")) && (t = a.substring(r, n), c = a.substring(n + 1), t.toLowerCase() == t.toUpperCase() && (t = navigator.appName)), -1 != (o = c.indexOf(";")) && (c = c.substring(0, o)), -1 != (o = c.indexOf(" ")) && (c = c.substring(0, o)), -1 != (o = c.indexOf(")")) && (c = c.substring(0, o)), w = parseInt("" + c, 10), isNaN(w) && (c = "" + parseFloat(navigator.appVersion), w = parseInt(navigator.appVersion, 10)); var W = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(d), f = navigator.cookieEnabled ? !0 : !1; "undefined" != typeof navigator.cookieEnabled || f || (document.cookie = "testcookie", f = -1 != document.cookie.indexOf("testcookie") ? !0 : !1); var b = e, O = [{ s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ }, { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ }, { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ }, { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ }, { s: "Windows Vista", r: /Windows NT 6.0/ }, { s: "Windows Server 2003", r: /Windows NT 5.2/ }, { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ }, { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ }, { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ }, { s: "Windows 98", r: /(Windows 98|Win98)/ }, { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ }, { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ }, { s: "Windows CE", r: /Windows CE/ }, { s: "Windows 3.11", r: /Win16/ }, { s: "Android", r: /Android/ }, { s: "Open BSD", r: /OpenBSD/ }, { s: "Sun OS", r: /SunOS/ }, { s: "Linux", r: /(Linux|X11)/ }, { s: "iOS", r: /(iPhone|iPad|iPod)/ }, { s: "Mac OS X", r: /Mac OS X/ }, { s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ }, { s: "QNX", r: /QNX/ }, { s: "UNIX", r: /UNIX/ }, { s: "BeOS", r: /BeOS/ }, { s: "OS/2", r: /OS\/2/ }, { s: "Search Bot", r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }]; for (var g in O) { var p = O[g]; if (p.r.test(a)) { b = p.s; break } } var u = e; switch (/Windows/.test(b) && (u = /Windows (.*)/.exec(b)[1], b = "Windows"), b) { case "Mac OS X": u = /Mac OS X (10[\.\_\d]+)/.exec(a)[1]; break; case "Android": u = /Android ([\.\_\d]+)/.exec(a)[1]; break; case "iOS": u = /OS (\d+)_(\d+)_?(\d+)?/.exec(d), u = u[1] + "." + u[2] + "." + (0 | u[3]) }var h = "no check"; if ("undefined" != typeof swfobject) { var x = swfobject.getFlashPlayerVersion(); h = x.major > 0 ? x.major + "." + x.minor + " r" + x.release : e } s.jscd = { screen: i, browser: t, browserVersion: c, browserMajorVersion: w, mobile: W, os: b, osVersion: u, cookies: f, flashVersion: h } }(this); var s = { os: jscd.os, osVersion: jscd.osVersion, browser: jscd.browser, browserVersion: jscd.browserVersion, browserMajorVersion: jscd.browserMajorVersion, mobile: jscd.mobile, flash: jscd.flash, cookie: jscd.cookies, screenSize: jscd.screen, userAgent: navigator.userAgent }; return s }