Titanium.include("common.js");
Titanium.include("db.js");

var window = Titanium.UI.currentWindow;
window.barColor = '#222';

var audioStop = Ti.UI.createButton({
	systemButton: Ti.UI.iPhone.SystemButton.STOP
});

var tagLists = Ti.UI.createButton({
	image:'list.png'
});

var audioStopping = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});

var audioStreaming = require('com.tiaudiostreaming');
var audioPlayer = audioStreaming.createPlayer();

var playContext = {progress:0, duration:0, resume:0, seek:0};
window.playContext = function()
{
	return playContext;
};

var audioOperation = Ti.UI.createButton({
	top:8,
	image:'play.png',
	backgroundImage:'',
	width:'100%'
});

var sec2str = function(seconds){
	var mm = parseInt((seconds%3600)/60, 10);
	var ss = parseInt(seconds%60, 10);
	
	return suppress(mm,2)+":"+suppress(ss,2);
};

var audioRewind = Ti.UI.createButton({
	title:'15',
	font:{fontSize:10},
	width:32,
	height:32,
	color:'#FFF',
	top:74,
	left:24,
	backgroundImage:''
});

var audioRewinding = Ti.UI.createImageView({
	top:74,
	left:24,
	width:32,
	height:32,
	image:'rewind.png'
});

var rewindingAnimationStop;
var rewindingAnimation = function(){
	var r = Ti.UI.create2DMatrix();
	r = r.rotate(-180);
	audioRewinding.animate({transform:r,duration:500,opacity:0.0}, function(){
		audioRewinding.image = 'rewindr.png';
		var r = Ti.UI.create2DMatrix();
		audioRewinding.animate({duration:0,transform:r}, function(){
			var r = Ti.UI.create2DMatrix();
			r = r.rotate(-180);
			audioRewinding.animate({duration:500,transform:r, opacity:1.0}, function(){
				var r = Ti.UI.create2DMatrix();
				audioRewinding.animate({duration:0,transform:r}, function(){
					audioRewinding.image = 'rewind.png';
					if(!rewindingAnimationStop){
						rewindingAnimation();
					}
				});
			});
		});
	});
};

var audioActivity = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});

var audioProgress = Ti.UI.createLabel({
	top:80,
	right:22,
	textAlign:'right',
	color:'#fff',
	width:60,
	height:'auto',
	font:{fontSize:14, fontFamily:'HelveticaNeue-Bold'},
	text:'00:00'
});

var audioSeeker = Titanium.UI.createProgressBar({
	top:70,
	width:'60%',
	height:40,
    style:Titanium.UI.iPhone.ProgressBarStyle.PLAIN
});

var audioTags = Ti.UI.createTableView({
	top:110,
	data:[],
	editable:true
});

var sourceTags = [];
var currentTags = [];

audioTags.contains = function(tag){
	for(var i = 0; i < currentTags.length; i++){
		var currentTag = currentTags[i];
		if(currentTag === tag){
			return true;
		}
	}
	return false;
};

audioTags.insertTag = function(tag){
	var row = Ti.UI.createTableViewRow({
		height:'auto'
	});
	
	var point = Ti.UI.createLabel({
		left:4,
		width:54,
		height:24,
		backgroundColor:'#888',
		text:sec2str(tag.point),
		font:{fontSize:12, fontFamily:'HelveticaNeue-Bold'},
		borderRadius:4,
		textAlign:'center',
		color:'#fff'
	});
	
	point.addEventListener('click', function(e){
		var tagPointWindow = Ti.UI.createWindow({
			url:'tagPoint.js',
			height:0,
			bottom:0
		});
		tagPointWindow.initialPoint = tag.point;
	
		tagPointWindow.addEventListener('close', function(e){
			tag.point = tagPointWindow.editPoint;
			tag.update();
			audioTags.removeTag(tag);
			audioTags.checkTags();
		});

		var animation = Ti.UI.createAnimation({height:260, duration:300});
		tagPointWindow.open(animation);
	});	
	
	var content = Ti.UI.createLabel({
		left:64,
		width:'auto',
		height:'auto',
		text:'\n'+tag.content+'\n '
	});
	
	row.add(point);
	row.add(content);
	
	var style = Titanium.UI.iPhone.RowAnimationStyle.FADE;
	if(!currentTags.length){
		this.appendRow(row, {animationStyle:style});
	}else{
		this.insertRowBefore(0, row, {animationStyle:style});
	}	
	currentTags.splice(0, 0, tag);
};

audioTags.removeTag = function(tag){
	for(var i = 0; i < currentTags.length; i++){
		var currentTag = currentTags[i];
		if(currentTag === tag){
			var style = Titanium.UI.iPhone.RowAnimationStyle.FADE;
			this.deleteRow(i, {animationStyle:style});		
			currentTags.splice(i, 1);
			break;
		}
	}
};

audioTags.checkTags = function(){
	var seconds = playContext.progress;
	
	for(var i = 0; i < sourceTags.length; i++){
		var tag = sourceTags[i];

		if(tag.point <= (seconds + 1) && !audioTags.contains(tag)){
			Ti.API.info("attempt to add tag point:"+tag.point);
			audioTags.insertTag(tag);
		}
		
		if(tag.point > (seconds + 1) && audioTags.contains(tag)){
			Ti.API.info("attempt to remove tag point:"+tag.point);
			audioTags.removeTag(tag);		
		}
	}
};

