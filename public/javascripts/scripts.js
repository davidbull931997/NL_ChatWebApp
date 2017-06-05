//socket.io script
var socket = io();

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
        }, 401);
    }
});

socket.on('server-updated-cculist', function (data) {
    $('div#ccu > div.panel.panel-default > ul.list-group > li.list-group-item').remove();
    $.each(data.ccu, function (index, item) {
        $('div#ccu > div.panel.panel-default > ul.list-group').append('<li class="list-group-item" style="word-wrap:break-word;" data-username="' + item + '">' + item + '</li>');
        if (item == data.user) {
            $('div#ccu > div.panel.panel-default > ul.list-group > li.list-group-item[data-username="' + item + '"').addClass('animated bounceInLeft');
        };
    });
    if ($('#chat-page').css('display') != 'none') {
        let sound = new Audio('/sounds/capisci.mp3');
        setTimeout(function () {
            sound.play();
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
            return false;
        }
    });
    if ($('#chat-page').css('display') != 'none') {
        let sound = new Audio('/sounds/out2.aac');
        sound.play();
    }
});

socket.on('server-send-msg', function (data) {
    $('#chatlog > div > div#mCSB_1_container').append('<p style="margin:0 0 0 10px;font-size:25px;word-wrap:break-word;"><span style="color:#ffc4c4;">' + data.user + '</span>: ' + data.msg + '</p>');
    if ($('#chat-page').css('display') != 'none') {
        let sound = new Audio('/sounds/thegertz.wav');
        sound.play();
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

    //trigger when user close/reload/etc web
    $(window).on('beforeunload', function () {
        if($('#chat-page').css('display')!='none') socket.emit('client-send-logout', $('#currentUserName').text());
    });

    //reg page
    $('#reg-btn').click(function () {
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
        else {
            socket.emit('client-send-reg-info', $('#reg-username').val());
            $('#currentUserName').text($('#reg-username').val());
            $('#msg-input').focus();
            $('#chatlog > div > div#mCSB_1_container').html('');
        }
        return false;
    });

    $("#reg-username").on('keydown', function (e) {
        if (e.keyCode == 13) {
            if ($('#reg-username').val() == '') {
                $('#reg-username').tooltip('show');
                setTimeout(function () {
                    $('#reg-username').tooltip('hide');
                }, 2000);
            }
            else {
                socket.emit('client-send-reg-info', $('#reg-username').val());
                $('#currentUserName').text($('#reg-username').val());
                $('#msg-input').focus();
            }
            return false;
        }
    });

    //chatting page
    $('#logout-btn').click(function () {
        $('#chat-page').fadeOut();
        setTimeout(function () {
            $('#reg-page').fadeIn();
        }, 401);
        socket.emit('client-send-logout', $('#currentUserName').text());
        return false;
    });

    $('#msg-btn').click(function () {
        if ($('#msg-input').val() == '') {
            $('[data-toggle="tooltip"]').tooltip('show');
            setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip('hide');
            }, 2000);
        } else {
            socket.emit('client-send-chat-msg', { user: $('#currentUserName').text(), msg: $('#msg-input').val() });
            $('#msg-input').val('');
        }
        return false;
    });

    $("#msg-input").on('keydown', function (e) {
        if (e.keyCode == 13) {
            if ($('#msg-input').val() == '') {
                $('[data-toggle="tooltip"]').tooltip('show');
                setTimeout(function () {
                    $('[data-toggle="tooltip"]').tooltip('hide');
                }, 2000);
            } else {
                socket.emit('client-send-chat-msg', { user: $('#currentUserName').text(), msg: $('#msg-input').val() });
                $('#msg-input').val('');
            }
            return false;
        }

    });

    //copy right
    let date = new Date();
    $('#copy-right').append(date.getFullYear());
});