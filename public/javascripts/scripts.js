//socket.io script
var socket = io();
var audio = {
    in: new Audio('/sounds/capisci.mp3'),
    out: new Audio('/sounds/out.mp3'),
    msg: new Audio('/sounds/235911_thegertz_notification-sound.mp3')
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
    if (attempt > 3) {
        socket.close();
    }
});

socket.on('server-send-reg-result', function (data) {
    if (!data) {
        swal('Something wrong', 'The username has been used!', 'error');
    } else {
        $('#reg-page').fadeOut();
        setTimeout(function () {
            $('#chat-page').fadeIn();
            //fix chat page
            $('#ccu').height(($(window).height() - $('div#logout').height()));
            $('#chatbox').height(($(window).height() - $('div#logout').height()));
            $('#chatlog').height(($('#chatbox').height() * 97 / 100) - 6);
            $('#msg-btn').height($('#chatbox').height() * 3 / 100);
            $('#msg-input').height($('#chatbox').height() * 3 / 100);
            $('#msg-input').css('font-size', $('#msg-input').height() - 7 + 'px');
            $('div#tools.pull-right').css('margin', () => $('div#nav-bar.row').height() / 2 - $('div#tools.pull-right > a.tools').height() / 2 + 'px 10px 0 0px');
            $('div#tools.pull-right > a').each((index, element) => {
                if (index != $('div#tools.pull-right > a.tools').length - 1) {
                    $(element).css('margin-right', '10px');
                }
            });
        }, 401);
    }
});

socket.on('server-updated-cculist', function (data) {
    $('div#ccu > div.panel.panel-default > ul.list-group > li.list-group-item').remove();
    $.each(data.ccu, function (index, item) {
        $('div#ccu > div.panel.panel-default > ul.list-group').append('<li class="list-group-item text-center" style="word-wrap:break-word;" data-username="' + item + '">' + item + '</li>');
        if (item == data.user) {
            $('div#ccu > div.panel.panel-default > ul.list-group > li.list-group-item[data-username="' + item + '"').addClass('animated bounceInLeft');
        };
    });
    if ($('#chat-page').css('display') != 'none') {
        setTimeout(function () {
            audio.in.play();
        }, 500);
    }
});

socket.on('server-send-logout-info', function (data) {
    $('div#ccu > div.panel.panel-default > ul.list-group > li.list-group-item').each(function (index, element) {
        if ($(element).text() == data) {
            $(element).addClass('animated bounceOutLeft');
            $(element).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
                $(element).remove();
            });
            if ($('#chat-page').css('display') != 'none') {
                audio.out.play();
            }
            return false;
        }
    });
});

socket.on('server-send-msg', function (data) {
    $('#chatlog > div > div#mCSB_1_container').append('<p style="margin:0 0 0 10px;font-size:25px;word-wrap:break-word;"><span style="color:#ffc4c4;">' + data.user + '</span>: ' + data.msg + '</p>');
    if ($('#chat-page').css('display') != 'none' && $('#currentUserName').text() != data.user) {
        audio.msg.play();
    }
});

$(function () {
    //on user resize browser
    $(window).resize(function () {
        $('#reg-page').css('margin-top', ($(window).height() / 2) - ($('#reg-page').height() / 2));
        $('#ccu').height(($(window).height() - $('div#logout').height()));
        $('#chatbox').height(($(window).height() - $('div#logout').height()));
        $('#chatlog').height(($('#chatbox').height() * 97 / 100) - 6);
        $('#msg-btn').height($('#chatbox').height() * 3 / 100);
        $('#msg-input').height($('#chatbox').height() * 3 / 100);
        $('#msg-input').css('font-size', $('#msg-input').height() - 7 + 'px');
    });

    //set #reg-page to middle of browser
    $('#reg-page').css('margin-top', ($(window).height() / 2) - ($('#reg-page').height() / 2));
    //fix for a.tools
    $('div#tools.pull-right > a.tools').css({
        'color': 'black',
        'text-decoration': 'none'
    });

    $('#chatlog').mCustomScrollbar({
        axis: 'y',
        theme: "dark-3",
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
    $('a.tools').click((e) => e.preventDefault());
    //trigger when user click canvas icon
    $('a#canvas-icon.tools').click(() => {
        if ($('div#private-chat-page').css('display') != 'none') {

        }
    });

    //trigger when user click logout button
    $('#logout-btn').click(function () {
        $('#chat-page').fadeOut();
        setTimeout(function () {
            $('#reg-page').fadeIn();
        }, 401);
        socket.emit('client-send-logout', $('#currentUserName').text());
    });

    //trigger when user click send msg button
    $('#msg-btn').click(function () {
        checkMessage();
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
        var encodedMessage = he.encode($('#msg-input').val(), {useNamedReferences:true});
        socket.emit('client-send-chat-msg', { user: $('#currentUserName').text(), msg: encodedMessage});
        $('#msg-input').val('');
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
        $('#reg-username').tooltip({'selector':'body','padding':0});
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