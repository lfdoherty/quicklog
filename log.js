
var fs = require('fs')

var mkdirp = require('mkdirp');
var path = require('path')

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
	
	function log(msg){
		msg = msg + ''
		ws.write(new Date(Date.now()).toString() + ': ' + msg+'\n')
	}
	return log
}
