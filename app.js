var express = require( 'express' ),
	path = require( "path" ),
	pg = require( "pg" ),
	db = require( "any-db" ),
	pool = db.createPool( process.env.DB_URL, {
		"min": 1,
		"max": 20
	}),
	site = require( "./site" ),
	api = require( "./api" )( pool ),
	user = require( "./user" )( pool, api.user )
	app = express();

// configure application
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
app.get( "/login/?", user.login );
app.post( "/login/?", user.register );
// read page
app.get( "/read/:something", user.read );

app.listen( process.env.PORT );