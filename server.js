/*
 * hello unicorn - Your way to amazing unicorns
 *
 * Copyright (C) 2010 Thammi, dodo, rbjl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        var next = shuffle_picker(['nazi', 'holy', 'pink', 'rainbow', 'horny', 'old', 'puking', 'sad', 'crazy', 'great', 'killing', 'psycho', 'robo', 'zombie', 'psychedelic', 'angry', 'ugly', 'nasty', 'flying', 'hight-tech', 'rage']);
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
        var server = "this site";
        var match = a.originalContextUrl.match(/\w+:\/\/([^\/]+)/);

        if(match) {
            server = match[1];
        }

        res.end('<html><head><title>Unicornication</title></head><body><p><img src="' + a.tbUrl + '"/></p><p><img src="' + a.url + '"/><br>Found on Google with query <a href="' + a.moreResultsUrl + '">"' + a.search.join(' ') + '"</a>.</p><p>Original on <a href="' + a.originalContextUrl + '">' + server + '</p></body></html>');
    });
}).listen(parseInt(port));

console.log('Server running at http://127.0.0.1:'+port+'/');

