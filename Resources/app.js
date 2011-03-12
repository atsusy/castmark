// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

Titanium.include("feed.js");
Titanium.include("playlist.js");

var tab1 = Titanium.UI.createTab({  
    icon:'feed.png',
    title:'Feed',
    window:feedWindow
});

var tab2 = Titanium.UI.createTab({  
    icon:'playlist.png',
    title:'Playlist',
    window:playsWindow
});

tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  

tabGroup.addEventListener('focus', function(e){
    tabGroup._activeTab = e.tab;
    tabGroup._activeTabIndex = e.index;
    if ( tabGroup._activeTabIndex == -1){
    	return;
 	}
    
    Ti.UI.currentTab = tabGroup._activeTab; 
});
// open tab group
tabGroup.open();
