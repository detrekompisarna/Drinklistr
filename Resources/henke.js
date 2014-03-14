//Banta ner UDB-objektet till minimum. Så konsolidera användarnamnen och .smakgrannar
//Droppa själv från smakgrannar och smakgrannetabell
//Gör så att endast top typ 100 smakgrannars drinkbetyg spelar roll och därmed behöver lagras i localdb.
//Gör så att man faktiskt bara laddar ner updated data när appen startas.
//Man bör kunna sortera på Koscher och Ekologiskt.
//Man bör (kunna) separera drycker på årgång.
//Förkorta JSONfilen som är vår systemet-databas. Förkorta alla kateborier först och främst.

/*
 * Single Window Application Template:
 * A basic starting point for your application.  Mostly a blank canvas.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
/*if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

// This is a single context application with multiple windows in a stack
(function() {
	//render appropriate components based on the platform and form factor
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
	var Window;
	if (isTablet) {
		Window = require('ui/tablet/ApplicationWindow');
	}
	else {
		// Android uses platform-specific properties to create windows.
		// All other platforms follow a similar UI pattern.
		if (osname === 'android') {
			Window = require('ui/handheld/android/ApplicationWindow');
		}
		else {
			Window = require('ui/handheld/ApplicationWindow');
		}
	}
	new Window().open();
})();*/




/**var scule = require('com.scule.min');
var collection = scule.factoryCollection('scule+titanium://test');
collection.setAutoCommit(true);**/

//Ti.App.Properties.setString("appLaunch", null); //Slao pao den haer om jag vill nollstaella appoeppningstillfaellena...
//collection.clear(); //...och den haer...
//var localdb = Ti.Database.open('localdb');//...och den haer...
//localdb.execute("DROP TABLE IF EXISTS drinkbetyg");//...och den haer...**/

var inloggad = {
	anvid: Titanium.Platform.getId().replace(/-/g, "") //Annars kan Titanium.Platform.id också funka
};
var andra = {};
var self = {};
var localdb = Ti.Database.open('localdb');
var UDB = {}; //User Data Base
var GDS = {}; //Global Drink Scores (object)
var oGDR = []; // Omvänd Global Drink Ranking (array)

var file = Ti.Filesystem.getFile('vaorlillasystemetdb.json');
var data = file.read().text;
data = data.replace(/[()]/g,'');
var monopolistsDatabase = JSON.parse(data); //This is the Database from the monolopist, with price, year, name, category, etc.
var readyRecArray = [];

localdb.execute('CREATE TABLE IF NOT EXISTS egnabetyg(drinkid INTEGER PRIMARY KEY,betyg INTEGER,updated FLOAT,uploaded INTEGER)');
localdb.execute('CREATE TABLE IF NOT EXISTS drinkscores(drinkid INTEGER PRIMARY KEY,score FLOAT,updated FLOAT)');
localdb.execute('CREATE TABLE IF NOT EXISTS smakgrannskap(anvid TEXT PRIMARY KEY,shareddrinks INT,likhet FLOAT,score FLOAT)');
localdb.execute('CREATE TABLE IF NOT EXISTS globaldrinkscores(drinkid INTEGER PRIMARY KEY,score FLOAT,updated FLOAT)');




var countCommonDrinks = function(anv1, anv2) {
	var count = 0;
	for (var drink in anv1.drinkbetyg) {
		if (anv2.drinkbetyg.hasOwnProperty(drink)) {
			count += 1;
		}
	}
	return count;
};

var calcTasteSimilarity = function(anv1, anv2) {
	var i;
	var likhet = 0;
	var count = 0;
	var mostCommonDrinks = 0;
	for (var drink in anv1.drinkbetyg) {
		if (anv2.drinkbetyg.hasOwnProperty(drink)) {
			i = Math.abs(anv1.drinkbetyg[drink] - anv2.drinkbetyg[drink]);
			if (i === 0) {likhet += 1;}
			else if (i === 1) {likhet += 0.9;}
			else if (i === 2) {likhet += 0.7;}
			else if (i === 3) {likhet += 0.4;}
			else if (i === 4) {likhet += 0;}
			count += 1;
		}
	}
	if (count === 0) {return 0;}
	return likhet/count;
};

