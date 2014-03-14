function DrinkRowStar(){
	
	self = Ti.UI.createView({
	        color:'#FF3333',
	        touchEnabled : false,
	        width : Ti.UI.FILL,
	        height : Ti.UI.FILL
	    });
	//label using localization-ready strings from <app dir>/i18n/en/strings.xml
	var label = Ti.UI.createLabel({
		touchEnabled : false,
		color:'#000000',
		text:String.format(L('welcome'),'Titanium'),
		left:'150dip',
		height:'auto',
		width:'auto'
	});
	self.add(label);
	
	return self;	
}

//make constructor function the public component interface
module.exports = DrinkRowStar;