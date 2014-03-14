//Application Window Component Constructor
function ApplicationWindow() {
	//load component dependencies
	//var FirstView = require('ui/common/FirstView');

	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor : '#ffffff',
		navBarHidden : true,
		exitOnClose : true
	});
	
	var pWidth = Ti.Platform.displayCaps.platformWidth;
	var pHeight = Ti.Platform.displayCaps.platformHeight;
	Ti.App.SCREEN_WIDTH = (pWidth > pHeight) ? pHeight : pWidth;
	Ti.App.SCREEN_HEIGHT = (pWidth > pHeight) ? pWidth : pHeight;

	// object to store last event position
	var basex;
	var startx = Ti.App.SCREEN_WIDTH;
var circle = Ti.UI.createView({
		backgroundColor : '#BBBBBB',
		top : '123dip',
		//left : 0,
		//width : Ti.UI.FILL,
		width : Ti.App.SCREEN_WIDTH * 3 + "px",
		height : '123dip'
	});
	var circle2 = createRow(0);
	circle2.left = Ti.App.SCREEN_WIDTH + "px";
	
	circle.add(circle2);
	Titanium.API.info('Container width:' + circle.width);
	
	//var left = createRow(0);
	//circle.add(left);
	//var right = createRow(0);
	//right.left = "33.33%";
	
	circle.left = -Ti.App.SCREEN_WIDTH + "px";
	//var maxwidth = circle.width;
	//circle.width = maxwidth * 3;
	//circle2.left = maxwidth;

	self.add(circle);

	// circle position before it has been animated
	var circlePosition = {
		top : circle.top,
		left : circle.left
	};

	var containerWidth;
	circle.addEventListener('touchstart', function(e) {
		Titanium.API.info('Touch start: ' + JSON.stringify(e));
		// get absolute position at start
		startx += e.x;
		containerWidth = circle.width;
		Ti.API.info('Width : ' + containerWidth);
		//basey = e.y;
		//touchMoveBase.set(e.globalPoint);
	});

	circle.addEventListener('touchmove', function(e) {
		//if (isMove++ > 15){
		Ti.API.info('X : ' + e.x);
		// update the co-ordinates based on movement since last movement or touch start
		//circlePosition.top += e.y - basey;
		//circlePosition.left += e.x - basex;
		//basex += e.x - basex;
		var newLeft = -(startx - e.x);
		Ti.API.info('left : ' + newLeft);
		if((newLeft <= 0) && newLeft >Ti.App.SCREEN_WIDTH * -2){
			circle.animate({
				//top : circlePosition.top,
				left : newLeft,
				duration : 50
			});
		}
		// reset absolute position to current position so next event will be relative to current position
		//basex = e.x;
		//basey = e.y;
		//isMove = 0;
		//globalPoint
		//}
		//isMove = !isMove;
	});

	circle.addEventListener('touchend', function(e) {
		startx = startx - e.x;
		if (startx < 0)
			startx = 0;
		if (startx < Ti.App.SCREEN_WIDTH * -2)
			startx = Ti.App.SCREEN_WIDTH * -2;
		/*if (circle.left > 100) {
			circle.animate({
				left : ('200dip'),
				duration : 250
			});
		} else {
			circle.animate({
				left : 0,
				duration : 250
			});
		}*/
		Titanium.API.info('Stop drag: ' + JSON.stringify(e));
	});

	

	var button = Titanium.UI.createButton({
		title : 'Reset',
		top : '00dip',
		width : '100dip',
		height : '50dip'
	});
	button.addEventListener('click', function(e) {
		circle.left = -Ti.App.SCREEN_WIDTH + "px";
		startx = Ti.App.SCREEN_WIDTH;
	});
	self.add(button);

	return self;
}

function createRow(top) {
	var enabledWrapperView = Ti.UI.createView({
		backgroundColor : '#008FD5',
		objName : 'enabledWrapperView',
		top : top,
		left : 0,
		width : '33.34%',
		touchEnabled : false,
		height : '123dip'
	});

	var stretchBgRedwine = Ti.UI.createImageView({
		image : Titanium.Filesystem.resourcesDirectory + 'img/stretchbg_redwine.jpg',
		left : 0,
		top : 0,
		touchEnabled : false,
		width : '7dip',
		height : '123dip'
	});
	enabledWrapperView.add(stretchBgRedwine);

	var labelProductInfo = Ti.UI.createLabel({
		color : '#72767c',
		font : {
			fontFamily : 'Lato-Bold',
			fontSize : defaultFontSize - 3
		},
		text : 'PRIS APK 1,0',
		touchEnabled : false,
		left : '23dip',
		top : '97dip'
	});
	enabledWrapperView.add(labelProductInfo);

	var flowArrow = Ti.UI.createImageView({
		image : Titanium.Filesystem.resourcesDirectory + 'img/flowarrow.png',
		right : '10dip',
		top : '53dip',
		touchEnabled : false,
		width : '10dip',
		height : '17dip'
	});
	enabledWrapperView.add(flowArrow);

	return enabledWrapperView;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
