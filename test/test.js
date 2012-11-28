/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global F2:true, setTimeout:true*/
(function($) {

  /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
      expect(numAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      raises(block, [expected], [message])
  */

	module('prereqs');
	test('F2 exists', 1, function() {
		ok(F2);
	});
	test('F2 Storage plugin exists', 1, function() {
		ok(F2.Storage);
	});
	test('Simple Cache is defined', 1, function() {
		ok(F2.SimpleCache);
	});
	
	module('getStatistics');
	//need to implement first since it exposes information for unit testing
	test('getStatistics exists', 1, function() {
		ok(F2.SimpleCache.getStatistics);
	});
	test('getStatistics returns an object', 1, function() {
		ok(F2.SimpleCache.getStatistics());
	});
	
	module('setItem');
	test('setItem exists', 1, function() {
		ok(F2.SimpleCache.setItem);
	});
	test('setItem with null key throws error', 1, function() {
		raises(function(){
			F2.SimpleCache.setItem(null);
		}, Error);
	});
	test('setItem increases itemCount by 1 on new key', 1, function() {
		F2.SimpleCache.setItem('1', '1');
		equal(F2.SimpleCache.getStatistics().itemCount, 1);
	});
	test('setItem does not increase itemCount by 1 on existing key', 1, function() {
		F2.SimpleCache.setItem('1', '1');
		F2.SimpleCache.setItem('1', '2');
		equal(F2.SimpleCache.getStatistics().itemCount, 1);
	});
  
	module('getItem');
	test('getItem exists', 1, function() {
		ok(F2.SimpleCache.getItem);
	});
	test('getItem with null key throws error', 1, function() {
		raises(function(){
			F2.SimpleCache.getItem(null);
		}, Error);
	});
	test('getItem with key that does not exist returns null', 1, function() {
		deepEqual(F2.SimpleCache.getItem('nonExistentKey'), null);
	});
	test('getItem with key that does not exist increments misses', 1, function() {
		var oldMisses = F2.SimpleCache.getStatistics().misses;
		F2.SimpleCache.getItem('nonExistentKey');
		var newMisses = F2.SimpleCache.getStatistics().misses;
		deepEqual(oldMisses, newMisses - 1);
	});
	test('getItem with existing key returns expected value', 1, function() {
		F2.SimpleCache.setItem('existingKey','test value');
		deepEqual(F2.SimpleCache.getItem('existingKey'), 'test value');
	});
	test('getItem with key that does exist increments hits', 1, function() {
		var oldHits = F2.SimpleCache.getStatistics().hits;
		F2.SimpleCache.getItem('existingKey');
		var newHits = F2.SimpleCache.getStatistics().hits;
		deepEqual(oldHits, newHits - 1);
	});
	
	module('removeItem');
	test('removeItem exists', 1, function() {
		ok(F2.SimpleCache.removeItem);
	});
	test('removeItem with null key throws error', 1, function() {
		raises(function(){
			F2.SimpleCache.removeItem(null);
		}, Error);
	});
	test('removeItem does not throw an error if key is not present', 1, function() {
		deepEqual(F2.SimpleCache.removeItem('nonExistentKey'), undefined);
	});
	test('removeItem removes item from cache', 1, function() {
		F2.SimpleCache.setItem('1', '1');
		F2.SimpleCache.removeItem('1');
		deepEqual(F2.SimpleCache.getItem('1'), null);
	});
	test('removeItem decrements itemCount', 1, function() {
		var oldCount = F2.SimpleCache.getStatistics().itemCount;
		F2.SimpleCache.removeItem('1');
		var newCount = F2.SimpleCache.getStatistics().itemCount;
		deepEqual(oldCount, newCount+1);
	});
  
	module('gueueEvict');
	asyncTest('items with life are not evicted before their life is up', 1, function() {
		F2.SimpleCache.setItem('evictTest1','1', 500);
		setTimeout(function() {
			deepEqual(F2.SimpleCache.getItem('evictTest1'), '1');
			start();
		}, 400); //wait slighter shorter than the life of the object in the cache
	});
	asyncTest('items with life are evicted after their life is up', 1, function() {
		F2.SimpleCache.setItem('evictTest2','1', 1000);
		setTimeout(function() {
			deepEqual(F2.SimpleCache.getItem('evictTest2'), null);
			start();
		}, 1100); //wait slighter longer than the life of the object in the cache
	});
  
	module('flush');
	test('flush exists', 1, function() {
		ok(F2.SimpleCache.flush);
	});
	test('flush removes items', 1, function() {
		F2.SimpleCache.setItem('flushTest','1');
		F2.SimpleCache.flush();
		deepEqual(F2.SimpleCache.getItem('flushTest'), null);
	});
	test('flush resets cache', 4, function() {
		F2.SimpleCache.setItem('flushTest2','1');
		F2.SimpleCache.flush();
		deepEqual(F2.SimpleCache.getStatistics().itemCount, 0);
		deepEqual(F2.SimpleCache.getStatistics().hits, 0);
		deepEqual(F2.SimpleCache.getStatistics().misses, 0);
		deepEqual(F2.SimpleCache.getItem('flushTest2'), null); //last because it will increment misses, refactor to make atomic?
	});
	
	module('persistLocal');
	test('persistLocal exists', 1, function() {
		ok(F2.SimpleCache.persistLocal);
	});
	test('persistLocal stores locally using F2.Storage', 2, function() {
		deepEqual(F2.SimpleCache.persistLocal(), true);
		ok(F2.Storage.getItem('SimpleCache'));
	});
	module('flushLocal');
	test('flushLocal exists', 1, function() {
		ok(F2.SimpleCache.flushLocal);
	});
	test('flushLocal removes local storage using F2.Storage', 2, function() {
		F2.SimpleCache.persistLocal();
		deepEqual(F2.SimpleCache.flushLocal(), true);
		deepEqual(F2.Storage.getItem('SimpleCache'), null);
	});
	
	module('hydrateLocal');
	test('hydrateLocal exists', 1, function() {
		ok(F2.SimpleCache.hydrateLocal);
	});
	test('hydrateLocal persists value over client flush', 2, function() {
		F2.SimpleCache.setItem('hydrateTest','1');
		F2.SimpleCache.persistLocal();
		F2.SimpleCache.flush();
		deepEqual(F2.SimpleCache.hydrateLocal(), true);
		deepEqual(F2.SimpleCache.getItem('hydrateTest'), '1');
	});
}());
