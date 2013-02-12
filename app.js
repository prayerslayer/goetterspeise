var bogart = require( 'bogart' )
	path = require( "path" );

var router = bogart.router()
	views = bogart.viewEngine( "mustache", path.join( bogart.maindir(), "public/templates") );

router.get('/', function() {
  return bogart.html('Hello World');
});

router.get( "/hello/:name", function( req ) {
	return views.respond( "hello.html", {
		"locals": {
			"name": req.params.name
		}
	});
});

var app = bogart.app();

app.use(bogart.batteries); // A batteries included JSGI stack including streaming request body parsing, session, flash, and much more.
app.use(router); // Our router

app.start( process.env.PORT );