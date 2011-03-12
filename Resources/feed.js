Titanium.include("db.js");

var dataOfFeeds = function(){
	var data = [];
	var feeds = Feed.lists();
	for(var i in feeds){
		var feed = feeds[i];
		data[i] = Titanium.UI.createTableViewRow({ feed:feed,
												 height:64});
		var image = Ti.UI.createImageView({
			image: feed.image,
			left: 5,
			width:60,
			height:40
		});
		data[i].add(image);
		
		var title = Ti.UI.createLabel({
			text: feed.name,
			color: '#111',
			textAlign:'left',
			left:70,
			height:'auto',
			font:{fontWeight:'bold',fontSize:16}
		});
		data[i].add(title);
	};
	return data;
};

var feedWindow = Titanium.UI.createWindow({
	title:'Feed'
});

var addFeedButton = Titanium.UI.createButton({ 
	systemButton: Ti.UI.iPhone.SystemButton.ADD 
}); 

var feedsTable = Titanium.UI.createTableView({
	editable:true,
	data:dataOfFeeds()
});

feedsTable.addEventListener('delete', function(e){
	e.rowData.feed.remove();
});

addFeedButton.addEventListener('click', function(e){
	var window = Titanium.UI.createWindow({
		title:'Search Feed'
	});
	
	window.addEventListener('close', function(e){
		if(e.source.selectedFeed){
			var feed = e.source.selectedFeed;
			if(!Feed.contains(feed)){
				feed.add();
				feedsTable.data = dataOfFeeds();
			}else{
				Ti.API.info("feed["+feed.name+"] is already added");
			}
		}
	});

	var webView = Titanium.UI.createWebView({
		url:'http://www.google.com'
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

	var backTo = Titanium.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.CANCEL
	});
	backTo.addEventListener('click', function(e){
		window.close();
	});

	window.rightNavButton = backTo;
	window.add(webView);
	
	window.open({modal:true,
  modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE,
		    modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN });
});

feedWindow.rightNavButton = addFeedButton;
feedWindow.add(feedsTable);