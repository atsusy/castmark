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
	title:'Feed',
	barColor:'#222'
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
	var window = Ti.UI.createWindow({
		url:'searchfeed.js',
		navBarHidden:false
	});
	window.addEventListener('close', function(e){
		if(e.source.selectedFeed){
			var feed = e.source.selectedFeed;
			if(!Feed.contains(feed)){
				feed.add();
			}else{
				Ti.API.info("feed["+feed.name+"] is already added");
			}
		}
		feedsTable.data = dataOfFeeds();
	});
	Ti.UI.currentTab.open(window, {animated:true});
});

feedWindow.rightNavButton = addFeedButton;
feedWindow.add(feedsTable);