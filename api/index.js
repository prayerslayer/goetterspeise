var Q = require( "q" ),
	mail = require( "emailjs" ),
	crypto = require ("crypto" );

module.exports = function( pool ) {

	return {
		"user": {
			send_secret: function( email ) {
				var tx = pool.begin();
				tx.on( "error", function( err ) {
					console.log( err );
				});
				var returned_defer = Q.defer();
				//1) nachschauen ob es die email schon in pg schon gibt
				Q.fcall( function() {
					var deferred = Q.defer();
					tx.query( "SELECT * FROM users WHERE email = $1 ", [ email ], function( err, result ) {
						if ( err ) {
							deferred.reject( new Error( err ) );
						} else {
							console.log( "Queried for email " + email );
							console.log( result );
							deferred.resolve( result.rowCount );	
						}
					});
					return deferred.promise;
				}).then( function( count ) {
					var deferred = Q.defer();
					if ( count === 0 ) {
						// create user
						tx.query( "INSERT INTO users ( email ) VALUES ( $1 )", [ email ], function( err, result ) {
							if ( err ) {
								deferred.reject( new Error( err ) );
							} else {
								console.log( "Added user " + email );
								console.log( result );
								deferred.resolve();	
							}
						});
					} else
						deferred.resolve();
					return deferred.promise;
				}).then( function( ) {
					// create secret
					var deferred = Q.defer();
					var hash = crypto.createHash( "sha512" ).update( email + Date.now() + Math.random() ).digest( "hex" );
					console.log( "Secret is " + hash );
					tx.query( "UPDATE users SET secret = $1 WHERE email = $2", [ hash, email ], function( err, result ) {
						if ( err ) {
							deferred.reject( new Error( err ) );
						} else {
							deferred.resolve( hash );
						}
					});
					return deferred.promise;
				}).then( function( hash ) {
					// send email
					var server = mail.server.connect( {
						"user": process.env.EMAIL_USER,
						"password": process.env.EMAIL_PASSWD,
						"host": process.env.EMAIL_HOST,
						"ssl": true
					});
					var link = process.env.BASE_URL + "/login?email=" + email + "&secret=" + hash;
					server.send({
						"text": link,
						"from": process.env.EMAIL_USER,
						"to": email,
						"subject": "Your Goetterspeise login link"
					}, function( err, msg ) {
						if ( err ) {
							throw new Error( err );
						} else {
							//TODO websockets would be useful here
							tx.commit();
							returned_defer.resolve();	
						}
					});
				}).fail( function( err ) {
					tx.rollback();
					console.error( err );
					returned_defer.reject( err );
				});
				return returned_defer.promise;
			},

		login: function( email, secret ) {
				// check if email is present
				var tx = pool.begin();
				var returned_defer = Q.defer();
				Q.fcall( function() {
					var deferred = Q.defer();
					tx.query( "SELECT * FROM users WHERE email = $1 AND secret = $2", [ email, secret ], function( err, result ) {
						if ( err ) {
							deferred.reject( new Error( err ) );
						} else {
							console.log( result );
							deferred.resolve( result.rowCount );
						}
					});
					return deferred.promise;
				}).then( function( count ) {
					var deferred = Q.defer();
					console.log( count + " people with this email/secret combination" );
					if ( count === 1 ) {
						// delete secret
						tx.query( "UPDATE users SET secret = NULL WHERE email = $1", [ email ], function( err, result ) {
							if ( err ) {
								deferred.reject( new Error( err ) );
							} else {
								deferred.resolve( true );
							}
						})
					} else {
						deferred.resolve( false );
					}
					return deferred.promise;
				}).then( function( redirect ) {
					tx.commit();
					if ( redirect ) {
						returned_defer.resolve();
					} else {
						returned_defer.reject();
					}
				}).fail( function( err ) {
					tx.rollback();
					console.error( err );
					returned_defer.reject( err );
				});
				return returned_defer.promise;
			}
		}
	}
};