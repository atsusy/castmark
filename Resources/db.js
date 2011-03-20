var exec_db = function(body){
	var db = Titanium.Database.open('castmark');
	var sender = this;
	sender.__exec_db_body__ = body;
	try{
		return sender.__exec_db_body__(db);
	}finally{
		db.close();
	}
};
	
/*
 * Feed
 */
//exec_db(function(db){db.execute('DROP TABLE IF EXISTS FEED');});
exec_db(function(db){db.execute('CREATE TABLE IF NOT EXISTS FEED (NAME TEXT, URL TEXT, IMAGE TEXT)');});

function Feed(args){
	this.exec_db = exec_db;
	
	this.name = args.name;
	this.url = args.url;
	this.image = args.image;
	
	this.__onloaded__ = null;
	
	this.add = function(){
		this.exec_db(function(db){db.execute('INSERT INTO FEED (NAME, URL, IMAGE) VALUES (?, ?, ?)', 
			this.name, this.url, this.image);
			Ti.API.info("feed was added. name:"+this.name+" url:"+this.url);
		});
	};
	
	this.remove = function(){
		this.exec_db(function(db){db.execute('DELETE FROM FEED WHERE URL=?', this.url);});
		Ti.API.info("feed was removed. name:"+this.name+" url:"+this.url);
	};
		
	this.items = function(onloaded){
		var query = 'SELECT * FROM rss WHERE url="'+this.url+'" limit 20';		
		var sender = this;
		sender.__onloaded__ = onloaded;
		var name = this.name;
		var image = this.image;
		Titanium.Yahoo.yql(query, function (d) {
			if(!d.success){
				Ti.API.error("yql error:"+d.message);
				Ti.API.error(d.message);
				sender.__onloaded__([]);
				return;
			}
			
			if(!d.data || !d.data.item)
			{
				sender.__onloaded__([]);
				return;
			}
			
			items = [];
			if(d.data.item.length){
				for(var i = 0; i < d.data.item.length; i++){
					try{
						if(Feed.isValid(d.data.item[i])){
							item = {
								name:name,
								image:image,
								title:d.data.item[i].title,
								pubDate:Date.parse(d.data.item[i].pubDate),
								url:d.data.item[i].enclosure.url };
							Ti.API.debug("item loaded title:"+item.title+" pubDate:"+item.pubDate+" url:"+item.url);
							this.items.push(item);
						}
					}catch(Ei){
						Ti.API.error("item not loaded query:"+query+" message:"+Ei.message);			
					}
				}
			}else{
				try{
					if(Feed.isValid(d.data.item)){
						item = {
							name:name,
							image:image,
							title:d.data.item.title,
							pubDate:Date.parse(d.data.item.pubDate),
							url:d.data.item.enclosure.url };				
						Ti.API.debug("item loaded title:"+item.title+" pubDate:"+item.pubDate+" url:"+item.url);
						items.push(item);
					}
				}catch(Eu){
					Ti.API.error("item not loaded query:"+query+" message:"+Eu.message);			
				}
			}
			sender.__onloaded__(items);
		});

		Ti.API.info("attempt to load feed items:"+this.url);
	};
	
	return this;
};

Feed.isValid = function(item){
	var endsWith = function(str, suffix) {
		var sub = str.length - suffix.length;
		return (sub >= 0) && (str.lastIndexOf(suffix) === sub);
	};
			
	if(!item) { return false; }
	if(item.length){
		item = item[0];
	}
	return (item.title &&
   	   item.enclosure &&
       item.enclosure.url &&
       endsWith(item.enclosure.url, ".mp3") &&
       item.pubDate);
};

Feed.lists = function(){
	return exec_db(function(db){
		var rows = db.execute('SELECT * FROM FEED');
		var feeds = [];
		while (rows.isValidRow()){
			feeds.push(new Feed({ name:rows.field(0), 
								   url:rows.field(1),
								 image:rows.field(2) }));
			Ti.API.info("feed listed. name:"+rows.field(0)+" url:"+rows.field(1));
			rows.next();
		}	
		return feeds;
	});
};

Feed.contains = function(obj){
	var url = obj;
	if(obj.url){
		url = obj.url;
	}
	return exec_db(function(db){
		var rows = db.execute('SELECT * FROM FEED WHERE URL=?', url);
		if(rows.getRowCount() > 0){
			return true;
		}
		return false;
	});
};

/*
 * History
 */
