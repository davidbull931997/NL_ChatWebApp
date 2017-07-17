var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

//declare socket.io to use at bin/www (without server listen)
app.io = require('socket.io')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images/favico.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https')
    return res.redirect(['https://', req.hostname, req.url].join(''));
  return next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var CCUs = [];

//socket.io on client connect event
app.io.on('connection', function (socket) {
  console.log('a user connected - socketId: ' + socket.id);

  socket.on('disconnect', () => {
    // console.log('Client disconnected - socketId: ' + socket.id);
    if (CCUs.indexOf(socket.username) >= 0) {
      CCUs.splice(CCUs.indexOf(socket.username), 1);
      app.io.sockets.emit('server-send-logout-info', socket.username);
    }
  });

  socket.on('client-send-reg-info', function (data) {
    if (CCUs.indexOf(data) >= 0) {
      socket.emit('server-send-reg-result', false);
    } else {
      socket.username = data;
      CCUs.push(data);
      socket.emit('server-send-reg-result', true);
      app.io.sockets.emit('server-updated-cculist', { ccu: CCUs, user: data });
    }
  });

  socket.on('client-send-logout', function (data) {
    CCUs.splice(CCUs.indexOf(data), 1);
    app.io.sockets.emit('server-send-logout-info', data);
  });

  socket.on('client-send-chat-msg', function (data) {
    app.io.sockets.emit('server-send-msg', data);
  });
});

module.exports = app;
