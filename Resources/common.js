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

var formatDate = function(d){
	if(!d){
		d = new Date();
	}
	var datestr = d.getFullYear()+'-'+suppress(d.getMonth()+1,2)+'-'+suppress(d.getDate(),2)+' '+
				suppress(d.getHours(),2)+':'+suppress(d.getMinutes(),2)+':'+suppress(d.getSeconds(),2);
	return datestr;
};

var yqlDate = function(d){
	var tz_ofs = -d.getTimezoneOffset() / 60;
	var tz_str;
	if(tz_ofs > 0){
		tz_str = ' +'+suppress(Math.abs(tz_ofs),2)+'00';
	}
	if(tz_ofs < 0){
		tz_str = ' -'+suppress(Math.abs(tz_ofs),2)+'00';
	}

	var datestr = d.getFullYear()+'-'+suppress(d.getMonth()+1,2)+'-'+suppress(d.getDate(),2)+'T'+
				suppress(d.getHours(),2)+':'+suppress(d.getMinutes(),2)+':'+suppress(d.getSeconds(),2)+tz_str;
	return datestr;	
};