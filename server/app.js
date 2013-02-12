var bogart = require('bogart');

var router = bogart.router();

router.get('/', function() {
  return bogart.html('Hello World');
});

var app = bogart.app();

app.use(bogart.batteries); // A batteries included JSGI stack including streaming request body parsing, session, flash, and much more.
app.use(router); // Our router

app.start();