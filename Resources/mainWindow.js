// old app.js file
// file not used anymore.
// copy code from here to correct places.



var defaultFontSize = 14;


console.log("Erik, din kod laddas och funkar");
 
// Set the background color to non-black to see the status bar
// Or set the Window statusBarStyle property to a non-default value

Ti.UI.setBackgroundColor('#232a35');
 
function StyledWindow(myTitle) {
        /*var win = Ti.UI.createWindow({
                // Remove the status bar
                // fullscreen: true,
                // Moves the Window below the status bar
                statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
                top: 0
        });*/
        var win = Ti.UI.createWindow({
                // Remove the status bar
                // fullscreen: true,
                // Moves the Window below the status bar
                title: myTitle,
    			backgroundColor:'#fff',
                fullscreen: false,
                navBarHidden: true,
                top: 0
        });
       	//var win = Ti.UI.createWindow();
        return win;
};
 
var artWindow = Ti.UI.createView({
        backgroundColor: '#232a35',
        height: 59,
        top: 0
});
 
var profileIcon = Ti.UI.createImageView({
        image: 'img/profile@2x.png',
        left:15, bottom: 14,
        width:12, height:14
});
artWindow.add(profileIcon);
 
var flowLabel = Ti.UI.createLabel({
        color:'white',
        font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize+2},
        text:'Flöde',
        textAlign: 'center',
        bottom: 14
});
artWindow.add(flowLabel);
 
var win = new StyledWindow('Articles');
 
win.add(artWindow);
 
var searchArea = Ti.UI.createView({
        backgroundColor: '#fff',
        font:{fontFamily:'Lato-Regular', fontSize:defaultFontSize+4},
        height: 161,
        top: 59
});
 
var searchBar = Ti.UI.createSearchBar({
        barColor:'#fff',
        font:{fontFamily:'Lato-Regular', fontSize:defaultFontSize+4},
        color: '#858688',
        showCancel:true,
        top: 0,
        height:48,
        value: 'Sök dryck…'
});
searchArea.add(searchBar);
 
var searchCategories = Ti.UI.createLabel({
        color:'#858688',
        font:{fontFamily:'Lato-Regular', fontSize:defaultFontSize+3},
        text:'Kategorier',
        top: 49, left: 10,
        height: 48,
        textAlign: 'left',
        verticalAlign: 'center'
});
searchArea.add(searchCategories);
 
var searchSlider = Ti.UI.createSlider({
        top: 113,
        min: 1, max: 1000,
        width: '94%',
        tintColor: '#4cbbc8',
        value: 80
});
 
var searchSliderLabel = Ti.UI.createLabel({
        text:'Pris < ' + searchSlider.value + ' kr',
        color:'#858688',
        font:{fontFamily:'Lato-Regular', fontSize:defaultFontSize+3},
        top: 78, left: 10,
        height: 48,
        textAlign: 'left',
        verticalAlign: 'center'
});
 
searchSlider.addEventListener('change', function(e) {
    searchSliderLabel.text = 'Pris < ' + String.format("%3.1f", e.value) + ' kr';
});
 
searchArea.add(searchSliderLabel);
searchArea.add(searchSlider);
 
win.add(searchArea);



var tableData = [];
 
var subHeader = Ti.UI.createTableViewRow({
        backgroundColor: '#2e353f',
        height:35
});
 
var subFlowLabel = Ti.UI.createLabel({
        color:'white',
        font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize},
        text:'Dessa borde du tycka asamycket om', //Bättre copy!
        textAlign: 'center',
        verticalAlign: 'center'
});
subHeader.add(subFlowLabel);
 
tableData.push(subHeader);

Ti.include('henke.js');
 
 //add rows