function buildUDB() {
//UDB = collection.findAll()[0]; Detta är den gamla för gamla "databasen" bestående av en .json-fil
	UDB[inloggad.anvid] = {};
	UDB[inloggad.anvid].smakgrannar = {};
	var rows = localdb.execute('SELECT anvid FROM smakgrannskap');
	while (rows.isValidRow()) {
		if (rows.fieldByName('anvid') !== inloggad.anvid){
			UDB[rows.fieldByName('anvid')] = {};
	    }
	    rows.next();
	};
	//console.log(UDB)
	var subrows;
	for (var anv in UDB) {
		UDB[anv].namn = anv.toString();
		//console.log(UDB[anv].namn);
		UDB[anv].drinkbetyg = {};
		if (anv !== inloggad.anvid){
			subrows = localdb.execute('SELECT * FROM kuk' + anv); //pass på att var:et kan ställa till trubbel eftersom det upprepas varje loop.
			while (subrows.isValidRow()) {
				UDB[anv].drinkbetyg[subrows.fieldByName('drinkid')] = subrows.fieldByName('betyg');
				
				//Här fylls GDS-objektet:
				if(!GDS[subrows.fieldByName('drinkid')]) {
					GDS[subrows.fieldByName('drinkid')] = {
						totalScore: 0,
						noOfEntries: 0,
					};
				}
				else {
					GDS[subrows.fieldByName('drinkid')].totalScore += subrows.fieldByName('betyg');
					GDS[subrows.fieldByName('drinkid')].noOfEntries += 1;
					//GDS[subrows.fieldByName('drinkid')].score = GDS[subrows.fieldByName('drinkid')].totalScore / GDS[subrows.fieldByName('drinkid')].noOfEntries;
				}
				subrows.next();
			}
		}
		
		//console.log(UDB);
	}
	
	//Här fylls och sorteras omvänd Global Drink Ratings (oGDR) från Global Drink Scores (GDS)
	for (var drink in GDS) {
		oGDR.push([drink,GDS[drink].totalScore/GDS[drink].noOfEntries,GDS[drink].noOfEntries]);
		if (GDS[drink].noOfEntries == 0) {
			oGDR[oGDR.length-1][1] = 0;
		}
	}
	oGDR.sort(function(a,b){return b[2]-a[2];});
	oGDR.length = 60;
	oGDR.sort(function(a,b){return a[2]-b[2];});
	oGDR.sort(function(a,b){return a[1]-b[1];});
	
console.log("UDB aer nu i boerjan av buildUDB sao haer laong: " + Object.keys(UDB).length);
delete UDB["_id"];

};


var hittaSmakGrannar = function(anv) {
	console.log("Ordnar smakGrannar foer " + anv + "...");
	//console.log(UDB);
	UDB[anv].smakGrannar = {};
	for (var granne in UDB) {
		if (granne !== anv){
			UDB[anv].smakGrannar[granne] = {};
			UDB[anv].smakGrannar[granne].likhet = calcTasteSimilarity(UDB[anv],UDB[granne]);
			UDB[anv].smakGrannar[granne].deladeDrinkar = countCommonDrinks(UDB[anv],UDB[granne]);
			UDB[anv].smakGrannar[granne].score = calculateNeighbourityScore(UDB[anv].smakGrannar[granne]);
			console.log("...hittade " + granne + ", vars likhet, deladeDrinkar, and score raeknades till: " + UDB[anv].smakGrannar[granne].likhet + ", " + UDB[anv].smakGrannar[granne].deladeDrinkar + " respektive " + UDB[anv].smakGrannar[granne].score);
		}
	}
	orderNeighbourness(anv);
	return UDB[anv];
};

var calculateNeighbourityScore = function(nb) {
	var minRecdeladeDrinkar = 5;
	if (nb.deladeDrinkar > minRecdeladeDrinkar) {
		return nb.likhet;
	}
	else {
		var returner = nb.likhet * nb.deladeDrinkar * nb.deladeDrinkar / (minRecdeladeDrinkar * minRecdeladeDrinkar);
		return returner;
	}
};

var orderNeighbourness = function(anv) {
	UDB[anv].topSmakGrannar = [];
	
	for (var neigh in UDB[anv].smakGrannar) {
		UDB[anv].topSmakGrannar.push([neigh,UDB[anv].smakGrannar[neigh].score]);
		UDB[anv].topSmakGrannar.sort(function(a,b){return b[1]-a[1];});
	}
	for (var i = UDB[anv].topSmakGrannar.length - 1; i >= 0; i--) {
		UDB[anv].topSmakGrannar[i] = UDB[anv].topSmakGrannar[i][0];
	}
};

