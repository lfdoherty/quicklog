
var fs = require('fs')

var mkdirp = require('mkdirp');
var path = require('path')

var level = 0

exports.setLevelInfo = function(){
	level = 0
}
exports.setLevelWarn = function(){
	level = 1
}
exports.setLevelErr = function(){
	level = 2
}
exports.setLevelNone = function(){
	level = 3
}

var loggers = []
function uncaughtListener(err) {
	console.log('[quicklog] Caught exception: ' + err);
	console.log(err.stack)
	console.log(err)
	process.removeListener('uncaughtException', uncaughtListener)
	var left = loggers.length
	for(var i=0;i<loggers.length;++i){
		var logger = loggers[i]
		logger._flush(function(){
			--left
			if(left === 0){
				throw err
			}
		})
	}
}
process.on('uncaughtException', uncaughtListener);

function Logger(ws){
	this.ws = ws
	this.then = Date.now()
	this.dateStr = new Date(this.then).toString()	
	this.cache = ''
	this.flushHandle = this._flush.bind(this)
	this.loggerHandle = this._log.bind(this)
	this.loggerHandle.info = this._info.bind(this)
	this.loggerHandle.warn = this._warn.bind(this)
	this.loggerHandle.err = this._err.bind(this)
	loggers.push(this)
}
Logger.prototype._flush = function flush(cb){
	this.ws.write(this.cache)
	this.ws.flush(cb)
	this.cache = ''
}
Logger.prototype._logger = function(arr){
	var msg = ''
	for(var i=0;i<arr.length;++i){
		var part = arr[i]
		if(i !== 0) msg += ' '
		if(typeof(part) === 'object'){
			msg += JSON.stringify(part)
		}else{
			msg += part
		}
	}
	this._stampedLog(msg)
}
Logger.prototype._stampedLog = function(msg){
	msg = msg + ''
	var now = Date.now()
	if(now - this.then > 1000){
		this.then = now
		this.dateStr = new Date(now).toString()
	}
	if(this.cache.length === 0){
		setTimeout(this.flushHandle, 100)
	}
	this.cache += this.dateStr + ': ' + msg+'\n'
}
	
Logger.prototype._log = function _log(){
	if(level === 0){
		var arr = Array.prototype.slice.call(arguments)
		this._logger(arr)
	}
}

Logger.prototype._info = function(){
	if(level === 0){
		var arr = Array.prototype.slice.call(arguments)
		this._logger(arr)
	}
}
Logger.prototype._warn = function(){
	if(level <= 1){
		var arr = Array.prototype.slice.call(arguments)
		this._logger(arr)
	}
}	
Logger.prototype._err = function(){
	if(level <= 2){
		var arr = Array.prototype.slice.call(arguments)
		this._logger(arr)
	}
}

exports.make = function(name){
	
	try{
		fs.mkdirSync('logs')
	}catch(e){
		if(e.code === 'EEXIST'){
		}else{
			throw e
		}
	}
	mkdirp.sync(path.dirname('logs/'+name+'.log'))
	var ws = fs.createWriteStream('logs/'+name+'.log')
	
	return new Logger(ws).loggerHandle
	
	/*

	var then = Date.now()
	var dateStr = new Date(then).toString()	
	var cache = ''
	function flush(){
		ws.write(cache)
		cache = ''
	}
	function logger(arr){
		var msg = ''
		for(var i=0;i<arr.length;++i){
			var part = arr[i]
			if(i !== 0) msg += ' '
			if(typeof(part) === 'object'){
				msg += JSON.stringify(part)
			}else{
				msg += part
			}
		}
		//str += msg
		//if(str.length > 10000) str = ''
		stampedLog(msg)
	}
	function stampedLog(msg){
		msg = msg + ''
		var now = Date.now()
		if(now - then > 1000){
			then = now
			dateStr = new Date(then).toString()
		}
		if(cache.length === 0){
			setTimeout(flush, 100)
		}
		cache += dateStr + ': ' + msg+'\n'
	}
	
	function log(){
		if(level === 0){
			var arr = Array.prototype.slice.call(arguments)
			logger(arr)
		}
	}
	log.info = function(){
		if(level === 0){
			var arr = Array.prototype.slice.call(arguments)
			logger(arr)
		}
	}
	log.warn = function(){
		if(level <= 1){
			var arr = Array.prototype.slice.call(arguments)
			logger(arr)
		}
	}	
	log.err = function(){
		if(level <= 2){
			var arr = Array.prototype.slice.call(arguments)
			logger(arr)
		}
	}
	return log*/
}


