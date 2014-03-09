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

	//construct UI
	//var firstView = new FirstView();
	//self.add(firstView);

	//row wrapper

	var dragItem = createRow(0);

	self.add(dragItem);

	//var olt = Titanium.UI.create2DMatrix(), curX, curY;

	dragItem.addEventListener('touchstart', function(e) {
		curX = e.x;
		//curY = e.y;
	});
	dragItem.addEventListener('touchmove', function(e) {
		var deltaX = e.x - curX;
		// deltaY = e.y - curY
		//olt = olt.translate(deltaX, deltaY, 0);
		dragItem.animate({
			//transform : olt,
			left : e.x,
			duration : 100
		});
		Ti.API.info('X : ' + e.x);
	});

	dragItem.addEventListener('touchend', function(e) {
		dragItem.x = 0;
		//enabledWrapperView.y = 0;
		//enabledWrapperView.top = 0;
		dragItem.left = 0;
	});

	// object to store last event position
	var basex;

	var circle = createRow('123dip');

	self.add(circle);

	// circle position before it has been animated
	var circlePosition = {
		top : circle.top,
		left : circle.left
	};

	circle.addEventListener('touchstart', function(e) {
		Titanium.API.info('Touch start: ' + JSON.stringify(e));
		// get absolute position at start
		basex = e.x;
		//basey = e.y;
		//touchMoveBase.set(e.globalPoint);
	});

	circle.addEventListener('touchmove', function(e) {
		//if (isMove++ > 15){
		Titanium.API.info('Moving: ' + JSON.stringify(e));
		// update the co-ordinates based on movement since last movement or touch start
		//circlePosition.top += e.y - basey;
		circlePosition.left += e.x - basex;
		circle.animate({
			//top : circlePosition.top,
			left : circlePosition.left,
			duration : 50
		});
		// reset absolute position to current position so next event will be relative to current position
		basex = e.x;
		//basey = e.y;
		//isMove = 0;
		//globalPoint
		//}
		//isMove = !isMove;
	});

	circle.addEventListener('touchend', function(e) {
		if (circle.left > 100) {
			circle.animate({
				left : ('200dip'),
				duration : 250
			});
		} else {
			circle.animate({
				left : 0,
				duration : 250
			});
		}
		Titanium.API.info('Stop drag: ' + JSON.stringify(e));
	});

	var swipeRow = createRow('246dip');
	self.add(swipeRow);
	swipeRow.addEventListener('touchstart', function(e) {
		swipeRow.animate({
			left : ('50dip'),
			duration : 100
		});
	});

	swipeRow.addEventListener('swipe', function(e) {
		if (e.source) {

			// log e
			//Ti.API.info('e : ' + JSON.stringify(e));

			if (e.direction == 'left') {
				swipeRow.animate({
					left : 0,
					duration : 400
				});
				swipeRow.left = 0;
			} else {
				swipeRow.animate({
					left : ('200dip'),
					duration : 400
				});
				swipeRow.left = '200dip';
			}

		}

	});

	var button = Titanium.UI.createButton({
		title : 'Reset',
		top : '500dip',
		width : '100dip',
		height : '50dip'
	});
	button.addEventListener('click', function(e) {
		dragItem.left = 0;
		circle.left = 0;
		swipeRow.left = 0;
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
		width : Ti.UI.FILL,
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