function doenaInEnTillDryckBa(drinkId,drinkScore) {
	
        var row = Ti.UI.createTableViewRow({
                className:'forumEvent', // used to improve table performance
                selectedBackgroundColor:'white',
                rowIndex:drinkId, // custom property, useful for determining the row during events
                height:123,
                touchEnabled : true
        });
        
        //row wrapper
        var enabledWrapperView = Ti.UI.createView({
	        backgroundColor : '#008FD5',
	        objName : 'enabledWrapperView',
	        rowID : drinkId,
	        width : Ti.UI.FILL,
	        height : '100%'
	    });
        
       
        var stretchBgRedwine = Ti.UI.createImageView({
                image: 'img/stretchbg_redwine.jpg',
                left:0, top:0,
                touchEnabled : false,
                width:7, height:123
        });
        enabledWrapperView.add(stretchBgRedwine);
		
		if (monopolistsDatabase[drinkId].kat) { //Den här if:en behöver vara med för att alla drycker verkar in ha en kategori.
        	var labelProductCategory = Ti.UI.createLabel({
                	color:'#212a38',
                	font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3},
                	text:monopolistsDatabase[drinkId].kat.toUpperCase(),
                	touchEnabled : false,
            	    left:23, top: 19
        	});
        }
       
        enabledWrapperView.add(labelProductCategory);
 
        var labelProductName = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+4},
                text:monopolistsDatabase[drinkId].namn.substr(0,27), //Lägg till "..." om den är längre än ca 27 tecken
                touchEnabled : false,
                left:23, top: 45
        });
        enabledWrapperView.add(labelProductName);
 
        var labelProductSubname = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+2},
                text:monopolistsDatabase[drinkId].namn2, //Lägg till en "if .namn2 finns..." på denna.
                touchEnabled : false,
                left:23, top: 67
        });
        enabledWrapperView.add(labelProductSubname);
 
        var labelProductInfo = Ti.UI.createLabel({
                color:'#72767c',
                font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3},
                text:'PRIS ' + monopolistsDatabase[drinkId].pris[0] + ' kr    ALKOHOL ' + monopolistsDatabase[drinkId].alk + '    APK 1,0',
                touchEnabled : false,
                left:23, top: 97
        });
        enabledWrapperView.add(labelProductInfo);
 
        var flowArrow = Ti.UI.createImageView({
                image: 'img/flowarrow.png',
                right:10, top:53,
                touchEnabled : false,
                width:10, height:17
        });
        enabledWrapperView.add(flowArrow);
        
        
        row.add(enabledWrapperView);
       
        tableData.push(row);
}
 
var tableView = Ti.UI.createTableView({
        backgroundColor:'white',
        top: 220,
        data:tableData
});
 
 win.add(tableView);
 
 tableView.addEventListener('swipe', function(e) {
    if (e.source && e.source.objName !== 'table') {
        Ti.API.info('Row swiped: ' + e.source);
        Ti.API.info('Row swiped: ' + e.source.objName);
        Ti.API.info('Row ID : ' + e.source.rowID);
        Ti.API.info(tableView);
 
        // log e 
        Ti.API.info('e : ' + JSON.stringify(e));
        // you can copy this output line from { to the end and paste it to http://jsonlint.com/ to analyze it.
        // Or set a breakpoint, debug and examine variables and values.
        
        //var row = getTableViewRowFromIndex(tableView, e.source.rowID);
        var row = tableView.data[0].rows[0];
 
 		row.animate({left: (row.left-50), duration: 500});
        row.left = row.left - 50;
 
        // delete the swiped row 
        //tableView.deleteRow(e.index);
        Ti.API.info('Row deleted (index) : ' + e.index);
    }
});
 
//https://gist.github.com/iskugor/1723400 
 function getTableViewRowFromIndex(table, index) {
	Ti.API.info('index: ' + index);
	var sections = table.data;
	if (!sections) {
		return null;
	}
	var currentRowIndex = index, row;
	for (var i = 0; i < sections.length; ++i) {
		Ti.API.info('Section: ' + i);
		Ti.API.info('Section length: ' + sections[i].rows.length);
		Ti.API.info('currentRowIndex: ' + currentRowIndex);
		if (currentRowIndex < sections[i].rows.length) {
			Ti.API.info('RETURNING: ' + sections[i].rows[currentRowIndex].title);
			Ti.API.debug(sections[i].rows[currentRowIndex]);
			Ti.API.debug(JSON.stringify(sections[i].rows[currentRowIndex]));
			return sections[i].rows[currentRowIndex];
		}
		else {
			currentRowIndex -= sections[i].rows.length;
		}
	}
}

 
win.open();

