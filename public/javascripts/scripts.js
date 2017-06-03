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
            $('#chatlog').height(($('#chatbox').height() * 96 / 100) - 6);
            $('#msg-btn').height($('#chatbox').height() * 4 / 100);
            $('#msg-input').height($('#chatbox').height() * 4 / 100);
            $('#msg-input').css('font-size', $('#msg-input').height() - 5 + 'px');
        }, 401);
    }
});

socket.on('server-send-updated-cculist', function (data) {
    $('#ccu > p').each(function (index, element) {
        if (index > 0) {
            $(element).remove();
        }
    });
    $.each(data, function (index, item) {
        $('#ccu').append('<p class="text-center bg-info" style="padding: 10px 0;border: solid 1px silver;border-radius:2px;margin-bottom:0px;word-wrap:break-word;">' + item + '</p>');
    });
});

socket.on('server-broadcast-logout-info', function (data) {
    $('#ccu > p').each(function (index, element) {
        if (index > 0) {//ignore title element
            if ($(element).text() == data.user) {
                $(element).remove();
                return false;
            }
        }
    });
});

socket.on('server-broadcast-chat-msg', function (data) {
    $('#chatlog').append('<p style="margin:0 0 0 10px;font-size:25px;word-wrap:break-word;">' + data.user + ': ' + data.msg + '</p>');
    var chatlog = document.getElementById('chatlog');
    if (chatlog.clientHeight < chatlog.scrollHeight) chatlog.scrollTop = chatlog.scrollHeight;
});

$(function () {
    $('#reg-username').tooltip({ trigger: 'manual' });
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });
    $(window).on('beforeunload', function () {
        socket.emit('client-send-logout', $('#currentUserName').text());
    });

    //reg page
    $('#reg-btn').click(function () {
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
            $('#chatlog').html('');
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

    $(window).resize(function () {
        $('#ccu').height(($(window).height() - $('div#logout').height()));
        $('#chatbox').height(($(window).height() - $('div#logout').height()));
        $('#chatlog').height(($('#chatbox').height() * 96 / 100) - 6);
        $('#msg-btn').height($('#chatbox').height() * 4 / 100);
        $('#msg-input').height($('#chatbox').height() * 4 / 100);
        $('#msg-input').css('font-size', $('#msg-input').height() - 10 + 'px');
    });
});