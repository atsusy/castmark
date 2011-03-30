Titanium.include("common.js");
Titanium.include("db.js");

var getLastUpdated = function(){
	var fs = Ti.Filesystem;
	var file = fs.getFile(fs.applicationDataDirectory,'lastupdated.txt');
	if(file.exists()){
		return new Date(file.read().text);
	}
	return undefined;
};

var setLastUpdated = function(value){
	var fs = Ti.Filesystem;
	var file = fs.getFile(fs.applicationDataDirectory,'lastupdated.txt');
	
	if(!file.exists()){
		file.createFile();
	}
	
	if(!file.write(value.toString())){
		Ti.API.error("cannot write file:"+file.nativePath);
	}
};

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
	editable:true
});

var playsTableHeader = Ti.UI.createView({
	backgroundColor:"#222222",
	width:320,
	height:60
});

var playsTableArrow = Ti.UI.createView({
	backgroundImage:"whiteArrow.png",
	width:23,
	height:48,
	bottom:10,
	left:20
});

var playsTableStatus = Ti.UI.createLabel({
	text:L('PullDownToRefresh'),
	left:55,
	width:230,
	bottom:30,
	height:"auto",
	color:"#cccccc",
	textAlign:"center",
	font:{fontSize:13,fontWeight:"bold"}
});

var playsTableLastUpdated = Ti.UI.createLabel({
	text:L('LastUpdated'),
	left:55,
	width:230,
	bottom:15,
	height:"auto",
	color:"#cccccc",
	textAlign:"center",
	font:{fontSize:12}
});

var playsTableIndicator = Titanium.UI.createActivityIndicator({
	left:20,
	bottom:13,
	width:30,
	height:30
});

var playsLoading = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK	
});


var playsTableFooter = Ti.UI.createView({
	left:0,
	width:'100%',
	height:90
});

var playsTableNext = Ti.UI.createLabel({
	text:L('NextPlaylistPage'),
	width:'100%',
	height:'100%',
	color:"#6688dd",
	textAlign:"center",
	font:{fontSize:16,fontWeight:"bold"}
});

var playsTableNextLoading = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK	
});

var feedItems;

playsTable.createPlaysTableRow = function(feedItem){
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
	
	return row;
};

playsTable.update = function(){
	playsLoading.show();
	
	var args = {offset:0, limit:10};
	if(playsFilter.index == 0){
		args.byPubDate = true;
	}else{
		args.byPlayDate = true;
	}
	
	feedItems = History.lists(args);

	var rows = [];
	for(var i = 0; i < feedItems.length; i++){
		var feedItem = feedItems[i];
		rows.push(this.createPlaysTableRow(feedItem));
	}
	playsTable.setData(rows, {animationStyle:Ti.UI.iPhone.RowAnimationStyle.FADE});
	playsTableOffset = 0;
	if(feedItems.length >= 10){
		playsTable.footerView.opacity = 1.0;
	}else{
		playsTable.footerView.opacity = 0.0;
	}
	playsTable.scrollToTop();
	playsLoading.hide();		
};

playsTable.nextPage = function(){
	playsTableOffset += 10;

	var args = {offset:playsTableOffset, limit:10};

	if(playsFilter.index == 0){
		args.byPubDate = true;
	}else{
		args.byPlayDate = true;
	}
	
	var appendItems = History.lists(args);
	if(!appendItems.length){
		var animation = Ti.UI.createAnimation({
			opacity:0,
			duration:300
		});
		playsTable.footerView.animate(animation);
	}
	
	for(var i = 0; i < appendItems.length; i++){
		var feedItem = appendItems[i];
		feedItems.push(feedItem);
		this.appendRow(this.createPlaysTableRow(feedItem), {animationStyle:Ti.UI.iPhone.RowAnimationStyle.FADE});
	}
};

playsWindow.addEventListener('open', function(e){
	var lastUpdated = getLastUpdated();
	if(lastUpdated){
		playsTableLastUpdated.text = L('LastUpdated')+formatDate(lastUpdated);
	}
	playsTable.update();
});

playsFilter.addEventListener('click', function(e){
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

var playsTablePulling = false;
var playsTableReloading = false;

function endReloading()
{
	setLastUpdated(new Date());
	
	playsTable.setContentInsets({top:0},{animated:true});
	
	playsTableReloading = false;
	playsTableLastUpdated.text = L('LastUpdated')+formatDate(getLastUpdated());
	playsTableStatus.text = L('PullDownToRefresh');
	playsTableIndicator.hide();
	playsTableArrow.show();
	
	playsTable.update();
}

function beginReloading(since)
{
	var feeds = Feed.lists();
	var loaded_count = feeds.length;
	
	var loaded = function(items){
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
		loaded_count--;
		if(loaded_count == 0){
			endReloading();
		}
	};
	
	for(var i = 0; i < feeds.length; i++){
		var feed = feeds[i];
		feed.items(loaded, since);
	}
}

playsTable.addEventListener('scroll',function(e)
{
	var offset = e.contentOffset.y;
	if (offset <= -65.0 && !playsTablePulling)
	{
		var t1 = Ti.UI.create2DMatrix();
		t1 = t1.rotate(-180);
		playsTablePulling = true;
		playsTableArrow.animate({transform:t1,duration:180});
		playsTableStatus.text = L('ReleaseToRefresh');
	}
	else if (playsTablePulling && offset > -65.0 && offset < 0)
	{
		playsTablePulling = false;
		var t2 = Ti.UI.create2DMatrix();
		playsTableArrow.animate({transform:t2,duration:180});
		playsTableStatus.text = L('PullDownToRefresh');
	}
});

playsTable.addEventListener('scrollEnd',function(e)
{
	if (playsTablePulling && !playsTableReloading && e.contentOffset.y <= -65.0)
	{
		playsTableReloading = true;
		playsTablePulling = false;
		playsTableArrow.hide();
		playsTableIndicator.show();
		playsTableStatus.text = L('Reloading');
		playsTable.setContentInsets({top:60},{animated:true});
		playsTableArrow.transform=Ti.UI.create2DMatrix();

		beginReloading(getLastUpdated());
	}
});

playsTableNext.addEventListener('click',function(e){
	playsTable.nextPage();
});

playsWindow.setTitleControl(playsFilter);
playsWindow.add(playsTable);

playsTableHeader.add(playsTableArrow);
playsTableHeader.add(playsTableStatus);
playsTableHeader.add(playsTableLastUpdated);
playsTableHeader.add(playsTableIndicator);
playsTable.headerPullView = playsTableHeader;
playsTable.footerView = playsTableFooter;
playsTableFooter.add(playsTableNext);

playsTable.add(playsLoading);