//exec_db(function(db){db.execute('DROP TABLE IF EXISTS HISTORY');});
exec_db(function(db){db.execute('CREATE TABLE IF NOT EXISTS HISTORY (NAME TEXT, IMAGE TEXT, URL TEXT, TITLE TEXT, PUBDATE TEXT, PLAYDATE TEXT, PROGRESS FLOAT, DURATION FLOAT)');});
function History(args){
	this.exec_db = exec_db;
	
	this.name = args.name;
	this.image = args.image;
	this.url = args.url;
	this.title = args.title;
	this.pubDate = args.pubDate;
	this.playDate = args.playDate;
	this.progress = args.progress;
	this.duration = args.duration;
	
	this.addOrUpdate = function(){
		var exists = this.exec_db(function(db){
			var rows = db.execute('SELECT URL FROM HISTORY WHERE URL=?', this.url);
			return (rows.getRowCount() > 0);
		});
		
		if(exists){
			this.exec_db(function(db){db.execute('UPDATE HISTORY SET PLAYDATE=?, PROGRESS=?, DURATION=? WHERE URL=?', this.playDate, this.progress, this.duration, this.url);});
			Ti.API.info("history was upated. url:"+this.url+" playDate:"+this.playDate+" progress:"+this.progress+" duration:"+this.duration);		
		}else{
			this.exec_db(function(db){db.execute('INSERT INTO HISTORY (NAME, IMAGE, URL, TITLE, PUBDATE, PLAYDATE, PROGRESS, DURATION) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
				this.name, this.image, this.url, this.title, this.pubDate, this.playDate, this.progress, this.duration); });
			Ti.API.info("history was added. url:"+this.url);
		}	
	};
	
	this.remove = function(){
		this.exec_db(function(db){db.execute('DELETE FROM HISTORY WHERE URL=?', this.url);});
		Ti.API.info("history was removed. url:"+this.url);
	};
	
	this.items = function(onloaded){
		Ti.API.info("attempt to load history items:"+this.url);
		var sender = this;
		sender.__onloaded__ = onloaded;
		sender.__onloaded__([this]);
	};
	
	return this;
};

History.lists = function(){
	return exec_db(function(db){
		var rows = db.execute('SELECT * FROM HISTORY ORDER BY PLAYDATE DESC');
		var histories = [];
		while (rows.isValidRow()){
			histories.push(new History({ name:rows.field(0),
									    image:rows.field(1),
								   	      url:rows.field(2),
  										title:rows.field(3),
								      pubDate:Number(rows.field(4)),
								     playDate:Number(rows.field(5)),
								     progress:rows.field(6),
								     duration:rows.field(7)}));
			Ti.API.info("history listed. url:"+rows.field(2)+" pubDate:"+Number(rows.field(4))+" playDate:"+Number(rows.field(5))+" progress:"+rows.field(6)+" duration:"+rows.field(7));
			rows.next();
		}
		return histories;		
	});
};

/*
 * Tag
 */
//exec_db(function(db){db.execute('DROP TABLE IF EXISTS TAG');});
exec_db(function(db){db.execute('CREATE TABLE IF NOT EXISTS TAG (ID INTEGER PRIMARY KEY, URL TEXT, POINT FLOAT, CONTENT TEXT)');});
function Tag(args){
	this.exec_db = exec_db;

	this.id = args.id;
	this.url = args.url;
	this.point = args.point;
	this.content = args.content;

	this.add = function(){
		this.exec_db(function(db){db.execute('INSERT INTO TAG (URL, POINT, CONTENT) VALUES (?, ?, ?)', this.url, this.point, this.content);});
		Ti.API.info("tag was added. url:"+this.url+" point:"+this.point+" content:"+this.content);
	};
	
	this.update = function(){
		this.exec_db(function(db){db.execute('UPDATE TAG SET CONTENT=? WHERE ID=?', this.id);});
		Ti.API.info("tag was updated. url:"+this.url+" point:"+this.point+" content:"+this.content);
	};
	
	this.remove = function(){
		this.exec_db(function(db){db.execute('DELETE FROM TAG WHERE ID=?', this.id);});
		Ti.API.info("tag was removed. url:"+this.url+" point:"+this.point);
	};
};

Tag.findByUrl = function(arg){
	var url = arg;
	if("string" != typeof(arg)){
		if(arg.url){
			url = arg.url;
		}else{
			return [];
		}
	}
	return exec_db(function(db){
		var rows = db.execute('SELECT * FROM TAG WHERE URL=? ORDER BY POINT', url);
		var tags = [];
		while (rows.isValidRow()){
			tags.push(new Tag({
				id:rows.field(0),
				url:rows.field(1),
				point:rows.field(2),
				content:rows.field(3)
			}));
			Ti.API.info("tag listed. id:"+rows.field(0)+" url:"+rows.field(1)+" point:"+rows.field(2)+" content:"+rows.field(3));
			rows.next();
		}
		return tags;
	});
};
