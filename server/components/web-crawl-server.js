'use strict';

var fs = require('fs');
var ejs = require('ejs');

module.exports = function(app) {
    app.route('/*')
        .get(function(req, res, next) {
            console.log(req.headers['user-agent']);
            if (req.headers['user-agent'].match(/facebookexternalhit\/1.1/)) {
                handleFacebookCrawler(req, res);
            } else {
                next();
            }
        });

    function handleFacebookCrawler(req, res) {
        if (!handleFacebookCrawler.template) {
            handleFacebookCrawler.template = fs.readFileSync(app.get('appPath') + '/assets/files/facebook-scrape/index.html', 'utf8');
        }
        var html = ejs.render(handleFacebookCrawler.template,{hello:'world'});
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(html);
    }
}
