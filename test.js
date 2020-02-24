var os = require('os');
var path = require('path');
var level = require('level');
var session = require('express-session');
var levelSession = require('./');
var test = require('tape');

var tmpDir = path.join(os.tmpDir(), 'level-session-' + Math.random());
var Store = levelSession(session);

test('life cycle', function (t) {
    var leveldb = level(tmpDir);
    var store = new Store(leveldb);
    var obj = { cookie: { maxAge: 2000 }, name: 'tj' };

    store.set('123', obj, assertSet);

    function assertSet(err) {
        t.notOk(err, 'should not have error on SET');
        store.get('123', assertGet);  // continue Get test
    }

    function assertGet(err, val) {
        t.notOk(err, 'should not have error on GET');
        t.deepEqual(val, obj, 'stored value should be correct');
        store.destroy('123', assertDestroy);  // continue destroy test
    }

    function assertDestroy(err) {
        t.notOk(err, 'should not have error on DESTROY');

        store.get('123', function (err, val) {  // asert '123' is NotFound
            t.notOk(err);
            t.equal(val, null, 'sessionId should not be found anymore');

            store.db.close(t.end);  // close leveldb and end test
        });
    }
});

test('options: prefix', function (t) {
    var leveldb = level(tmpDir);
    var store = new Store(leveldb, { prefix: 'prefix!' });
    var obj = { cookie: { maxAge: 2000 }, name: 'tj' };

    store.set('123', obj, assertSet);

    function assertSet(err) {
        t.notOk(err);
        store.get('123', assertGet);  // continue Get test
    }

    function assertGet(err, val) {
        t.notOk(err);
        t.deepEqual(val, obj, 'data should be retrievable');

        leveldb.get('prefix!123', function (err, val) {
            t.notOk(err);
            t.deepEqual(JSON.parse(val), obj, 'data should be stored with prefix set');

            store.db.close(t.end);  // close leveldb and end test
        });
    }
});

test('options:levelTTLOptions', function (t) {
    var leveldb = level(tmpDir);
    var store = new Store(leveldb, { levelTTLOptions: { checkFrequency: 15000 } });

    t.equal(store.db._ttl.options.checkFrequency, 15000,
        'checkFrequency options should be set to levelTTL instance');
    store.db.close(t.end);  // close leveldb and end test
});

test('maxAge ttl', function (t) {
    var leveldb = level(tmpDir);
    var store = new Store(leveldb, { levelTTLOptions: { checkFrequency: 100 } });
    var obj = { cookie: { maxAge: 2000 }, name: 'tj' };

    store.set('123', obj, t.notOk);

    setTimeout(function () {
        store.db.get('123', function (err, data) {
            t.notOk(err);
            t.deepEqual(data, obj, 'it should not expire yet');
        });
    }, 1000);

    setTimeout(function () {
        store.db.get('123', function (err/*, data*/) {
            t.ok(err.notFound, 'it should be expired');
            t.end();
        });
    }, 3000);
});