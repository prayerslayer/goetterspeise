var db = require( "pg" );
var client = new db.Client( process.env.DB_URL );

exports.up = function(next){
	client.connect( function( error ) {

		client.query( "INSERT INTO users ( email ) VALUES ( 'prayerslayer@gmail.com' ) ", function( err, result ) {
			console.log( result );
		});

		client.query( "INSERT INTO tags ( name ) VALUES ( 'cool people' )", function( err, result ) {
			console.log( result );
		});

		client.query( "INSERT INTO subscriptions ( name, url, feed_path ) VALUES ('npiccolotto', 'http://npiccolotto.com/', 'feed.xml')", function( err, result ) {
			console.log( result );
		});

		client.query( "INSERT INTO user_tags ( user_id, tag_id ) VALUES ( 1, 1 )", function( err, result ) {
			console.log( result );
		});

		client.query( "INSERT INTO tagged_subscriptions ( ut_id, subscription_id ) VALUES ( 1, 1 )", function( err, result ) {
			console.log( result );
			client.end();
			next();
		});
	});
};

exports.down = function(next){
	client.connect( function( error ) {

		client.query( "DELETE FROM user_items");

		client.query( "DELETE FROM items", function( err, result ) {
			console.log( result );
		});

		client.query( "DELETE FROM tagged_subscriptions ");

		client.query( "DELETE FROM user_tags" );

		client.query( "DELETE FROM subscriptions ");

		client.query( "DELETE FROM tags ");

		client.query( "DELETE FROM users", function( erro, result ) {
			console.log( result );
			client.end();
			next();
		});
	});
};
