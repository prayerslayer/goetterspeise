// TODO: wie unterschiede zwischen ähnlichen posts (tippfehler ausgebessert etc) erkennen?
// TODO: wie infinite loop? --> async whilst?
// TODO: wie data sanitation? --> &nbsp;, bilder optimieren etc

var	parser = require( "xml2json" ),
	https = require( "https" ),
	_ = require( "underscore" ),
	moment = require( "moment" ),
	http = require( "http" ),
	Q = require( "q" ),
	async = require( "async" ),
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
					}
					left--;
					if ( left <= 0 )
						defer.resolve( added, [] );
				})
			});
		});
	}).on( "error", function( error ) {
		console.log( error );
		defer.reject();
	});
	return defer.promise;
};

var add = function( sub_id, item, callback ) {
	var date = moment( item.pubDate ).toDate(),
		title = item.title,
		body = item.description,
		url = item.link,
		hash = item.hash
		tx = pool.begin();


	tx.on( "error", function( err ) {
		console.log( err );
	});

	Q.fcall( function( ) {
		console.log( "Getting user id ");
		var defer = Q.defer();
		tx.query( "SELECT * FROM tagged_subscriptions ts INNER JOIN user_tags ut ON ut.ut_id = ts.ut_id WHERE ts.subscription_id = $1", [ sub_id ], function( err, result ) {
				if ( err )
					defer.reject( err );
				else
					defer.resolve( _.map( result.rows, function( usr ) { return usr.user_id; }) );
			});	
		return defer.promise;
	}).then( function( userids ) {
		var defer = Q.defer();
		console.log( "Inserting item" );
		tx.query( "INSERT INTO items ( subscription_id, title, body, published, url, hash ) VALUES ( $1, $2, $3, $4, $5, $6 )", [ sub_id, title, body, date, url, hash ], function( err, result ) {
			if ( err )
				defer.reject( err );
			else
				defer.resolve( userids );
		});
		return defer.promise;
	}).then( function( userids ) {
		var defer = Q.defer();
		console.log( "Query item id" );
		tx.query( "SELECT item_id FROM items WHERE subscription_id = $1 AND hash = $2", [ sub_id, hash ], function( err, r ) {
			if ( err )
				defer.reject( err );
			else {
				defer.resolve( {
					"userids": userids,
					"item_id": r.rows[0].item_id
				});
			}
		});
		return defer.promise;
	}).then( function( result ) {
		var userids = result.userids,
			item_id = result.item_id;
		
		var user_tags = function( userid, cb ) {
			tx.query( "INSERT INTO user_items ( user_id, subscription_id, item_id ) VALUES ( $1, $2, $3 )", [ userid, sub_id, item_id ], function( err, result ) {
				if ( err )
					cb( err );
				else
					cb( null );
			});
		};
		var tasks = [];
		_.each( userids, function( userid ) {
			tasks.push( user_tags.bind( undefined, userid ) );
		});
		console.log( tasks );
		async.parallel( tasks, function( err, result ) {
			if ( err ) {
				tx.rollback();
				callback( err );
			} else {
				tx.commit();
				callback( null );
			}
		});
	}).fail( function( err ) {
		tx.rollback();
		callback( err );
	});
};

// TODO make insert w/ promises
var insert = function( sub_id, items ) {
	var defer = Q.defer();

	var tasks = [];
	_.each( items, function( item ) {
		tasks.push( add.bind( undefined, sub_id, item ) );
	});

	async.parallel( tasks, function( err, callback ) {
		if ( err )
			defer.reject( err );
		else
			defer.resolve();
	});
	return defer.promise;
};

async.whilst(
	function() {
		return true;
	},
	function( callback ) {
		pool.query( "SELECT * FROM subscriptions" ).on( "row", function( sub ) {
		
			check( sub ).then( function( added, changed ) {
				console.log( "Check for " + sub.name + " finished" );
				insert( sub.subscription_id, added ).then( function() {
					callback( null );
				});

			}).fail( function( error ) {
				
			});
		});
	},
	function( err ) {

	}
);