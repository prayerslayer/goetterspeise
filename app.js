var express = require( 'express' ),
	path = require( "path" ),
	routes = require( "./routes" ),
	app = express();

app.configure( function() {
	app.set( 'views', __dirname + '/partials' );
	app.set( 'view engine', 'mmm' );
	app.set( 'layout', 'layout' );
	app.use( express.favicon() );
	app.use( express.logger( 'dev' ) );
	app.use( express.bodyParser() );
	app.use( express.methodOverride() );
	app.use( express.cookieParser('Fee-fi-fo-fum') );
	app.use( express.session() );
	app.use( app.router );
	app.use( express.static( path.join( __dirname, 'public' ) ) );
});

app.get( '/', routes.index );
app.get( "/read/:something?", function( req, res ) {
	return res.render( "read", {
		"next_title": "New stuff", 
		"prev_title": "This is old"
	});
});

app.listen( process.env.PORT );