buildUDB();

hittaSmakGrannar(inloggad.anvid);


var listRecommendations = function(anv) {
	var nyaDrinkar = [];
	var score;
	//console.log("Inne på listRecommendations() nu och kommer att logga objektet andra här nedanför:");
	//console.log(andra);
	for (var anvaenders in andra) {
		for (var dr in andra[anvaenders].drinkbetyg) {
			nyaDrinkar.push(andra[anvaenders].drinkbetyg[dr]);
		}
	}
	//console.log(nyaDrinkar);
	UDB[anv].drinkScores = [];
	for (var drink in monopolistsDatabase) {//Det är nog det att den inte (borde) ha nån lillaStstemetDB som gör att det pajjar senare.
		score = sumOneDrinkScore(anv, drink);
		UDB[anv].drinkScores.push([drink,sumOneDrinkScore(anv, drink)]); 
		if (score > 0) {
			//console.log(score);
    		localdb.execute('INSERT OR REPLACE INTO drinkscores(drinkid,score,updated) VALUES (?,?,?)', drink,score,new Date());
		}
	}
	UDB[anv].drinkScores.sort(function(a,b){return b[1]-a[1];});
	//console.log("Haer kommer naogra av " + anv + "s drinkScores precis efter att de har blivit sorterade.");
	//for (var i = 0; i < 10; i++) {console.log(UDB[anv].drinkScores[i]);}
	//console.log("Daer var naogra av " + anv + "s drinkScores precis efter att de hade blivit sorterade.");
};

function SyncDatabaseFrom(datum) {
	var datanerreq = Titanium.Network.createHTTPClient();
	var url = "http://drinklistr.se/dataner.php";
	datanerreq.open("POST", url);
	var jsonen = {
		syfte: "nermeddata",
		anvid: inloggad.anvid,
		tid: datum
	};

	datanerreq.send(jsonen);

	datanerreq.onload = function () {
		var haemtat = JSON.parse(this.responseText); //Här är JSON-objektet som man får från den centrala databasen (innehållande bara)
		//console.log(haemtat);
		for (var anvae in haemtat) {
			andra[anvae] = {
				drinkbetyg: haemtat[anvae]
			};
		}
		listRecommendations(inloggad.anvid);

		// localdb.self = data hämtad från lokala DB
		var rows = localdb.execute('SELECT * FROM egnabetyg');
		self.drinkbetyg = {};
		while (rows.isValidRow()) {
			self.drinkbetyg[rows.fieldByName('drinkid')] = rows.fieldByName('betyg');
		    rows.next();
		};
		rows.close();
		//alert(JSON.stringify(andra));
		//alert(JSON.stringify(self));
		for (var anv in andra) {
			if (anv !== inloggad.drinkid) {
				andra[anv].deladeDrinkar = countCommonDrinks(self,andra[anv]);
				andra[anv].likhet = calcTasteSimilarity(self,andra[anv]);
				andra[anv].score = calculateNeighbourityScore(andra[anv]);
				localdb.execute('INSERT OR REPLACE INTO smakgrannskap (anvid,shareddrinks,likhet,score) VALUES (?,?,?,?)', anv,andra[anv].deladeDrinkar,andra[anv].likhet,andra[anv].score);
				localdb.execute('CREATE TABLE IF NOT EXISTS kuk' + anv + ' (drinkid INT PRIMARY KEY,betyg INT,updated FLOAT)');
				for (var drink in andra[anv].drinkbetyg) {
					localdb.execute("INSERT OR REPLACE INTO kuk" + anv + " (drinkid,betyg,updated) VALUES (?,?,?)",drink,andra[anv].drinkbetyg[drink],new Date());
				}
			}

		}
		
		//console.log(andra);
	};
	//Från denna: http://developer.appcelerator.com/question/122347/createhttpclient---post-method

}


if(Ti.App.Properties.getString('appLaunch')){//Detta (är true och) händer om jag redan har öppnat appen innan nån gång.
	//Uppdate the local ratingDB.
  console.log("2+:a gaongen appen oeppnas...");
  //localdb.execute('INSERT OR REPLACE INTO users (anvid,updated) VALUES (?,?)', inloggad.anvid,new Date());
}
else{//Första gången appen launchas på denna telefon
  //Ti.App.Propoerties.setString("GaongerÖppnad",1);
  //Ti.App.Properties.setString("appLaunch", JSON.stringify({opened:true}));
  console.log("Foersta gaongen appen oeppnas...");
  Ti.App.Properties.setString("anvid", Titanium.Platform.id.replace(/-/g, ""));
  SyncDatabaseFrom(0);
}



