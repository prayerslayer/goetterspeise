exports.index = function(req, res){
	res.render('index', { "tags": [
		    { "link": "read/hululu", "name": "Joker" },
			{ "link": "read/hululu", "name": "Gargamel" }
	 	]
	});
};