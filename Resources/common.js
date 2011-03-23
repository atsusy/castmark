var suppress = function(value, n){
	var str = "0"*n + value.toString();
	str = str.substr(str.length-n,	n);
	return str;
};

var sec2str = function(seconds){
	var mm = parseInt((seconds%3600)/60, 10);
	var ss = parseInt(seconds%60, 10);
	
	return suppress(mm,2)+":"+suppress(ss,2);
};