console.log(Ti.App.Properties);



var checkCat = function(drink,kat) {
	if (GAMLAALLDRINKSOBJSOMAERGAMMAL[drink].kategori) {
		for (var i = kat.length - 1; i >= 0; i--) {
			console.log(GAMLAALLDRINKSOBJSOMAERGAMMAL[drink].kategori);
			console.log(kat[i]);
			if(GAMLAALLDRINKSOBJSOMAERGAMMAL[drink].kategori === kat[i]) {
				return true;
			}
		}
	}
	return false;
};


var sumOneDrinkScore = function(anv, drink) {
	var neighboursRating;
	var neighboursScore;
	var summer = 0;
	var counter = 0;
	var granne;
	for (var i = 0; i < UDB[anv].topSmakGrannar.length; i++) {
		if (UDB[UDB[anv].topSmakGrannar[i]].drinkbetyg[drink] !== undefined) {
			granne = UDB[anv].topSmakGrannar[i];
			neighboursRating = UDB[granne].drinkbetyg[drink];
			neighboursScore = UDB[anv].smakGrannar[granne].score;
			summer += neighboursRating * neighboursScore;
			counter += neighboursScore;
			if (counter >= 1) {
				console.log("sumOneDrinkScore for " + anv + "'s drink " + drink + "'s counter reached 1 and therefore stopped counting and will return " + summer/counter);
				return summer/counter;
			}
		}
	}
	//console.log(anv + "'s score for " + drink + " is calculated to: " + summer);
	return summer;
};

var getTopDrinks = function(anv,rrd,antal) {
	var returner = DB[anv].drinkScores;
	if (rrd === false) {
		for (var alreadyDrank in DB[anv].drinkbetyg) {
			for (var i = returner.length - 1; i >= 0; i--) {
				if (returner[i][0] === alreadyDrank) {
					returner.splice(i,1);
				}
			}
		}
	}
	returner.sort(function(a,b){return b[1]-a[1];});
	if (antal >= 0) {
		returner.splice(antal,returner.length-antal);
	}
	return returner;
};

function saollaPaoRedanDruckna(obj, ai) {
	if (obj.redanDruckna === true) {return false;}
	else {
		for (var dd in UDB[obj.namn].drinkbetyg) {
			if (ai === dd) {
				return true;
			}
		}
	}
	return false;
}

function saollaPaoPris(ai, pris) {
	if (pris !== "" && pris !== null && pris !== undefined && pris.length > 0){
		if (monopolistsDatabase[ai].pris > pris || monopolistsDatabase[ai].pris[0] > pris) {
			return true;
		}
	}
	return false;
}

function saollaPaoSoekterm(ai, st) {
	if (st !== "" && st !== null && st.length > 0 && monopolistsDatabase[ai].namn.indexOf(st) === -1) {
		//console.log(monopolistsDatabase[ai].namn + " saollades pao soekterm")
		return true;
	}
	else {
		return false;
	}
}

function saollaPaoKategori(ai, arr) {
	if (arr !== undefined && arr.length > 0){
		for (var kat in arr) {
			if (monopolistsDatabase[ai].kat1 === arr[kat]) {
				return false;
			}
		}
	}
	else {return false;}
	//console.log(monopolistsDatabase[ai].namn + " saollades pao kategori");
	return true;
}


function pickRandomProperty(obj) {
    var propList = obj; //...
	var tmpList = Object.keys(propList);
	return tmpList[ Math.floor(Math.random()*tmpList.length) ];
}

var recommend = function () {
	var returner = [];
	self.floedeQuality = 0;
	var rows = localdb.execute('SELECT * FROM drinkscores ORDER BY score DESC');
		while (rows.isValidRow()) {
		//self.drinkbetyg[rows.fieldByName('drinkid')] = rows.fieldByName('betyg');
		returner.push([rows.fieldByName('drinkid'), rows.fieldByName('score')]);
		if(returner.length = 10) {
			for (var i = 0; i < 10; i++) {
				self.floedeQuality += returner[i][1];
			}
			self.floedeQuality *= 2;
		}
		rows.next();
	};
	console.log("Så här hög är flödeQuality på en skala mellan ett och hundra: " + self.floedeQuality);
	if (returner.length < 60) {
		for (var i = 0; i < 60 - returner.length; i=i) {
			returner.push(oGDR.pop());
		}
	}
	readyRecArray = returner;
	runFlow();
};

