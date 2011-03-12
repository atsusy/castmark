Titanium.include("db.js");

var playingWindow = Titanium.UI.currentWindow;

var audioPlayer = Titanium.Media.createAudioPlayer();

var audioOperation = Ti.UI.createButton({
	top:4,
	image:'play.png',
	backgroundImage:'',
	width:'auto',
	height:'auto'
});

audioOperation.play = function(){
	audioPlayer.start();
	this.image = 'record.png';
};

audioOperation.pause = function(){
	audioPlayer.pause();
	this.image = 'play.png';
}

var audioProgress = Ti.UI.createLabel({
	top:60,
	color:'#fff',
	width:'auto',
	height:'auto',
	font:{fontSize:36, fontFamily:'HelveticaNeue-Bold'},
	text:'00:00:00'
});

var audioTags = Ti.UI.createTableView({
	top:100,
	editable:true
});

audioTags.insert = function(tag){
	var row = Ti.UI.createTableViewRow({
		title:tag.content,
		audioTag:tag
	});
	var style = Ti.UI.iPhone.RowAnimationStyle.FADE;
	if(!this.data || !this.data.length){
		this.appendRow(row, {animationStyle:style});
	}else{
		this.insertRowBefore(0, row, {animationStyle:style});
	}
};

playingWindow.addEventListener('open', function(e){
	var sender = e.source;
	var feed = sender.feed;
	var item = sender.item;
	sender.title = item.title;
	audioPlayer.url = item.url;
	audioTags.tags = Tag.findByUrl(item.url);
	audioProgress.seconds = 0;
	for(var i in audioTags.tags)
	{
		var tag = audioTags.tags[i];
		if(tag.point == 0){
			audioTags.insert(tag);
		}
	}
});

playingWindow.addEventListener('close', function(e){
	audioPlayer.stop();
});

var suppress = function(value, n){
	var str = "0"*n + value.toString();
	str = str.substr(str.length-n,n);
	return str;
};

audioPlayer.addEventListener('progress', function(e){
	var seconds = Math.round(e.progress);
	var hh = parseInt(seconds/3600);
	var mm = parseInt((seconds%3600)/60);
	var ss = parseInt(seconds%60);
	audioProgress.text = suppress(hh,2)+":"+suppress(mm,2)+":"+suppress(ss,2);
	audioProgress.seconds = seconds;
	
	for(var i in audioTags.tags)
	{
		var tag = audioTags.tags[i];
		if(tag.point == seconds){
			audioTags.insert(tag);
		}
	}
});

audioOperation.addEventListener('click', function(e){
	if(!audioPlayer.playing){
		audioOperation.play();
	}else{
		if(audioPlayer.state != audioPlayer.STATE_PLAYING){
			return;
		}
		audioOperation.pause();
		var tagWindow = Ti.UI.createWindow({
		});
		var tagInput = Ti.UI.createTextArea({
        	height:70,
        	width:300,
        	top:170,
        	font:{fontSize:20},
        	color:'#888',
        	textAlign:'left',
        	appearance:Titanium.UI.KEYBOARD_APPEARANCE_ALERT,       
        	keyboardType:Titanium.UI.KEYBOARD_ASCII,
        	suppressReturn:true,
        	borderRadius:5
		});
		tagWindow.add(tagInput);
		tagWindow.addEventListener('open', function(e){
			tagInput.focus();
		});
		tagWindow.addEventListener('return', function(e){
				if(tagInput.value){
				Ti.API.info("seconds:"+audioProgress.seconds);
				var tag = new Tag({
					url:playingWindow.item.url,
					point:audioProgress.seconds,
					content:tagInput.value
				});
				tag.add();
				audioTags.insert(tag);
			}
			tagWindow.close();
		});		
		tagWindow.open({modal:true, 
		 modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_PARTIAL_CURL,
				   modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,
				 navBarHidden:true });
	}
});

audioTags.addEventListener('delete', function(e){
	e.rowData.audioTag.remove();
});

playingWindow.add(audioOperation);
playingWindow.add(audioProgress);
playingWindow.add(audioTags);

