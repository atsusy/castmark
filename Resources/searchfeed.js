Ti.include('db.js');

var window = Titanium.UI.currentWindow;

window.title = L('Search Feed');	
window.barColor = '#222';

var webView = Titanium.UI.createWebView({
	url:'http://castmark-web.appspot.com'
});

var operationButtons = [{image:'back.png',enabled:false}, {image:'forward.png',enabled:false}];
var operationBar = Titanium.UI.createButtonBar({
	labels:operationButtons,
	style:Ti.UI.iPhone.SystemButtonStyle.BAR,
	backgroundColor:'#555'
});

var messageWin = Titanium.UI.createWindow({
	height:48,
	width:'97%',
	bottom:64,
	borderRadius:4,
	touchEnabled:false,

	orientationModes : [
	Titanium.UI.PORTRAIT,
	Titanium.UI.UPSIDE_PORTRAIT,
	Titanium.UI.LANDSCAPE_LEFT,
	Titanium.UI.LANDSCAPE_RIGHT
	]
});

var messageView = Titanium.UI.createView({
	id:'messageview',
	borderRadius:10,
	backgroundColor:'#000',
	opacity:0.7,
	touchEnabled:false
});

var messageLabel = Titanium.UI.createLabel({
	id:'messagelabel',
	text:'',
	width:'97%',
	color:'#fff',
	font:{
		fontFamily:'Helvetica Neue',
		fontSize:13
	},
	textAlign:'center'
});
messageWin.add(messageView);
messageWin.add(messageLabel);

operationBar.addEventListener('click', function(e){
	if(e.index == 0){
		webView.goBack();
	}
	
	if(e.index == 1){
		webView.goForward();
	}
});

webView.addEventListener('load', function(e){
	operationButtons[0].enabled = webView.canGoBack();
	operationButtons[1].enabled = webView.canGoForward();
	operationBar.labels = operationButtons;
	
	messageLabel.text = e.url;
	messageWin.open();
	setTimeout(function()
	{
		messageWin.close({opacity:0,duration:500});
	},5000);
});

webView.addEventListener('error', function(e){
	var match = e.message.match(/NSErrorFailingURLStringKey=[^\/\:]+\:\/\/([^,]+)/);
	if(match){
		var xhr = Ti.Network.createHTTPClient();
		var url = 'http://'+match[1];
		
		xhr.open("GET", url);
		xhr.onload = function()
		{
			Ti.API.info(match[1] + " loaded.");
			try{
				var doc = this.responseXML.documentElement;
				var title = doc.evaluate("//channel/title/text()").item(0).nodeValue;
				var items = doc.evaluate("//channel/item");
				var image;
				if(!doc.evaluate("//channel/image/url/text()")){
					var channel = doc.evaluate('//channel/*');
					for(var i = 0; i < channel.length; i++){
						if(channel.item(i).nodeName == 'itunes:image'){
							image = channel.item(i).getAttribute('href');
						}
					}
				}else{
					image = doc.evaluate("//channel/image/url/text()").item(0).nodeValue;
				}
				Ti.API.info("title:"+title+" items:"+items.length+" image:"+image);
				// has title and items
				if(title && items.length > 0){
					window.selectedFeed = new Feed({
						name:title,
						image:image,
						url:url
					});
					window.close();
					return;
				}
			} catch(E) {
				Ti.API.error(E);
			}
			alert("Please select RSS feed.");
		};
		xhr.send();
	}
});
	
window.setRightNavButton(operationBar);
window.add(webView);