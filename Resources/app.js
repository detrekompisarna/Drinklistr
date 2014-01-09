var defaultFontSize = 14;

console.log("Erik, din kod laddas och funkar typ");
 
// Set the background color to non-black to see the status bar
// Or set the Window statusBarStyle property to a non-default value
Ti.UI.setBackgroundColor('#232a35');
 
function StyledWindow(title) {
        var win = Ti.UI.createWindow({
                // Remove the status bar
                // fullscreen: true,
                // Moves the Window below the status bar
                statusBarStyle: Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,
                top: 0
        });
       
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
 
function doenaInEnTillDryckBa(drink) {
        var row = Ti.UI.createTableViewRow({
                className:'forumEvent', // used to improve table performance
                selectedBackgroundColor:'white',
                rowIndex:drink, // custom property, useful for determining the row during events
                height:123
        });
       
        var stretchBgRedwine = Ti.UI.createImageView({
                image: 'img/stretchbg_redwine.jpg',
                left:0, top:0,
                width:7, height:123
        });
        row.add(stretchBgRedwine);
       
        var labelProductCategory = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3},
                text:lillaSystemetDB[drink[0]].kat1.toUpperCase(),
                left:23, top: 19
        });
        row.add(labelProductCategory);
 
        var labelProductName = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+4},
                text:lillaSystemetDB[drink[0]].namn.substr(0,27),
                left:23, top: 45
        });
        row.add(labelProductName);
 
        var labelProductSubname = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+2},
                text:lillaSystemetDB[drink[0]].subnamn,
                left:23, top: 67
        });
        row.add(labelProductSubname);
 
        var labelProductInfo = Ti.UI.createLabel({
                color:'#72767c',
                font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3},
                text:'PRIS ' + lillaSystemetDB[drink[0]].pris[0] + ' kr    ALKOHOL 13 %    APK 1,0',
                left:23, top: 97
        });
        row.add(labelProductInfo);
 
        var flowArrow = Ti.UI.createImageView({
                image: 'img/flowarrow.png',
                right:10, top:53,
                width:10, height:17
        });
        row.add(flowArrow);
       
        tableData.push(row);
}
 
var tableView = Ti.UI.createTableView({
        backgroundColor:'white',
        top: 220,
        data:tableData
});
 
win.add(tableView);
 
win.open();

