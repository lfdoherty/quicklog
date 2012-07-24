
var fs = require('fs')

exports.make = function(name){
	try{
		fs.mkdirSync('logs')
	}catch(e){
		if(e.code === 'EEXIST'){
		}else{
			throw e
		}
	}
	var ws = fs.createWriteStream('logs/'+name+'.log')
	
	function log(msg){
		msg = msg + ''
		ws.write(msg+'\n')
	}
	return log
}
