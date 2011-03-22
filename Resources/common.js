var suppress = function(value, n){
	var str = "0"*n + value.toString();
	str = str.substr(str.length-n,	n);
	return str;
};
