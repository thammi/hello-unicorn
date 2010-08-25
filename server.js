var http = require('http'),
	querystring = require('querystring'),
	port = process.env.PORT || 8001

var find_unicorn = function (callback) {
	var get_search = function () {
		return ['unicorn'];
	}

	var query_google = function (search, cb) {
		// ugly???
		var data = "";

		var query = querystring.stringify({
			q:	search.join(' '),
			v:	'1.0',
			rsz:	8,
		});

		var server = 'ajax.googleapis.com'
		var path = "/ajax/services/search/images?" + query;

		var google = http.createClient(80, server)
		var request = google.request('GET', path, {
			host: server,
			referer: 'http://chaossource.net',
		});
		request.end();

		request.on('response', function (response) {
			response.setEncoding('utf8');
			response.on('data', function (chunk) {
				data += chunk;
			});

			response.on('end', function () {
				var index = (Math.random()*8-0.5).toFixed();
				console.log(index)
				results = JSON.parse(data).responseData.results;
				cb(results[index]);
			});
		});
	}

	var search = get_search();
	query_google(search, callback);
}


http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	find_unicorn(function (a) {
		res.end('<img src="' + a.tbUrl + '"/><br/><img src="' + a.url + '"/>\n');
	});
}).listen(parseInt(port));

console.log('Server running at http://127.0.0.1:'+port+'/');

