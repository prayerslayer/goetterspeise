var db = require( "pg" );
var client = new db.Client( process.env.DB_URL );

exports.up = function(next){
	client.connect( function( error ) {
		client.query( "INSERT INTO subscriptions ( name, url, feed_path ) VALUES ('npiccolotto', 'http://npiccolotto.com/', 'feed.xml')", function( err, result ) {
			console.log( result );
			client.end();
			next();
		});
	});
};

exports.down = function(next){
	client.connect( function( error ) {
		client.query( "DELETE * FROM items", function( err, result ) {
			console.log( result );
		});

		client.query( "DELETE FROM subscriptions WHERE name='npiccolotto'", function( erro, result ) {
			console.log( result );
			client.end();
			next();
		});
	});
};
