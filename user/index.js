var Q = require( "q" );

module.exports = function( pool, api ) {

	return {

		login: function( req, res ) {
			var email = req.query[ "email" ];
			var secret = req.query[ "secret" ];
			if ( email && secret ) {
				// hier an api weiterleiten und schauen was passiert
				api.login( email, secret ).then( function() {
					res.redirect( "read" );
				}).fail( function( err ) {
					res.redirect( "error" );
				});
				return;
			}
			res.render( "login", {
				"title": "Login"
			});
		},

		register: function( req, res ) {
			var email = req.body.email;
			if ( email ) {
				api.send_secret( email ).then( function() {
					res.send( 200 );
				}).fail( function( err ) {
					res.send( 500 );
				});
			} else {
				res.send( 500 );
			}
		},

		logout: function( req, res ) {
			delete req.session.email;
			res.send( 200 );
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