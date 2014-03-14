/**
 * 
 * @param {int} drinkId the array position of the drink in the db
 */
function DrinkRowItem(drinkId){
		//row wrapper
        self = Ti.UI.createView({
	        //rowID : drinkId,
	        touchEnabled : false,
	        width : Ti.UI.FILL,
	        height : Ti.UI.FILL
	    });
   
        var stretchBgRedwine = Ti.UI.createImageView({
                image : Titanium.Filesystem.resourcesDirectory + 'img/stretchbg_redwine.jpg',
                left:0, top:0,
                touchEnabled : false,
                width:'7dip', height:'123dip'
        });
        self.add(stretchBgRedwine);
		
		if (monopolistsDatabase[drinkId].kat) { //Den här if:en behöver vara med för att alla drycker verkar in ha en kategori.
        	var labelProductCategory = Ti.UI.createLabel({
                	color:'#212a38',
                	font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3+'dip'},
                	text: monopolistsDatabase[drinkId].kat.toUpperCase(),
                	touchEnabled : false,
            	    left:'23dip', top: '19dip'
        	});
        }
       
        self.add(labelProductCategory);
 
        var labelProductName = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+4+'dip'},
                text: monopolistsDatabase[drinkId].namn.substr(0,27), //Lägg till "..." om den är längre än ca 27 tecken
                touchEnabled : false,
                left:'23dip', top: '45dip'
        });
        self.add(labelProductName);
 
        var labelProductSubname = Ti.UI.createLabel({
                color:'#212a38',
                font:{fontFamily:'Lato-Black', fontSize:defaultFontSize+2+'dip'},
                text: monopolistsDatabase[drinkId].namn2, //Lägg till en "if .namn2 finns..." på denna.
                touchEnabled : false,
                left:'23dip', top: '67dip'
        });
        self.add(labelProductSubname);
 
        var labelProductInfo = Ti.UI.createLabel({
                color:'#72767c',
                font:{fontFamily:'Lato-Bold', fontSize:defaultFontSize-3+'dip'},
                text: 'PRIS ' + monopolistsDatabase[drinkId].pris[0] + ' kr    ALKOHOL ' + monopolistsDatabase[drinkId].alk + '    APK 1,0',
                touchEnabled : false,
                left:'23dip', top: '97dip'
        });
        self.add(labelProductInfo);
 
        var flowArrow = Ti.UI.createImageView({
                image : Titanium.Filesystem.resourcesDirectory + 'img/flowarrow.png',
                right:'10dip', top:'53dip',
                touchEnabled : false,
                width:'10dip', height:'17dip'
        });
        self.add(flowArrow);
        
	
	
	return self;	
}

//make constructor function the public component interface
module.exports = DrinkRowItem;
