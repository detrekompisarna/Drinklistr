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

	/*var pWidth = Ti.Platform.displayCaps.platformWidth;
	var pHeight = Ti.Platform.displayCaps.platformHeight;
	Ti.App.SCREEN_WIDTH = (pWidth > pHeight) ? pHeight : pWidth;
	Ti.App.SCREEN_HEIGHT = (pWidth > pHeight) ? pWidth : pHeight;*/

	// object to store last event position
	var basex;
	var startx = "starting";
	var circle = Ti.UI.createView({
		backgroundColor : '#BBBBBB',
		top : '123dip',
		//left : 0,
		width : Ti.UI.FILL,
		//width : Ti.App.SCREEN_WIDTH * 3 + "px",
		height : '123dip'
	});
	var rowContainer = Ti.UI.createView({
		touchEnabled : false,
		backgroundColor : '#AAAAAA',
		width : '200%',
		left : '-100%',
		height : '123dip'
	});
	var circle2 = createRow('#008FD5');
	circle2.left = "50%";
	rowContainer.add(circle2);
	circle.add(rowContainer);
	//Titanium.API.info('Container width:' + circle.width);

	var left = createRow('#FF8FD5');
	//left.left = "-100%";
	rowContainer.add(left);
	//var right = createRow(0);
	//right.left = "33.33%";

	//var maxwidth = circle.width;
	//circle.width = maxwidth * 3;
	//circle2.left = maxwidth;

	self.add(circle);

	// circle position before it has been animated
	var circlePosition = {
		top : circle.top,
		left : circle.left
	};

	var isFirstMove = true;
	var containerWidth;
	circle.addEventListener('touchstart', function(e) {
		Titanium.API.info('Touch start: ' + JSON.stringify(e));
		// get absolute position at start
		containerWidth = rowContainer.size.width;
		containerWidth /= 2;
		if (startx == "starting")
			startx = containerWidth;
		startx += e.x;

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
		
		/*if (isFirstMove){
			startx = startx - e.x;
			isFirstMove = false;
		}*/
		//var newLeft = -(startx - e.x);
		var newLeft = -(containerWidth - e.x);
		Ti.API.info('left : ' + newLeft);
		if ((newLeft > 0)) {
			newLeft = 0;
		}
		if (newLeft < -containerWidth) {
			newLeft = -containerWidth;
		}

		if (isFirstMove){
			rowContainer.animate({
				left : newLeft,
				duration : 50
			});
			isFirstMove = false;
		} else {
			rowContainer.animate({
				left : newLeft,
				duration : 1
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
		/*if (startx < 0)
			startx = 0;
		if (startx > containerWidth)
			startx = containerWidth;*/
		if (e.x < containerWidth * 0.5) {
			//startx = containerWidth * 0.34;
			/*rowContainer.animate({
			 left : rowContainer.left + 3,
			 duration : 100
			 });*/
			setTimeout(function() {
				rowContainer.animate({
					//top : circlePosition.top,
					left : -containerWidth,
					duration : 50
				});
			}, 50);
		} else {
			startx = containerWidth;
			setTimeout(function() {
				rowContainer.animate({
					//top : circlePosition.top,
					left : -(containerWidth * (1-0.66)),
					duration : 50
				});
			}, 50);
		}
		isFirstMove = true;
		Ti.API.info('Endx : ' + startx);
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
		//Titanium.API.info('Stop drag: ' + JSON.stringify(e));
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

function createRow(color) {
	var enabledWrapperView = Ti.UI.createView({
		backgroundColor : color,
		objName : 'enabledWrapperView',
		left : 0,
		width : '50%',
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
