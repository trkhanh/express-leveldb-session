var ttl = require('level-ttl');
var levelDefaults = require('levelup-defaults');
var xtend = require('xtend');
var util = require('util');
var debug = require('debug')('express-session-level');

module.exports = function(session) {
	var Store = session.Store;
	var noop = function() {};

	function LevelSession(db, options) {
		this.options = options = xtend(options);
		db = levelDefaults(db, {
			valueEncoding: 'json'
		});

		options.levelTTLOptions = 'levelTTLOptions' in options ?
			options.levelTTLOptions:
			{};

		options.prefix = 'prefix' in options ? options.prefix : '';

		this.db = ttl(db, this.options.levelTTLOptions);
	}

	util.inherits(LevelSession, Store);

	LevelSession.prototype.get = function(sid, cb) {
		sid = this.getKey(sid);
		cb = cb || noop;

		debug('GET %s', sid);
		this.db.get(sid, function(err, data) {
			if (err && err.notFound) {   // no found
				debug('GET %s Notfound', sid);
				return cb(null, null);
			}
			else if (err) {  // propagate db error
				debug('GET %s Error %s', sid, err);
				return cb(err);
			}
			else {
				debug('GET %s Success', sid);
				return cb(null, data);
			}
		});
	}

	LevelSession.prototype.set = LevelSession.prototype.touch = function(sid, session, cb) {
		sid = this.getKey(sid);
		cb = cb || noop;
		var ttl = this.getTTL(session);

		debug('SET %s, %d, %o', sid, ttl, session);
		this.db.put(sid, session, {ttl: ttl}, function(err) {
			if (err) {
				debug('SET %s ERROR %s', sid, err);
				return cb(err);
			}

			debug('SET %s SUCCESS', sid);
			cb(null);
		});
	}

	LevelSession.prototype.destroy = function(sid, cb) {
		debug('DESTROY %s', sid);
		sid = this.getKey(sid);
		cb = cb || noop;

		debug('DESTROY %s', sid);
		this.db.del(sid, function(err) {
			if (err) {
				debug('DESTROY %s ERROR %s', sid, err);
				return cb(err);
			}

			debug('DESTROY %s SUCCESS', sid);
			cb(null);
		});
	}

	LevelSession.prototype.length = function(sid, cb) {
		var count = 0;
		cb = cb || noop;

		this.db.createReadStream({keys: true, values: false})
			.on('data', function() { count++ })
			.on('end', function() { cb(null, count) })
			.on('error', function(err) { cb(err) })
		;
	}

	LevelSession.prototype.getKey = function(sid) {
		return this.options.prefix + sid;
	}

	LevelSession.prototype.getTTL = function(session) {
		var maxAge = session.cookie.maxAge;
		return typeof maxAge === 'number' ?
			Math.floor(maxAge) :
			undefined;  // use level-ttl defaultTTL options
	}

	return LevelSession;
}