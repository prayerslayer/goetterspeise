var Q = require( "q" ),
	mail = require( "emailjs" ),
	crypto = require( "crypto" );

module.exports = function( pool ) {

	return {
		login: function( req, res ) {
			if ( req.query[ "email" ] && req.query[ "secret" ]) {
				// if url contains email and secret, validate it
				var email = req.query[ "email" ];
				var secret = req.query[ "secret" ];
				// check if email is present
				var tx = pool.begin();
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
						req.session.email = email;
						res.redirect( "/read/blubu" );
					} else {
						console.error( "Link not valid" );
						res.render( "login", {
							"title": "Login",
							"error": "The login link is not valid."
						});
					}
				}).fail( function( err ) {
					tx.rollback();
					console.error( err );
					res.send( 500 );
				});

			} else {
				res.render( "login", {
					"title": "Login"
				});
			}
			
		},

		send_login: function( req, res ) {
			var email = req.body.email;
			var tx = pool.begin();
			tx.on( "error", function( err ) {
				console.log( err );
			});
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
						tx.commit();
						res.send( 200 );		
					}
				});
			}).fail( function( err ) {
				tx.rollback();
				console.error( err );
				res.send( 500 );
			});
		},

		logout: function( req, res ) {
			delete req.session.email;
			res.redirect( "/login" );
		},

		read: function( req, res ) {
			res.render( "read", {
				"title": req.params.something,
				"prev_title": "This is old",
				"next_title": "This is really new and a exhaustingly long story"
			});
		},
	};
};