//Application Window Component Constructor
function ApplicationWindow() {
	//load component dependencies
	var DraggingRow = require('ui/common/DraggingRow');
	var DrinkRowItem = require('ui/common/DrinkRowItem');
	var DrinkRowStar = require('ui/common/DrinkRowStar');

	var snapTresholdFraction = 0.5;
	var snapOpenFraction = 0.65;

	//create component instance
	var self = Ti.UI.createWindow({
		backgroundColor : '#FFFFFF',
		fullscreen : false,
		navBarHidden : true
	});

	//------------------------
	//header
	var header = Ti.UI.createView({
        backgroundColor: '#232a35',
        height: '59dip',
        top: 0
	});
	var flowLabel = Ti.UI.createLabel({
		color : 'white',
		font : {
			fontFamily : 'Lato-Bold',
			fontSize : defaultFontSize + 2 + 'dip'
		},
		text : 'Flöde',
		textAlign : 'center',
		bottom : '14dip'
	});
	header.add(flowLabel);
	self.add(header);

	//sub header
	var subHeader = Ti.UI.createView({
		backgroundColor : '#2e353f',
		height : '35dip',
		top: '59dip'
	});

	var subFlowLabel = Ti.UI.createLabel({
		color : 'white',
		font : {
			fontFamily : 'Lato-Bold',
			fontSize : defaultFontSize+'dip'
		},
		text : 'Dessa borde du tycka asamycket om', //Bättre copy!
		textAlign : 'center',
		verticalAlign : 'center'
	});
	subHeader.add(subFlowLabel);
	self.add(subHeader);

	//table
	var tableData = [];

	tableData.push(new DraggingRow(new DrinkRowStar(), new DrinkRowItem(), snapTresholdFraction, snapOpenFraction));
	var tableView = Ti.UI.createTableView({
		backgroundColor : 'white',
		top : '94dip',
		data : tableData
	});
	self.add(tableView);

	return self;
}

//make constructor function the public component interface
module.exports = ApplicationWindow;
