var express = require( 'express' ),
	path = require( "path" ),
	site = require( "./site" ),
	user = require( "./user" ),
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
	app.use( express.session({
		"secret": process.env.SESSION_SECRET
	}) );
	app.use( app.router );
	app.use( express.static( path.join( __dirname, 'public' ) ) );
});
// main page
app.get( '/', site.index );
// login page
app.get( "/logout/?", user.logout );
app.get( "/login/:secret?", user.login );
app.post( "/login/?", user.send_login );
// read page
app.get( "/read/:something", user.read );

app.listen( process.env.PORT );