/**var prepReq = function(form) {
	var namn = form.namn.value;
	var redanDruckna = false;
	if (form.druckna.checked === true) {
		redanDruckna = true;
	}
	var maxpris = Math.parseInt(form.maxpris.value);
	var soekterm = form.soekterm.value;
	console.log({"namn": namn, "redanDruckna": redanDruckna, "antal": floetescap, "maxpris": maxpris, "soekterm": soekterm, "kat": form.kat});
	console.log(recommend({"namn": namn, "redanDruckna": redanDruckna, "antal": floedescap, "maxpris": maxpris, "soekterm": soekterm, "kat": form.kat}));
};**/

var floedescap = 100;

var form = {
	druckna: {value: true},
	maxpris: {value: 300},
	soekterm: {value: ""},
	kat: ["Öl", "Rött vin", "Brännviner"]
};



recommend();



function runFlow() {
	for (var n in readyRecArray) {
		if (monopolistsDatabase[readyRecArray[n][0]]) {//Ibland finns inte en votad dryck i databasen. Denna if ser till att bajs inte slår i taket när det händer.
			//doenaInEnTillDryckBa(readyRecArray[n][0],readyRecArray[n][1]);
		}
		else {
			//ajax-bajjax, skicka en notification, typ e-mail till oss så vi kan fixa detta problem.
		}
	}
}


function addRating(clickedDrink,grade) {
			var request = Titanium.Network.createHTTPClient();
			var url = "http://drinklistr.se/dataupp.php";
			request.open("POST", url);
			var jsonen = {
				anvid: inloggad.anvid,
				drinkid: clickedDrink,
				betyg: grade
			};
			request.send(jsonen);
			request.onload = function () {
				if (this.status == '200') { //This means "if the upload is successful".
					localdb.execute('INSERT OR REPLACE INTO egnabetyg(drinkid,betyg,updated,uploaded) VALUES (?,?,?,?)', clickedDrink, betyg, new Date(),1);

				} else {
					//alert('Transmission failed. Try again later. ' + this.status + " " + this.response);
					localdb.execute('INSERT OR REPLACE INTO egnabetyg(drinkid,betyg,updated,uploaded) VALUES (?,?,?,?)', clickedDrink, betyg, new Date(),0);

				}
			};
			//Från denna: http://developer.appcelerator.com/question/122347/createhttpclient---post-method
}

function syncOldUnSyncedDrinks() {
	var drinksToSync = [];
	var s;
	var rows = localdb.execute('SELECT * FROM egnabetyg WHERE uploaded=0');
	while (rows.isValidRow()) {
		drinksToSync.push([rows.fieldByName('drinkid'),rows.fieldByName('betyg')]);
	    rows.next();
	};
	for (var d = 0; d < drinksToSync; d++) {
		addRating(drinksToSync[d][0],drinksToSync[d][1]);
	}
}

