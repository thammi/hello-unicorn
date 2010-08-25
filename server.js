var http = require('http'),
    querystring = require('querystring'),
    port = process.env.PORT || 8001

var find_unicorn = function (callback) {
    var get_search = function (amount) {
        var dict = ['nazi', 'holy', 'pink', 'rainbow', 'horny', 'old', 'puking', 'sad'];
        var choice = ['unicorn'];
        
        if(!amount)
            amount = 1;

        for(var n = 1; n < amount; n++) {
            pick = Math.floor(Math.random() * dict.length);
            choice.push(dict[pick])
        }
        
        return choice;
    }

    var query_google = function (search, cb) {
        // ugly???
        var data = "";

        var query = querystring.stringify({
            q:      search.join(' '),
            v:      '1.0',
            rsz:    8,
            safe:   'off',
        });

        var server = 'ajax.googleapis.com'
        var path = "/ajax/services/search/images?" + query;

        var google = http.createClient(80, server)
        var request = google.request('GET', path, {
            host: server,
            referer: 'http://hellounicorn.heroku.com',
        });
        request.end();

        request.on('response', function (response) {
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                data += chunk;
            });

            response.on('end', function () {
                var raw = JSON.parse(data).responseData;
                var results = raw.results;
                var index = Math.floor(Math.random()*results.length);
                
                var result = results[index];
                
                result.search = search;
                result.moreResultsUrl = raw.cursor.moreResultsUrl
                
                cb(result);
            });
        });
    }

    var search = get_search(3);
    query_google(search, callback);
}


http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html', 'Expires': 0,});
    find_unicorn(function (a) {
        res.end('<img src="' + a.tbUrl + '"/><br/><img src="' + a.url + '"/><br>Found on Google with query <a href="' + a.moreResultsUrl + '">"'+a.search.join(' ')+'"</a>.<br/>Original <a href="' + a.originalContextUrl + '">here\n');
    });
}).listen(parseInt(port));

console.log('Server running at http://127.0.0.1:'+port+'/');
