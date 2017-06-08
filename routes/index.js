var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//test canvas
router.get('/canvas', function (req, res, next) {
  res.render('canvas');
});

module.exports = router;
