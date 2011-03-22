// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

Titanium.include("feed.js");
Titanium.include("playlist.js");

var tab1 = Titanium.UI.createTab({  
    icon:'feed.png',
    title:L('Feed'),
    window:feedWindow
});

var tab2 = Titanium.UI.createTab({  
    icon:'playlist.png',
    title:L('Playlist'),
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

function isiOS4Plus()
{
	// add iphone specific tests
	if (Titanium.Platform.name == 'iPhone OS')
	{
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);
		
		// can only test this support on a 3.2+ device
		if (major >= 4)
		{
			return true;
		}
	}
	return false;
}

if (isiOS4Plus())
{
	// listen for a local notification event
	Ti.App.iOS.addEventListener('notification',function(e)
	{
		Ti.API.info("local notification received: "+JSON.stringify(e));
	});

	// fired when an app resumes for suspension
	Ti.App.addEventListener('resume',function(e){
		Ti.API.info("app is resuming from the background");
	});
	Ti.App.addEventListener('resumed',function(e){
		Ti.API.info("app has resumed from the background");
	});

	Ti.App.addEventListener('pause',function(e){
		Ti.API.info("app was paused from the foreground");
	});
}