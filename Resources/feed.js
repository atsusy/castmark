Titanium.include("db.js");

var dataOfFeeds = function(){
	var data = [];
	var feeds = Feed.lists();
	for(var i = 0; i < feeds.length; i++){
		var feed = feeds[i];
		data[i] = Titanium.UI.createTableViewRow({ feed:feed,
												 height:64});
		var image = Ti.UI.createImageView({
			image:feed.image,
			left:5,
			width:60,
			height:40
		});
		data[i].add(image);
		
		var title = Ti.UI.createLabel({
			text: feed.name,
			color: '#111',
			textAlign:'left',
			left:67,
			height:'auto',
			font:{fontWeight:'bold',fontSize:16}
		});
		data[i].add(title);
	};
	return data;
};

var feedWindow = Titanium.UI.createWindow({
	title:L('Feed'),
	barColor:'#222'
});

var addFeedButton = Titanium.UI.createButton({ 
	systemButton: Ti.UI.iPhone.SystemButton.ADD 
}); 

var feedsAdding = Titanium.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK	
});

var feedsTable = Titanium.UI.createTableView({
	editable:true,
	data:dataOfFeeds()
});

feedsTable.addEventListener('delete', function(e){
	e.rowData.feed.remove();
});

addFeedButton.addEventListener('click', function(e){
	var window = Ti.UI.createWindow({
		url:'searchfeed.js',
		navBarHidden:false
	});
	window.addEventListener('close', function(e){
		if(e.source.selected){
			var feed = new Feed({
				name:e.source.selected.name,
				url:e.source.selected.url,
				image:e.source.selected.image
			});
			if(!Feed.contains(feed)){
				feedsAdding.show();
				feed.items(function(items){
					for(var j = 0; j < items.length; j++){
						var item = items[j];
						var history = new History({
							name:feed.name,
							image:feed.image,
							url:item.url,
							title:item.title,
							pubDate:item.pubDate
						});
						history.addOrUpdate();
					}
					feed.add();
					feedsTable.data = dataOfFeeds();
					feedsAdding.hide();
				});
			}else{
				Ti.API.info("feed["+feed.name+"] is already added");
			}	
		}
	});
	Ti.UI.currentTab.open(window, {animated:true});
});

feedsTable.add(feedsAdding);
feedWindow.rightNavButton = addFeedButton;
feedWindow.add(feedsTable);