//Funktionen nedan funkade bra innan mergen med Erik.
/**function runFlow(){
	if (floede) {
		floede.close();
	}
var stjaerna = "★";

Ti.UI.setBackgroundColor('#fff');

var floede = Ti.UI.createWindow({
});

var rekommendationslista = Ti.UI.createListView();

rekommendationslista.addEventListener('itemclick', function (e) {
	var alertWindow = Titanium.UI.createAlertDialog({
		title: 'Betygsätt dryck',
		cancel: 5,
		buttonNames: ['★', '★★', '★★★', '★★★★', '★★★★★', 'Cancel'],
	});

	alertWindow.addEventListener('click', function (ev) {
		//console.log(e);
		//Denna fula rad under rotar igenom information dold i listviewobjekt-ish:et och hittar id:t på drycken som just klickades. Och stringifyar det.
		var klickadDryck = e.source.sections[e.sectionIndex].getItemAt(e.itemIndex).properties.title;
		var betyg = ev.index + 1;

		//"[klickadDryck]" nedan måste bli rätt!


		localdb = Ti.Database.open('localdb');
		//sqlExec = "'SELECT drinkid FROM " + inloggad.anvid + "'";
		console.log(localdb.execute('SELECT drinkid FROM egnabetyg'));
		if (localdb.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="egnabetyg"')) {
			console.log("Tabell finns!");
			//console.log(localdb.execute('SELECT name FROM sqlite_master WHERE type="table" AND name="egnabetyg"'))
		} else {
			console.log("Tabell finns inte.");
		}
		localdb.execute('INSERT OR REPLACE INTO egnabetyg(drinkid,betyg,updated) VALUES (?,?,?)', klickadDryck, betyg, new Date());
		//localdb.execute('UPDATE condition SET icon=? WHERE id=?',importIcon,dbConditionId);

		localdb.close();
		switch (ev.index) {
		case 0:
			//alert( "Du har gett dryck: " + klickadDryck + " en stjärna. Dåligt.");
			break;
		case 1:
			//alert( "Du har gett dryck: " + klickadDryck + " två stjärnor. Dåligt.");
			break;
		case 2:
			//alert( "Du har gett dryck: " + klickadDryck + " tre stjärnor. Dåligt.");
			break;
		case 3:
			//alert( "Du har gett dryck: " + klickadDryck + " fejra stjärnor. Dåligt.");
			break;
		case 4:
			//alert( "Du har gett dryck: " + klickadDryck + " fem stjärnor. Dåligt.");
			break;
		case 5:
			//alert( "Nej, du. Nu gav du inget betyg till denna dryck. Dåligt.");
			break;
		}


		if (Titanium.Network.online && ev.index != 5) {
			console.log("Du har internet (typ) och kommer därför ladda upp detta betyg");
			var request = Titanium.Network.createHTTPClient();
			var url = "http://drinklistr.se/dataupp.php";
			request.open("POST", url);
			var jsonen = {
				anvid: inloggad.anvid,
				drinkid: klickadDryck,
				betyg: betyg
			};

			request.send(jsonen);

			request.onload = function () {
				if (this.status == '200') {} else {
					//alert('Transmission failed. Try again later. ' + this.status + " " + this.response);
				}
			};
			//Från denna: http://developer.appcelerator.com/question/122347/createhttpclient---post-method

		} else if (ev.index !== 5) {
			console.log("Du har inte internet. Tönt.");
		}
	});

	alertWindow.show();
	runFlow();

	//...från http://developer.appcelerator.com/question/87471/alertdialog-actions
});


var sections = [];

var femStjaernor = Ti.UI.createListSection({ headerTitle: 'Dessa drycker recommends som fan för dig din jävel'});
var fyraStjaernor = Ti.UI.createListSection({ headerTitle: 'Dessa drycker lär du tycka är ganska goa, fan'});
var treStjaernor = Ti.UI.createListSection({ headerTitle: 'Mjä...'});
var tvaoStjaernor = Ti.UI.createListSection({ headerTitle: 'Smakar typ piss'});
var ettStjaernor = Ti.UI.createListSection({ headerTitle: 'Fuck off'});

var femDataSet = [];
var fyraDataSet = [];
var treDataSet = [];
var tvaoDataSet = [];
var ettDataSet = [];

for (var i = 0; i < readyRecArray.length; i++) {
	if (readyRecArray[i][1] >= 4) {
		femDataSet.push({properties: { title: readyRecArray[i][0]}});
	}
	else if (readyRecArray[i][1] >= 3) {
		fyraDataSet.push({properties: { title: readyRecArray[i][0]}});
	}
	else if (readyRecArray[i][1] >= 2) {
		treDataSet.push({properties: { title: readyRecArray[i][0]}});
	}
	else if (readyRecArray[i][1] >= 1) {
		tvaoDataSet.push({properties: { title: readyRecArray[i][0]}});
	}
	else {
		ettDataSet.push({properties: { title: readyRecArray[i][0]}});
	}
}	

femStjaernor.setItems(femDataSet);
sections.push(femStjaernor);
fyraStjaernor.setItems(fyraDataSet);
sections.push(fyraStjaernor);
treStjaernor.setItems(treDataSet);
sections.push(treStjaernor);
tvaoStjaernor.setItems(tvaoDataSet);
sections.push(tvaoStjaernor);
ettStjaernor.setItems(ettDataSet);
sections.push(ettStjaernor);

rekommendationslista.sections = sections;

floede.add(rekommendationslista);
floede.open();

}**/
