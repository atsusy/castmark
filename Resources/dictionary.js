var window = Ti.UI.currentWindow;

var dictionarySearching = Ti.UI.createActivityIndicator({
});

var dictionaryView = Ti.UI.createWebView({
	bottom:0,
	width:'95%',
	height:'70%',
	backgroundColor:'#000'
});

var noentry_html = '<html><body><font color="#ffffff">no entries, or network error.</body></html>';

dictionaryView.add(dictionarySearching);
dictionarySearching.show();

var xhr = Ti.Network.createHTTPClient();
var dict_api = {callbacks: {id100 : function(response){
	if(!response || !response.primaries){
		dictionaryView.html = noentry_html;
		return;
	}
	
	var html = '<html><body><font color="#ffffff">';
	for(var i = 0; i < response.primaries.length; i++){
		var primary = response.primaries[i];
		
		if(primary.terms && 
		   	primary.terms[0] && 
		   	primary.terms[0].labels &&
		   	primary.terms[0].labels[0] &&
		   	primary.terms[0].labels[0].text){
			
			html += "<b>"+window.word+"</b><i>("+ primary.terms[0].labels[0].text + ")</i>";
		}
		html += "<ol>";
		for(var j = 0; j < primary.entries.length; j++){
			var primaryentry = primary.entries[j];
			if(primaryentry.type == "meaning"){
				html += "<li>";
				if(primaryentry.terms && primaryentry.terms[0].text){
					html += primaryentry.terms[0].text;
				}
				if(primaryentry.entries){
					html += "<ul>";
					for(var l = 0; l < primaryentry.entries.length; l++){
						if( primaryentry.entries[l].type == "example"){
							if( primaryentry.entries[l].terms && primaryentry.entries[l].terms[0].text){
								html += "<li>"+primaryentry.entries[l].terms[0].text+"</li>";
							}
						}
					}
					html += "</ul>";
				}
				html += "</li>";
			}
		}
		html += "</ol>";
	}
	html += "</font></body></html>";
	dictionaryView.html = html;
}}};

xhr.open('GET', 'http://www.google.com/dictionary/json?callback=dict_api.callbacks.id100&q='+window.word+'&sl=en&tl=en&restrict=pr%2Cde&client=te');
xhr.onload = function(){
	dictionaryView.value = eval(this.responseText);
	dictionarySearching.hide();
};

xhr.onerror = function(){
	dictionaryView.html = noentry_html;
	dictionarySearching.hide();
};

xhr.send();

window.add(dictionaryView);