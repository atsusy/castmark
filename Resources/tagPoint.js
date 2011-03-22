Ti.include('common.js');

var window = Ti.UI.currentWindow;

var done = Ti.UI.createButton({
	title:'Close',
	style:Ti.UI.iPhone.SystemButtonStyle.DONE
});
	
var toolbar = Ti.UI.createToolbar({
	top:0,
	items:[done],
	borderTop:true,
	borderBottom:false,
	translucent:true,
	barColor:'#222'
});
window.add(toolbar);
	
var picker = Ti.UI.createPicker({
	top:44
});

var columns = [];
for(var j = 0; j < 2; j++){
	var column = Ti.UI.createPickerColumn();
	for(var i = 0; i < 60; i++){
		var row = Ti.UI.createPickerRow();
		var label = Ti.UI.createLabel({
			width:'auto',
			height:'auto',
			text:suppress(i,2),
			textAlign:'center'
		});
		row.add(label);
		column.addRow(row);
	}
	columns[j] = column;
}
picker.selectionIndicator = true;

window.addEventListener('open', function(e){
	window.editPoint = window.initialPoint;
	picker.setSelectedRow(0, parseInt(window.initialPoint, 10) / 60, true);
	picker.setSelectedRow(1, parseInt(window.initialPoint, 10) % 60, true);
});

done.addEventListener('click', function(e){
	var animation = Ti.UI.createAnimation();
	animation.height = 0;
	animation.duration = 300;
	window.close(animation);
});

picker.addEventListener('change', function(e){
	if(e.columnIndex == 0){
		window.editPoint = e.rowIndex * 60 + window.editPoint % 60;
	}else{
		window.editPoint = parseInt(window.editPoint / 60, 10) * 60 + e.rowIndex;
	}
});
	

picker.add(columns);
window.add(picker);	