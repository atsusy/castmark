Titanium.include("db.js");

var playsWindow = Titanium.UI.createWindow({
	title:'Playlist',
	backgroundColor:'#222'
});

var playsLoading = Titanium.UI.createActivityIndicator({
    height:50,
    width:'auto',
	font:{fontSize:15,fontWeight:'bold'},
	color:'white',
    message:'Loading...',
    style:Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN
});

var playsTable = Titanium.UI.createTableView({
});

playsTable.update = function(){
	playsTable.setData([], {animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
	var addItem = function(item){
	    playsLoading.hide();
		playsWindow.setToolbar(null,{animated:true});
		var row = Titanium.UI.createTableViewRow({
			feed:this,
			item:item,
			hasChild:true,
			height:90
		});
		
		var feedImage = Ti.UI.createImageView({
			image: this.image,
			left: 5,
			width:60,
			height:40
		});
		row.add(feedImage);
		
		var feedName = Ti.UI.createLabel({
			text: this.name,
			color: '#111',
			textAlign:'left',
			top:8,
			left:70,
			height:30,
			font:{fontWeight:'bold',fontSize:12}
		});
		row.add(feedName);		
		
		var title = Ti.UI.createLabel({
			text: item.title,
			color: '#333',
			textAlign:'left',
			left:70,
			bottom:0,
			height:50,
			font:{fontSize:14}
		});
		row.add(title);
		
		playsTable.appendRow(row,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.LEFT});
	};
	
	var feeds = Feed.lists();
	for(var i = 0; i < feeds.length; i++){
		var feed = feeds[i];
		Ti.API.info("attempt to load feed items:"+feeds.url);
 		feed.items(addItem);
	}
};

playsWindow.addEventListener('focus', function(e){
    playsWindow.setToolbar([playsLoading],{animated:true});
	playsLoading.show();
	playsTable.update();
});

playsTable.addEventListener('click', function(e){
	var playingWindow = Ti.UI.createWindow({
		url:'play.js'
	});
	playingWindow.feed = e.rowData.feed;
	playingWindow.item = e.rowData.item;
	Ti.API.info("url:"+e.rowData.item.url);
	Ti.UI.currentTab.open(playingWindow, {animated:true});
});

playsWindow.add(playsTable);