window.addEventListener('open', function(e){
	var item = window.item;
	
	window.title = item.title;
	audioPlayer.url = item.url;	
	
	sourceTags = Tag.findByUrl(item.url);
	//if(window.args) {
	//	playContext = { duration:window.args.to, progress:window.args.from, resume:window.args.from};
	//}
	audioPlayer.fireEvent('progress', 
		{duration:playContext.duration, progress:playContext.progress});
	audioSeeker.visible = true;
});

audioPlayer.addEventListener('progress', function(e){
	if(!audioPlayer){ return; }
	if(playContext.seek)  { return; }

	if(e.duration){
		playContext.duration = e.duration;
	}
	playContext.progress = e.progress;	

	audioSeeker.max = playContext.duration;
	audioSeeker.value = playContext.progress;

	audioProgress.text = sec2str(Math.round(e.progress));
	
	audioTags.checkTags();
});

audioPlayer.addEventListener('change', function(e){
	if(!audioPlayer){
		return;
	}
	
	Ti.API.info("audioPlayer status changed:"+audioPlayer.state);
	
	if(audioPlayer.state == audioPlayer.STATE_INITIALIZED){
		Ti.API.info("duration:"+playContext.duration+" progress:"+playContext.progress);
		if(audioPlayer.errorCode == audioPlayer.ERR_NO_ERROR){
			// normally stopped
			if(audioStopping.visible){
				audioStopping.hide();
				window.close();
			}else{
				audioPlayer.fireEvent('progress', { duration:0, progress:0 });
			}
		}else{
			// abnormally stopped
			Ti.API.error("audioPlayer abnormally initialized errorCode:"+audioPlayer.errorCode);
			playContext.resume = playContext.progress;
		}
		audioPlayer.url = window.item.url;	
	}

	if(audioPlayer.state == audioPlayer.STATE_PLAYING){
		Ti.API.info("resume:"+playContext.resume+" seek:"+playContext.seek);
		if(playContext.resume){
			Ti.API.info("trying to resume:"+playContext.resume);
			audioPlayer.volume = 0;
			audioPlayer.seek(playContext.resume);
			playContext.seek = playContext.resume;
			playContext.resume = 0;
			return;
		}else if(playContext.seek){
			Ti.API.info("successfully resumed:"+playContext.seek);
			audioPlayer.fadein(500);
			playContext.seek = 0;
			rewindingAnimationStop = true;
		}
	}
	
	if(audioPlayer.state == audioPlayer.STATE_PLAYING ||
		audioPlayer.state == audioPlayer.STATE_PAUSED){
		audioOperation.image = 'record.png';
		audioActivity.hide();
	}else{
		audioOperation.image = 'play.png';
		if(audioPlayer.state != audioPlayer.STATE_INITIALIZED){
			audioActivity.show();
		}else{
			audioActivity.hide();
		}
	}
});

audioOperation.addEventListener('click', function(e){
	if(!audioPlayer.playing){
		audioPlayer.start();
	}else{
		audioPlayer.pause();
		var tagWindow = Ti.UI.createWindow({
			url:'tag.js',
			backgroundColor:'#000',
			barColor:'#222'
		});
		tagWindow.playing_url = window.item.url;
		tagWindow.playing_point = playContext.progress;
		
		tagWindow.addEventListener('close', function(e){
			var tag = tagWindow.entered;
			if(tag){
				tag.add();
				audioTags.insertTag(tag);
				sourceTags.push(tag);
			}
			Ti.API.info("tag window closed.");
			audioPlayer.start();
		});
		
		// cause keyboard toolbar not displayed.(ticket #3231)
		Ti.UI.currentTab.open(tagWindow);
		/*
		tagWindow.open({modal:true, 
		 				modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_PARTIAL_CURL,
				   		modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,
				 		navBarHidden:true });*/
		
	}
});

audioRewind.addEventListener('click', function(e){
	if(playContext.seek == 0 && audioPlayer.playing){
		var point = audioPlayer.progress - 15;
		if(point < 0){
			point = 0.001;
		}
		audioPlayer.seek(point);
		playContext.seek = point;
		
		rewindingAnimationStop = false;
		rewindingAnimation();
	}
});

audioTags.addEventListener('click', function(e){
	Ti.API.info("source:"+e.source+" row:"+e.row+" equal:"+(e.row == e.source));
	if(e.source !== e.row){
		return;
	}

	if(playContext.seek == 0 && audioPlayer.playing){
		var point = currentTags[e.index].point - 5;
		if(point < 0){
			point = 0.001; // zero
		}
		audioPlayer.seek(point);
		playContext.seek = point;
	}
});

audioTags.addEventListener('delete', function(e){	
	var sourceIndex = -1;
	for(var i = 0; i < sourceTags.length; i++){
		if(sourceTags[i] === currentTags[e.index]){
			sourceIndex = i;
			break;
		}
	}
	if(sourceIndex >= 0){
		sourceTags.splice(sourceIndex, 1);
	}

	if(currentTags[e.index].id){
		currentTags[e.index].remove();	
	}
	currentTags.splice(e.index, 1);
});

audioStop.addEventListener('click', function(e){
	if(audioPlayer.playing){
		audioStopping.show();
		audioPlayer.stop();
	}else{
		window.close();
	}
});

window.rightNavButton = tagLists;
window.leftNavButton = audioStop;
audioStop.add(audioStopping);
window.add(audioOperation);
window.add(audioRewinding);
window.add(audioRewind);
window.add(audioProgress);
audioOperation.add(audioActivity);
window.add(audioSeeker);
window.add(audioTags);

