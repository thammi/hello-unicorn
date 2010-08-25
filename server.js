var http = require('http'),
    querystring = require('querystring'),
    port = process.env.PORT || 8001

var rand = function (x) { return Math.floor(Math.random() * x); };

var rand_pick = function (list) { return list[ rand(list.length) ]; };

// !!! side effect !!!!!!!!!!!!!!1
var shuffle_picker = function (list) {
  return function() {
    return list.splice(rand(list.length),1)[0];
  };
};

var find_unicorn = function (callback) {
    var get_search = function (amount) {
        var next = shuffle_picker(['nazi', 'holy', 'pink', 'rainbow', 'horny', 'old', 'puking', 'sad', 'crazy', 'great', 'killing', 'psycho', 'robo', 'zombie']);
        var chosen = ['unicorn'];

        amount = amount || 1;

        while(--amount) chosen.push(next());
           
        return chosen;
    }

    var query_google = function (search, cb) {
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
            var data = "";

            response.setEncoding('utf8');
            response.on('data', function (chunk) { data += chunk; });

            response.on('end', function () {
                var raw = JSON.parse(data).responseData;
                var result = rand_pick(raw.results);
                
                result.search = search;
                result.moreResultsUrl = raw.cursor.moreResultsUrl
                
                cb(result);
            });
        });
    }

    query_google(get_search(3), callback);
}

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html', 'Expires': 0,});
    find_unicorn(function (a) {
        res.end('<img src="' + a.tbUrl + '"/><br/><img src="' + a.url +
            '"/><br>Found on Google with query <a href="' + a.moreResultsUrl +
            '">"' + a.search.join(' ') + '"</a>.<br/>Original <a href="' +
            a.originalContextUrl + '">here\n');
    });
}).listen(parseInt(port));

console.log('Server running at http://127.0.0.1:'+port+'/');
