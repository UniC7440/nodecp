// Modules
const Parser = require('rss-parser');
const RSS_PARSER = new Parser();

module.exports = {
  method: 'get',
  exec: async function(request, response) {
    // RSS FEED Should only work when it's enabled
    if (request.WEB_CONFIG.NEWS.rss) {
      // Our RSS Feed
      let feed = await RSS_PARSER.parseURL(request.WEB_CONFIG.NEWS.rssLink);

      // Make the RSS Result Global
      request.RSS_FEED = feed;
    }

    // Render the .ejs file with the `request` property
    response.render(`themes/${request.session.THEMES ? request.session.THEMES[0] : request.WEB_CONFIG.themes[0]}/public/home`, {
      request
    });
  }
};
