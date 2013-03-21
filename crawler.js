// alle subscriptions durchgehen
// neue posts checken (hash)
// für jeden user abklären ob neue
// wenn ja in leseliste einfügen
// repeat

// TODO: wie connection pool hier reinbringen? sollte ich das überhaupt? eigentlich sinnlos weil ja ständig eine db verbindung gebraucht wird.

// TODO: wie starten/stoppen? braucht es einen server? eigentlich nicht? wirds ein module?

var	parser = require( "xml2json" ),
	https = require( "https" ),
	_ = require( "underscore" ),
	moment = require( "moment" ),
	http = require( "http" ),
	Q = require( "q" ),
	crypto = require( "crypto" ),
	pg = require( "pg" ),
	db = require( "any-db" ),
	pool = db.createPool( process.env.DB_URL, {
		"min": 1,
		"max": 10
	});

var similiar = function( item ) {
	// when are items similar
	var defer = Q.defer();
	defer.resolve( false );
	return defer.promise;
};


var exists = function( table, conditions ) {
	var defer = Q.defer();

	var sql = "SELECT * FROM " + table,
		values = [ ];

	if ( conditions.length > 0 ) {
		sql += " WHERE ";
		_.each( conditions, function( condition, i ) {
			if ( i > 0 ) {
				sql += " AND ";
			}
			var condition = conditions[ i ];
			sql +=  condition.column + " " + condition.operator + " $" + ( i + 1 );
			values.push( condition.value );
		});
		
	}
	pool.query( sql, values, function( err, result ) {
		if ( err ) {
			defer.reject( err );
		} else {
			defer.resolve( result.rows[ 0 ] );
		}
	});
	return defer.promise;
};

var check = function( subscription ) {
	var defer = Q.defer(),
		added = [],
		changed = [],
		port = subscription.url.substring( 0, 5 ).toLowerCase() === "https" ? 443 : 80,
		protocol = port === 80 ? http : https,
		delimiter = port === 80 ? 7 : 8,
		options = {
			// no http:// prefix and no trailing slash
			"host": subscription.url.substring( delimiter, subscription.url.length - 1 ),
			"port": port,
			"path": "/" + subscription.feed_path
		};
	console.log( "Checking new posts for " + subscription.name, options );
	
	var request = protocol.get( options, function( response ) {
		response.setEncoding( "utf8" );
		var xml = "";

		response.on( "data", function( data ) {
			xml += data;
		});

		response.on( "end", function() {
			// convert xml to json and parse it
			var json = JSON.parse( parser.toJson( xml ) ),
				items = json.rss.channel.item,
				left = items.length;
			// loop through items
			_.each( items, function( item ) {
				var hash = crypto.createHash( "sha512" ).update( JSON.stringify( item ) ).digest( "hex" );
				// check if an item with this hash exists
				exists( "items", [{
						"column": "subscription_id",
						"operator": "=",
						"value": subscription.subscription_id
					}, {
						"column": "hash",
						"operator": "=",
						"value": hash
					}
				]).then( function( db_item ) {
					if ( !db_item ) {
						// item does not exist
						item.hash = hash;
						added.push( item );
						left--;
						console.log( left );
						if ( left <= 0 )
							defer.resolve( added, [] );
					} else {
						console.log( "Item", hash, "already exists");
					}
				})
			});
		});
	}).on( "error", function( error ) {
		console.log( error );
		defer.reject();
	});
	return defer.promise;
};

// TODO how to do infinite loop?
//while (  ) {
	// fetch all subscriptions

	pool.query( "SELECT * FROM subscriptions" ).on( "row", function( sub ) {
		var tx = pool.begin();

		check( sub ).then( function( added, changed ) {
			console.log( "Check for " + sub.name + " finished" );
			var left = added.length;
			//insert added items
			_.each( added, function( item, i ) {
				console.log( i );
				var date = moment( item.pubDate ).toDate(),
					title = item.title,
					body = item.description,
					url = item.link,
					hash = item.hash;

				console.log( "Inserting item " + title );
				tx.query( "INSERT INTO items ( subscription_id, title, body, published, url, hash ) VALUES ( $1, $2, $3, $4, $5, $6 )", [ sub.subscription_id, title, body, date, url, hash ], function( err, result ) {
					if ( err ) {
						console.error( err );
						throw new Error( err );
					} else {
						console.log( result );
						left--;
						if ( left <= 0 ) {
							tx.commit(); // last insert
						}
					}
				});
			});
		}).fail( function( error ) {
			tx.rollback();
		});
	});
//}