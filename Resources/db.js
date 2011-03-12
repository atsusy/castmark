var db = Titanium.Database.open('castmark');

/*
 * Feed
 */
//db.execute('DROP TABLE IF EXISTS FEED');
db.execute('CREATE TABLE IF NOT EXISTS FEED (NAME TEXT, URL TEXT, IMAGE TEXT)');
function Feed(args){
	this.name = args.name;
	this.url = args.url;
	this.image = args.image;
	
	this.add = function(){
		db.execute('INSERT INTO FEED (NAME, URL, IMAGE) VALUES (?, ?, ?)', this.name, this.url, this.image);
		Ti.API.info("feed was added. name:"+this.name + " url:"+this.url);
	};
	
	this.remove = function(){
		db.execute('DELETE FROM FEED WHERE URL=?', this.url);
		Ti.API.info("feed was removed. name:"+this.name + " url:"+this.url);
	};
	
	this.items = function(onload){
		var sender = this;
		this.onload = onload;
		
		var query = 'SELECT * FROM rss WHERE url="'+this.url+'"';
		Ti.API.info("call yql:"+query);
		Titanium.Yahoo.yql(query, function (d) {
			if(!d.success){
				Ti.API.error(d.message);
				return;
			}
			var item;
			if(d.data.item.length){
				for(var i = 0; i < d.data.item.length; i++){
					item = {
						title:d.data.item[i].title,
						pubDate:d.data.item[i].pubDate,
						url:d.data.item[i].enclosure.url };
					Ti.API.info("item loaded title:"+item.title+" pubDate:"+item.pubDate+" url:"+item.url);
					sender.onload(item);
				}
			}else{
				item = {
					title:d.data.item.title,
					pubDate:d.data.item.pubDate,
					url:d.data.item.enclosure.url };				
				Ti.API.info("item loaded title:"+item.title+" pubDate:"+item.pubDate+" url:"+item.url);
				sender.onload(item);
			}
		});
	};
	return this;
}

Feed.lists = function(){
	var feeds = [];
	var rows = db.execute('SELECT * FROM FEED');
	while (rows.isValidRow()){
		feeds.push(new Feed({ name:rows.field(0), 
							   url:rows.field(1),
							 image:rows.field(2) }));
		Ti.API.info("feed listed. name:"+rows.field(0)+" url:"+rows.field(1));
		rows.next();
	}	
	return feeds;
};

Feed.contains = function(obj){
	var url = obj;
	if(obj.url){
		url = obj.url;
	}
	var rows = db.execute('SELECT * FROM FEED WHERE URL=?', url);
	if(rows.getRowCount() > 0){
		return true;
	}
	return false;
};

/*
 * Tag
 */
//db.execute('DROP TABLE IF EXISTS TAG');
db.execute('CREATE TABLE IF NOT EXISTS TAG  (URL TEXT, POINT INT, CONTENT TEXT)');
function Tag(args){
	this.url = args.url;
	this.point = args.point;
	this.content = args.content;

	this.add = function(){
		db.execute('INSERT INTO TAG (URL, POINT, CONTENT) VALUES (?, ?, ?)', this.url, this.point, this.content);
		Ti.API.info("tag was added. url:"+this.url + " point:"+this.point + " content:"+this.content);
	};
	
	this.remove = function(){
		db.execute('DELETE FROM TAG WHERE URL=? AND POINT=?', this.url, this.point);
		Ti.API.info("tag was removed. url:"+this.url + " point:"+this.point);
	};
}

Tag.findByUrl = function(arg){
	var url = arg;
	if("string" != typeof(arg)){
		if(arg.url){
			url = arg.url;
		}else{
			return [];
		}
	}
	var rows = db.execute('SELECT * FROM TAG WHERE URL=? ORDER BY POINT', url);
	var tags = [];
	while (rows.isValidRow()){
		tags.push(new Tag({
			url:rows.field(0),
			point:rows.field(1),
			content:rows.field(2)
		}));
		Ti.API.info("tag listed. url:"+rows.field(0)+" point:"+rows.field(1)+" content:"+rows.field(2));
		rows.next();
	}
	return tags;
};
