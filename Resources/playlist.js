Titanium.include("db.js");

var playsWindow = Titanium.UI.createWindow({
	title:L('Playlist'),
	barColor:'#222'
});

var playsFilter = Titanium.UI.createTabbedBar({
	labels:[L('All'), L('History')],
	style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
	index:0,
	backgroundColor:'#555'
});

var playsTable = Titanium.UI.createTableView({
});

var playsUpdate = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.REFRESH
});

var playsLoading = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK	
});

var feedItems;
var feedHistories;

playsTable.update = function(){
	playsLoading.show();
	
	this.setData([],{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.FADE});
	
	var feeds = [];	
	// All or What's new!
	if(playsFilter.index != 1){
		feeds = Feed.lists();
	}
	
	feedItems = [];
	contains = function(item){
		for(var i = 0; i < feedItems.length; i++){
			var feedItem = feedItems[i];
			if(feedItem.url == item.url){
				return true;
			}
		}
		return false;
	};
	
	var all_loaded;
	
	// this is feed method.
	var items_loaded = function(items){
		for(var j = 0; j < items.length; j++){
			var item = items[j];
			if(contains(item)){
				continue;
			}
			
			feedItems.push(item);	
		}
				
		// remove loaded feed.
		for(var k = 0; k < feeds.length; k++){
			if(feeds[k] == this){
				feeds[k] = null;
			}
		}
		
		// when all feeds loaded.
		for(var l = 0; l < feeds.length; l++){
			if(feeds[l] != null){
				return;
			}
		}
		
		if(all_loaded){
			all_loaded();
		}
	};
	
	// call when all feeds were loaded.
	all_loaded = function(){
		feedItems = feedItems.sort(function(x,y){
			// when History
			if(playsFilter.index == 1){
				// sort by played date(desc)
				return y.playDate - x.playDate;
			}else{
				// sort by published date(desc)
				return y.pubDate - x.pubDate;
			}
		});
		
		var rows = [];
		for(var i = 0; i < feedItems.length; i++){
			var feedItem = feedItems[i];
			var row = Titanium.UI.createTableViewRow({
				item:feedItem,
				hasChild:true,
				height:90
			});
			
			var feedImage = Ti.UI.createImageView({
				image:feedItem.image,
				top:8,
				left:5,
				width:60,
				height:40
			});
			row.add(feedImage);
		
			var feedName = Ti.UI.createLabel({
				text:feedItem.name,
				color:'#111',
				textAlign:'left',
				top:8,
				left:70,
				height:30,
				font:{fontWeight:'bold',fontSize:12}
			});
			row.add(feedName);		
		
			var title = Ti.UI.createLabel({
				text:feedItem.title,
				color:'#333',
				textAlign:'left',
				left:70,
				bottom:0,
				height:50,
				font:{fontSize:14}
			});
			row.add(title);
			
			rows.push(row);
		}

		playsTable.setData(rows, {animationStyle:Ti.UI.iPhone.RowAnimationStyle.FADE});
		playsLoading.hide();		
	};
	
	var histories = History.lists();
	for(var i = 0; i < histories.length; i++){
		var history = histories[i];
		history.items(items_loaded);
	}
	
	for(var j = 0; j < feeds.length; j++){
		var feed = feeds[j];
		feed.items(items_loaded);
	}
	
	if((histories.length + feeds.length) == 0){
		all_loaded();
	}
};

playsWindow.addEventListener('open', function(e){
	playsTable.update();
});

playsFilter.addEventListener('click', function(e){
	// can delete history
	playsTable.editable = (playsFilter.index == 1);	
	playsTable.update();
});

playsUpdate.addEventListener('click', function(e){
	playsTable.update();
});

playsTable.addEventListener('click', function(e){
	var clicked = feedItems[e.index];
	var playWindow = Ti.UI.createWindow({
		item:clicked,
		url:'play.js'
	});
		
	if(clicked.progress > 0 && clicked.duration > 0){
		playWindow.args = { from:clicked.progress, to:clicked.duration};
	}
		
	playWindow.addEventListener('close', function(e){
		clicked.progress = playWindow.playContext().progress;
		clicked.duration = playWindow.playContext().duration;
		// record history.
		var history = new History({
			name:clicked.name,
			image:clicked.image,
			url:clicked.url,
			title:clicked.title,
			pubDate:clicked.pubDate,
			playDate:new Date(),
			progress:clicked.progress,
			duration:clicked.duration
		});
		history.addOrUpdate();
	});
	Ti.UI.currentTab.open(playWindow, { animated:true });
});

playsTable.addEventListener('delete', function(e){
	var item = e.rowData.item;
	item.remove();
});

playsWindow.setTitleControl(playsFilter);
playsWindow.add(playsTable);
playsWindow.rightNavButton = playsUpdate;
playsTable.add(playsLoading);