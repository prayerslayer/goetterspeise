var db = require( "pg" );
var client = new db.Client( process.env.DB_URL );

exports.up = function(next){
	client.connect( function( error ) {

		// table users
		console.log( "Creating table users" );
		client.query( "CREATE TABLE users ( user_id BIGSERIAL PRIMARY KEY, email TEXT NOT NULL, secret TEXT );", function( err, result ) {
			console.log( result );
		});
		// tags
		console.log( "Creating table tags" );
		client.query( "CREATE TABLE tags ( tag_id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL );", function( err, result ) {
			console.log( result );
		});
		// subscriptions
		console.log( "Creating table subscriptions" );
		client.query( "CREATE TABLE subscriptions ( subscription_id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, url TEXT NOT NULL, feed_path TEXT NOT NULL);", function( err, result ) {
			console.log( result );
		});
		// items
		console.log( "Creating table items" );
		client.query( "CREATE TABLE items ( item_id BIGSERIAL PRIMARY KEY, title TEXT, body TEXT, published DATE NOT NULL, url TEXT NOT NULL, hash TEXT, subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id ) );", function( err, result ) {
			console.log( result );
		});
		// user tags
		console.log( "Creating table user tags" );
		client.query( "CREATE TABLE user_tags ( ut_id BIGSERIAL PRIMARY KEY, user_id BIGSERIAL REFERENCES users( user_id ), tag_id BIGSERIAL REFERENCES tags( tag_id ) );", function( err, result ) {
			console.log( result );
		});
		// tagged subscriptions
		console.log( "Creating table tagged subscriptions" );
		client.query( "CREATE TABLE tagged_subscriptions ( ut_id BIGSERIAL REFERENCES user_tags( ut_id ), subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id ), PRIMARY KEY( ut_id, subscription_id ));", function( err, result ) {
			console.log( result );
		});
		// user_items
		console.log( "Creating table user items" );
		client.query( "CREATE TABLE user_items ( user_id BIGSERIAL REFERENCES users( user_id ), subscription_id BIGSERIAL REFERENCES subscriptions( subscription_id ), item_id BIGSERIAL REFERENCES items( item_id ), read BOOLEAN NOT NULL DEFAULT false, mark_unread BOOLEAN NOT NULL DEFAULT false, starred BOOLEAN NOT NULL DEFAULT false, 			PRIMARY KEY( user_id, item_id ));", function( err, result ) {
			console.log( result );
			client.end();
			next();
		});
	});
};

exports.down = function(next){
 	client.connect( function( error ) {
 		// table user items
 		console.log( "Dropping table user items" );
 		client.query( "DROP TABLE user_items;", function( err, result ) {
 			console.log( result );
 		});
 		// table tagged subscriptions
 		console.log( "Dropping table tagged subscriptions" );
 		client.query( "DROP TABLE tagged_subscriptions;", function( err, result ) {
 			console.log( result );
 		});
 		// table user tags
 		console.log( "Dropping table user tags ");
 		client.query( "DROP TABLE user_tags;", function( err, result ) {
 			console.log( result );
 		});
 		// table items
 		console.log( "Dropping table items" );
 		client.query( "DROP TABLE items;", function( err, result ) {
 			console.log( result );
 		});
 		// table subscriptions
 		console.log( "Dropping table subscriptions" );
 		client.query( "DROP TABLE subscriptions;", function( err, result ) {
 			console.log( result );
 		});
 		// table tags
 		console.log( "Dropping table tags" );
 		client.query( "DROP TABLE tags;", function( err, result ) {
 			console.log( result );
 		});
 		// table users
 		console.log( "Dropping table users" );
 		client.query( "DROP TABLE users;", function( err, result ) {
 			console.log( result );
 			client.end();
 			next();
 		});
 	});
};
