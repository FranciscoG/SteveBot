'use strict';
var DubAPI = require('dubapi');
var settings = require(process.cwd() + '/private/settings.js');
var Database = require(process.cwd() + '/bot/db.js');
var config = require(process.cwd() + '/bot/config.js');

var svcAcct = process.cwd() + '/private/serviceAccountCredentials.json';
var BASEURL = settings.FIREBASE.BASEURL;
var db = new Database(svcAcct, BASEURL);

/**
 * Add my own extensions
 */
DubAPI.prototype.getRoomHistory = require(process.cwd() + '/bot/extend/getRoomHistory.js');
DubAPI.prototype.addToPlaylist = require(process.cwd() + '/bot/extend/addToPlaylist.js');
DubAPI.prototype.getPlaylists = require(process.cwd() + '/bot/extend/getPlaylists.js');
DubAPI.prototype.shufflePlaylist = require(process.cwd() + '/bot/extend/shufflePlaylist.js');
DubAPI.prototype.getUserQueue = require(process.cwd() + '/bot/extend/getUserQueue.js');
DubAPI.prototype.DM = require(process.cwd() + '/bot/extend/directMessages.js');

new DubAPI({ username: settings.USERNAME, password: settings.PASSWORD }, function(err, bot) {
        
    if (err) {
        console.error(err);
        process.exit(1); // exit so pm2 can restart
        return;
    }
    
    bot.myconfig = config;
    bot.maxChatMessageSplits = 5;
    bot.commandedToDJ = false;
    bot.isDJing = false;

    if (bot.myconfig.verboseLogging) {
      bot.log = require('jethro');
      bot.log.setTimeformat('YYYY-MM-DD HH:mm:ss:SSS');
    } else {
      bot.log = function(){return;}; // do nothing
    }

    bot.log('info', 'BOT', `Running ${config.botName} with DubAPI v${bot.version}`);

    function connect() {
        bot.connect(settings.ROOMNAME);
    }

    function disconnect(err) {
        bot.disconnect();

        if(err) bot.log('error', 'BOT', err.stack);

        process.exit(err ? 1 : 0);
    }

    //Properly disconnect from room and close db connection when program stops
    process.on('exit', disconnect); //automatic close
    process.on('SIGINT', disconnect); //ctrl+c close
    process.on('uncaughtException', disconnect);
    process.on('message', function(msg) {  
      bot.log('info','BOT', 'message: ' + msg);
      if (msg === 'shutdown') {
        disconnect();
      }
    });

    bot.on('error', function(err) {
        bot.log('error', 'BOT', err);
        bot.reconnect();
    });

    bot.robotChat = function(msg, cb) {
      msg = "`" + msg + "`";
      bot.sendChat.call(bot, msg, cb);
    };

    connect();

    //pass the bot and db to the events handler
    require('./events')(bot, db);
});