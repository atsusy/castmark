Ti.include('db.js');

var tagWindow = Ti.UI.currentWindow;

var candidates;
var candidatesIndex;

var candidateText = Ti.UI.createLabel({
	width:170,
	height:28,
	color:'#777',
	backgroundColor:'#fff',
	borderRadius:3
});

var candidateSwitcherButtons = [{title:L('Prev'), enabled:false}, {image:'dictionary.png'}, {title:L('Next'), enabled:false}];
var candidateSwitcher = Ti.UI.createButtonBar({
	labels:candidateSwitcherButtons,
	backgroundColor:'#555'
});
candidateSwitcher.buttonEnabled = function(index, enabled){
	candidateSwitcherButtons[index].enabled = enabled;
	candidateSwitcher.labels = candidateSwitcherButtons;
};

var candidateSearching = Ti.UI.createActivityIndicator({
	width:32,
	height:32,
	style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK
});

var clearCandidates = function(){
	candidates = [];
	candidatesIndex = 0;
	candidateText.text = '';
	candidateSwitcher.buttonEnabled(0, false);
	candidateSwitcher.buttonEnabled(1, false);
	candidateSwitcher.buttonEnabled(2, false);
};

var tagContent = Ti.UI.createTextArea({
   	height:100,
   	width:300,
    top:24,
    font:{fontSize:18},
    color:'#888',
	textAlign:'left',
    keyboardType:Titanium.UI.KEYBOARD_ASCII,
    borderRadius:5,
   	keyboardToolbar:[candidateText, candidateSwitcher],
	keyboardToolbarColor: '#222',	
	keyboardToolbarHeight: 40
});

tagWindow.addEventListener('open', function(e){
	tagContent.focus();
});

tagContent.addEventListener('change', function(e){
 	if(e.value.length > 100) {
        tagContent.value = e.value.substr(0,100);
    }
});

var lastword;
var candidateSearcher = setInterval(function(){
	var content = tagContent.value;
	if(content){
		var words = content.split(/\s+/);
		if(lastword != words[words.length - 1]){
			lastword = words[words.length - 1];
			if(!lastword){
				clearCandidates();
				return;
			}

			candidateSearching.show();
			var xhr = Ti.Network.createHTTPClient();
			xhr.onload = function(){
				var result = eval(this.responseText);
				if(result.length && result[0].similars){
					candidates = result[0].similars;
					candidateSwitcher.buttonEnabled(0, false);
					candidateSwitcher.buttonEnabled(1, true);
					candidateSwitcher.buttonEnabled(2, (candidates.length > 1));
					candidateText.text = candidates[0];
					candidatesIndex = 0;
				}else{
					candidates = [];
					candidateSwitcher.buttonEnabled(0, false);
					candidateSwitcher.buttonEnabled(1, true);
					candidateSwitcher.buttonEnabled(2, false);
					candidateText.text = lastword;
					candidatesIndex = 0;
				}
				candidateSearching.hide();
			};
			xhr.onerror = function(){
				candidateSearching.hide();
			};
			xhr.open('GET', 'http://lab.nulab.co.jp/spellchecker-2007-08-20/check?text='+lastword);
			xhr.send();
		}
	}else{
		clearCandidates();
	}
}, 500);

candidateText.addEventListener('click', function(e){		
	if(!tagContent.value){
		return;
	}

	var words = tagContent.value.split(/\s+/);

	words.splice(words.length-1,1);
	words.push(candidateText.text);

	tagContent.value = words.join(' ');
	lastword = candidateText.text;
	
	clearCandidates();	
});

candidateSwitcher.addEventListener('click', function(e){
	if(!candidates){
		return;
	}
	
	if(e.index == 1){
		var dictionaryWindow = Ti.UI.createWindow({
			url:'dictionary.js',
			barColor:'#222',
			word:candidateText.text
		});
	
		dictionaryWindow.open({modal:true, 
				 			   modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_PARTIAL_CURL,
					   		   modalStyle:Ti.UI.iPhone.MODAL_PRESENTATION_FULLSCREEN,
					 		   navBarHidden:true });
		return;
	}

	
	if(e.index == 0){
		if(candidatesIndex > 0){
			candidatesIndex--;
		}
	}
	
	if(e.index == 2){
		if(candidatesIndex < candidates.length - 1){
			candidatesIndex++;
		}
	}
	
	candidateText.text = candidates[candidatesIndex];

	candidateSwitcher.buttonEnabled(0, (candidatesIndex > 0));
	candidateSwitcher.buttonEnabled(2, (candidatesIndex < candidates.length - 1));
});

tagWindow.addEventListener('return', function(e){
	if(tagContent.value){
		/*
		var tag = new Tag({
			url:tagWindow.playing_url,
			point:tagWindow.playing_point,
			content:tagContent.value
		});
		tagWindow.entered = tag;*/
		tagWindow.entered = tagContent.value;
	}
	tagWindow.close();
});		

candidateText.add(candidateSearching);
tagWindow.add(tagContent);

