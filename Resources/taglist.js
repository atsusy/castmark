Ti.include('common.js');

var window = Ti.UI.currentWindow;

var tagsTable = Ti.UI.createTableView({
	allowsSelection:false
});

window.addEventListener('open', function(e){
	var tags = window.allTags;
	Ti.API.info("tags:"+tags.length);
	var rows = [];
	for(var i = 0; i < tags.length; i++){
		var tag = tags[i];
		
		var point = Ti.UI.createLabel({
			left:4,
			width:54,
			height:24,
			backgroundColor:'#888',
			text:sec2str(tag.point),
			font:{fontSize:12, fontFamily:'HelveticaNeue-Bold'},
			borderRadius:4,
			textAlign:'center',
			color:'#fff',
			control_id:1
		});
		
		var content = Ti.UI.createLabel({
			left:64,
			right:56,
			height:'auto',
			text:'\n'+tag.content+'\n ',
			control_id:2
		});
		
		var row = Ti.UI.createTableViewRow({
		});
		row.add(point);
		row.add(content);
		
		rows[i] = row;
	}
	tagsTable.setData(rows);
});

window.add(tagsTable);