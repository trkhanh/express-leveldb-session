[![Build Status](https://travis-ci.org/tgohn/express-session-level.svg?branch=master)](https://travis-ci.org/tgohn/express-session-level) [![npm](https://img.shields.io/npm/v/express-session-level.svg)](https://npmjs.com/package/express-session-level)

[Leveldb](https://github.com/level/levelup) backed session store for your
Express app.

## Usage

```
npm install express-session-level express-session
```

Pass the `express-session` store into `express-session-level` to create a
`LevelStore` constructor.
The `LevelStore` constructor accepts a levelUP instance and an optional
`options` object.

```javascript
var session = require('express-session');
var LevelStore = require('express-session-level')(session);
var db = require('level')('./myDb');

app.use(session({
	store: new LevelStore(db)
}));
```

#### express-session-level

```javascript
var LevelStore = require('express-session-level')(session);
```

Pass the `express-session` store into `express-session-level` to create a
`LevelStore` constructor.


#### LevelStore

Create an express session store as:

```javascript
var sessionStore = new LevelStore(levelup[, options])
```

- `levelup` is an instance of [levelUP](https://github.com/level/levelup). You
	can choose any backing store (levelDown, memDown ...) for the levelup
	instance.
- `options`:
	- `prefix`: all saved keys to database will be prefix with this string.
		Default to empty string `""`.
	- `levelTTLOptions`: options will be passed straight to
		[level-ttl](https://github.com/Level/level-ttl). For example: `{
		defaultTTL: 60000, checkFrequency: 30000 }`


#### Dependencies

[level-ttl](https://github.com/Level/level-ttl) to handle ttl of saved entries
if you dont want the data store to keep growing.

[levelup-defaults](https://github.com/mafintosh/levelup-defaults) to make sure
we do not polute your levelup instance.

## License
MIT
