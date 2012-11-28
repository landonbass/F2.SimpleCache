/*global F2:true, setTimeout:true */
F2.extend('SimpleCache', (function () {
	'use strict';
	var Cache = function () {
		this.id = 'SimpleCache';
		this.items = {};
		this.statistics = {};
		this.statistics.itemCount = 0;
		this.statistics.hits = 0;
		this.statistics.misses = 0;
	};
	Cache.prototype._setItem = function (key, value, life) {
		if (key === null || key === '') {
			throw new Error('Cache key must have a value');
		}
		if (!cache.items[key]) {
			//only increment item count if key does not exist
			cache.statistics.itemCount++;
		}
		cache.items[key] = value;
		if (life) {
			cache._queueEvict(key, life);
		}
		return value;
	};
	Cache.prototype._getItem = function (key) {
		if (key === null || key === '') {
			throw new Error('Cache key must have a value');
		}
		var item = cache.items[key];
		if (item === null || item === undefined) {
			cache.statistics.misses++;
			return null;
		} else {
			cache.statistics.hits++;
			return item;
		}
	};
	Cache.prototype._removeItem = function (key) {
		if (key === null || key === '') {
			throw new Error('Cache key must have a value');
		}
		var item = cache.items[key];
		if (item !== null || item !== undefined) {
			cache.statistics.itemCount--;
			delete cache.items[key];
		}		
	};
	Cache.prototype._queueEvict = function (key, life) {
		setTimeout(function() {
			cache._removeItem(key);
		}, life);
	};
	Cache.prototype._flush = function () {
		cache.statistics.itemCount = 0;
		cache.statistics.hits = 0;
		cache.statistics.misses = 0;
		cache.items = {};
	};
	Cache.prototype._persistLocal = function () {
		var result = false;
		if (F2.Storage) {
			F2.Storage.setItem(cache.id, cache);
			result =  true;
		} else {
			F2.log(messages.noF2Storage);
		}
		return result;
	};
	Cache.prototype._flushLocal = function () {
		var result = false;
		if (F2.Storage) {
			F2.Storage.removeItem(cache.id);
			result = true;
		} else {
			F2.log(messages.noF2Storage);
		}
		return result;
	};
	Cache.prototype._hydrateLocal = function () {
		var result = false;
		if (F2.Storage) {
			var localCache = F2.Storage.getItem(cache.id);
			if (localCache !== null) {
				cache.items = localCache.items;
				cache.statistics = localCache.statistics;
				result = true;
			}
		} else {
			F2.log(messages.noF2Storage);
		}
		return result;
	};
	var Messages = function () {
		this.noF2Storage = 'The F2.Storage plugin is required for this action.';
	};
	var cache = cache || new Cache();
	var messages = messages || new Messages();
	return {
		getStatistics:function () {
			return cache.statistics;
		},
		setItem:function (key, value, life) {
			return cache._setItem(key, value, life);			
		},
		getItem:function (key) {
			return cache._getItem(key);
		},
		removeItem:function (key) {
			cache._removeItem(key);
		},
		flush:function () {
			cache._flush();
		},
		persistLocal:function () {
			return cache._persistLocal();
		},
		flushLocal: function() {
			return cache._flushLocal();
		},
		hydrateLocal:function () {
			return cache._hydrateLocal();
		}
	};
})());