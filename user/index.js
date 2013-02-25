exports.login = function( req, res ) {
	if ( !req.query[ "secret" ]) {
		res.render( "login", {
			"title": "Login"
		});
	} else {
		res.redirect( "/read/youarein" );
	}
	
};

exports.send_login = function( req, res ) {
	var email = req.body.email;

	//1) nachschauen ob es die email schon in pg schon gibt
	//2) wenn nicht, hinzufügen
	//3) secret generieren
	//4) email senden

	res.redirect( "/read/something" );
};

exports.logout = function( req, res ) {
	res.redirect( "/" );
}

exports.read = function( req, res ) {
	res.render( "read", {
		"title": req.params.something,
		"prev_title": "This is old",
		"next_title": "This is really new and a exhaustingly long story"
	});
};