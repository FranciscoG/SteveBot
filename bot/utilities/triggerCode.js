const request = require('request');
const _get = require('lodash/get');

/**
 * Mini programming language for triggers
 * usage:
 * 
 * Single Command per line
 * { ACTION jsonPath using lodash.get syntax FROM source }
 * '{ GET obj[0].name FROM http://blabla.com/{0} }'
 */

 /* 
  example:
  
  create trigger like this:
  !trigger wiki {GET [3][0] FROM https://en.wikipedia.org/w/api.php?action=opensearch&search={0}&limit=1&namespace=0&format=json}

  then use it like this:
  !wiki black+cats
 */ 

const KEYWORDS = {
  'GET' : 'action', 
  'GETJ' : 'action', // to explicitly set the req to accept json
  'FROM' : 'setter', // the value can have dynamic replacements
  'FORMAT' : 'action'  // the value can have dynamic replacements
};

const CONSTANTS = {
  '{M}': () => new Date().getMonth() + 1,
  '{D}': () => new Date().getDate(),
  'PROP' : '',
  'FLOW' : ''
};

 function parseTrigger(trig) {
   // remove open/close brackets
  const nodes =  trig.slice(1, -1).trim().split(" ");

  /**
   * For now this is super super simple and only handles GET
   * requests from a url and that's it.
   * nodes[0] should always always === "GET"
   * nodes[2] should always always === "FROM"
   * so we can ignore them.. for now. 
   */
  
  
  return {
    jsonPath : nodes[1],
    url : nodes[3]
  };
 }

 module.exports = function(bot, trigger, data) {
  var deets = parseTrigger(trigger);
  var url = deets.url;

  if (/(\{\d\})+/g.test(url) && !data.params.length) {
    return bot.sendChat("This trigger requires more data");
  }

  if (data.params.length > 0) {
    data.params.forEach((p, i) => {
      url = url.replace(`{${i}}`, p);
    });
  }

  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let json = JSON.parse(body);
      let result = _get(json, deets.jsonPath, "No results");
      bot.sendChat(result);
      return;
    } 
    
    bot.log('error', 'BOT', `code trigger: ${response.statusCode} ${error}`);
    bot.sendChat('Bad request...');
    
  });
 };