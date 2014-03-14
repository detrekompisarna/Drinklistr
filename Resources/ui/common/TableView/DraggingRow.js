//Dragging Row Component Constructor

/**
 * 
 * @param {Object} rowItemLeft object displayed in the left
 * @param {Object} rowItemRight object displayed in the right
 * @param {Object} snapTresholdFraction percentage from where the ending finger position will snap
 * @param {Object} snapOpenFraction snapping percentage open position
 */
function DraggingRow(rowItemLeft, rowItemRight, snapTresholdFraction, snapOpenFraction) {
	
	self= Ti.UI.createTableViewRow({
                className:'forumEvent', // used to improve table performance
                selectedBackgroundColor:'white',
                //rowIndex:drinkId, // custom property, useful for determining the row during events
                height:'123dip',
                touchEnabled : true
        });
	var rowTouchContainer = Ti.UI.createView({
		//backgroundColor : '#BBBBBB',
		//top : '123dip',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});
	var rowMovingContainer = Ti.UI.createView({
		touchEnabled : false,
		//backgroundColor : '#AAAAAA',
		width : '200%',
		left : '-100%',
		height : '123dip'
	});

	rowItemRight.left = "50%";
	rowMovingContainer.add(rowItemRight);

	rowMovingContainer.add(rowItemLeft);

	rowTouchContainer.add(rowMovingContainer);
	self.add(rowTouchContainer);
	
	
	//----------------------------------------
	//used to first animation, when animating to finger position.
	var isFirstMove = true;
	//discover the width only once.
	var isSetRowMovingContainerWidth = true;
	//used for proper calculations in positioning and snapping.
	var rowMovingContainerWidth;

	rowTouchContainer.addEventListener('touchstart', function(e) {
		// Define the width of the container to have an appropriate value for calculations
		if (isSetRowMovingContainerWidth) {
			rowMovingContainerWidth = rowMovingContainer.size.width;
			rowMovingContainerWidth /= 2;
			isSetRowMovingContainerWidth = false;
		}
	});

	rowTouchContainer.addEventListener('touchmove', function(e) {
		//Ti.API.info('e.x: ' + e.x);
		var newLeft = -(rowMovingContainerWidth - e.x);
		//Ti.API.info('newLeft: ' + newLeft);

		var duration = ( isFirstMove ? 50 : 1);
		rowMovingContainer.animate({
			left : newLeft,
			duration : duration
		});
		isFirstMove = false;
	});

	rowTouchContainer.addEventListener('touchend', function(e) {
		var newLeft;
		if (e.x < rowMovingContainerWidth * snapTresholdFraction)
			newLeft = -rowMovingContainerWidth;
		else
			newLeft = -(rowMovingContainerWidth * (1 - snapOpenFraction));

		setTimeout(function() {
			rowMovingContainer.animate({
				left : newLeft,
				duration : 50
			});
		}, 50);

		isFirstMove = true;
	});
	
	return self;
	
}

//make constructor function the public component interface
module.exports = DraggingRow;