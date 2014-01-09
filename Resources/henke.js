<<<<<<< HEAD




//BAJS <---- Och flyttade din bajs hit.

//Här skiver jag nåt
=======
//BAJSKORv
>>>>>>> bajs
//Banta ner ADB-objektet till minimum. Så konsolidera användarnamnen och .smakgrannar
//Droppa själv från smakgrannar och smakgrannetabell
//Gör så att endast top typ 100 smakgrannars drinkbetyg spelar roll och därmed behöver lagras i localdb.

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
if (Ti.version < 1.8 ) {
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
})();




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
var sjaelv = {};
var localdb = Ti.Database.open('localdb');
var ADB = {};

//Ti.include('erik.js');


var countCommonDrinks = function(anv1, anv2) {
	var count = 0;
	for (var drink in anv1.drinkbetyg) {
		if (anv2.drinkbetyg.hasOwnProperty(drink)) {
			count += 1;
		}
	}
	return count;
};

var raeknaSmaklikhet = function(anv1, anv2) {
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


function byggADB() {
//ADB = collection.findAll()[0]; Detta är den gamla för gamla "databasen" bestående av en .json-fil
	var rows = localdb.execute('SELECT anvid FROM smakgrannskap');
	while (rows.isValidRow()) {
		ADB[rows.fieldByName('anvid')] = {};
	    rows.next();
	};
	//console.log(ADB)
	var subrows;
	for (var anv in ADB) {
		ADB[anv].namn = anv.toString();
		//console.log(ADB[anv].namn);
		subrows = localdb.execute('SELECT * FROM kuk' + anv); //pass på att var:et kan ställa till trubbel eftersom det upprepas varje loop.
		ADB[anv].drinkbetyg = {};
		while (subrows.isValidRow()) {
			ADB[anv].drinkbetyg[subrows.fieldByName('drinkid')] = subrows.fieldByName('betyg');
			subrows.next();
		}
		
		//console.log(ADB);
	}
	
console.log("ADB aer nu i boerjan av byggADB sao haer laong: " + Object.keys(ADB).length);
delete ADB["_id"];

};

byggADB();


var hittaSmakGrannar = function(anv) {
	console.log("Ordnar smakGrannar foer " + anv + "...");
	//console.log(ADB);
	ADB[anv].smakGrannar = {};
	for (var granne in ADB) {
		if (granne !== anv){
			ADB[anv].smakGrannar[granne] = {};
			ADB[anv].smakGrannar[granne].likhet = raeknaSmaklikhet(ADB[anv],ADB[granne]);
			ADB[anv].smakGrannar[granne].deladeDrinkar = countCommonDrinks(ADB[anv],ADB[granne]);
			ADB[anv].smakGrannar[granne].score = calculateNeighbourityScore(ADB[anv].smakGrannar[granne]);
			console.log("...hittade " + granne + ", vars likhet, deladeDrinkar, and score raeknades till: " + ADB[anv].smakGrannar[granne].likhet + ", " + ADB[anv].smakGrannar[granne].deladeDrinkar + " respektive " + ADB[anv].smakGrannar[granne].score);
		}
	}
	orderNeighbourness(anv);
	return ADB[anv];
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
	ADB[anv].topSmakGrannar = [];
	
	for (var neigh in ADB[anv].smakGrannar) {
		ADB[anv].topSmakGrannar.push([neigh,ADB[anv].smakGrannar[neigh].score]);
		ADB[anv].topSmakGrannar.sort(function(a,b){return b[1]-a[1];});
	}
	for (var i = ADB[anv].topSmakGrannar.length - 1; i >= 0; i--) {
		ADB[anv].topSmakGrannar[i] = ADB[anv].topSmakGrannar[i][0];
	}
};

hittaSmakGrannar(inloggad.anvid);


var listaRekommendationer = function(anv) {
	ADB[anv].drinkScores = [];
	var nyaDrinkar = [];
	var score;
	console.log("Härelleh!?");
	console.log(andra);
	for (var anvaenders in andra) {
		for (var dr in andra[anvaenders].drinkbetyg) {
			nyaDrinkar.push(andra[anvaenders].drinkbetyg[dr]);
			
		}
	}
	console.log(nyaDrinkar);
	for (var drink in lillaSystemetDB) {//Det är nog det att den inte (borde) ha nån lillaStstemetDB som gör att det pajjar senare.
		score = summeraEnDrinkscore(anv, drink);
		ADB[anv].drinkScores.push([drink,summeraEnDrinkscore(anv, drink)]); //Den där "* 2":an ska såklart inte vara där sedan.
		if (score > 0) {
			//console.log(score);
    		localdb.execute('INSERT OR REPLACE INTO drinkscores(drinkid,score,uppdaterad) VALUES (?,?,?)', drink,score,new Date());
		}
	}
	/**for (var i = 0; i < ADB[anv].drinkScores.length; i++) {
		console.log(ADB[anv].drinkScores[i][1]);
	}**/
	ADB[anv].drinkScores.sort(function(a,b){return b[1]-a[1];});
	//console.log("Haer kommer naogra av " + anv + "s drinkScores precis efter att de har blivit sorterade.");
	//for (var i = 0; i < 10; i++) {console.log(ADB[anv].drinkScores[i]);}
	//console.log("Daer var naogra av " + anv + "s drinkScores precis efter att de hade blivit sorterade.");
};

function synkaDatabasFraon(datum) {
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
		listaRekommendationer(inloggad.anvid);

		// localdb.sjaelv = data hämtad från lokala DB
		var rows = localdb.execute('SELECT * FROM egnabetyg');
		sjaelv.drinkbetyg = {};
		while (rows.isValidRow()) {
			sjaelv.drinkbetyg[rows.fieldByName('drinkid')] = rows.fieldByName('betyg');
		    rows.next();
		};
		rows.close();
		//alert(JSON.stringify(andra));
		//alert(JSON.stringify(sjaelv));
		for (var anv in andra) {
			andra[anv].deladeDrinkar = countCommonDrinks(sjaelv,andra[anv]);
			andra[anv].likhet = raeknaSmaklikhet(sjaelv,andra[anv]);
			andra[anv].score = calculateNeighbourityScore(andra[anv]);
			localdb.execute('INSERT OR REPLACE INTO smakgrannskap (anvid,deladedrinkar,likhet,score) VALUES (?,?,?,?)', anv,andra[anv].deladeDrinkar,andra[anv].likhet,andra[anv].score);
			localdb.execute('CREATE TABLE IF NOT EXISTS kuk' + anv + ' (drinkid INT PRIMARY KEY,betyg INT,uppdaterad FLOAT)');
			for (var drink in andra[anv].drinkbetyg) {
				localdb.execute("INSERT OR REPLACE INTO kuk" + anv + " (drinkid,betyg,uppdaterad) VALUES (?,?,?)",drink,andra[anv].drinkbetyg[drink],new Date());
			}

		}
		
		//console.log(andra);
	};
	//Från denna: http://developer.appcelerator.com/question/122347/createhttpclient---post-method

}

var file = Ti.Filesystem.getFile('vaorlillasystemetdb.json');
var data = file.read().text;
data = data.replace(/[()]/g,'');
var lillaSystemetDB = JSON.parse(data);
var redoRekArray = [];

if(Ti.App.Properties.getString('appLaunch')){//Detta (är true och) händer om jag redan har öppnat appen innan nån gång.
	//Uppdatera den lokala ratingDB.
  console.log("2+:a gaongen appen oeppnas...");
  //localdb.execute('INSERT OR REPLACE INTO users (anvid,uppdaterad) VALUES (?,?)', inloggad.anvid,new Date());
}
else{//Första gången appen launchas på denna telefon
  //Ti.App.Propoerties.setString("GaongerÖppnad",1);
  var foerstaGaongen = true;
  //Ti.App.Properties.setString("appLaunch", JSON.stringify({opened:true}));
  console.log("Foersta gaongen appen oeppnas...");
  Ti.App.Properties.setString("anvid", Titanium.Platform.id.replace(/-/g, ""));
  //localdb.execute('CREATE TABLE IF NOT EXISTS users(anvid TEXT PRIMARY KEY,anvnamn TEXT,skapad TEXT,uppdaterad FLOAT);');
  localdb.execute('CREATE TABLE IF NOT EXISTS egnabetyg(drinkid INTEGER PRIMARY KEY,betyg INTEGER,uppdaterad FLOAT)');
  localdb.execute('CREATE TABLE IF NOT EXISTS drinkscores(drinkid INTEGER PRIMARY KEY,score FLOAT,uppdaterad FLOAT)');
  localdb.execute('CREATE TABLE IF NOT EXISTS smakgrannskap(anvid TEXT PRIMARY KEY,deladedrinkar INT,likhet FLOAT,score FLOAT)');
  //localdb.execute('INSERT OR REPLACE INTO users (anvid,uppdaterad) VALUES (?,?)', inloggad.anvid,new Date());
  synkaDatabasFraon(0);
  localdb.close;
}


koerFloedet();

console.log(Ti.App.Properties);


/**collection.raeknaFolk = function() {
	return Object.keys(collection.findOne(collection.getLastInsertId()));
};**/

/**if (foerstaGaongen === false) {
	var bedoemningsDB = collection.findAll()[0];
}**/




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


var summeraEnDrinkscore = function(anv, drink) {
	var neighboursRating;
	var neighboursScore;
	var summer = 0;
	var counter = 0;
	var granne;
	for (var i = 0; i < ADB[anv].topSmakGrannar.length; i++) {
		if (ADB[ADB[anv].topSmakGrannar[i]].drinkbetyg[drink] !== undefined) {
			granne = ADB[anv].topSmakGrannar[i];
			neighboursRating = ADB[granne].drinkbetyg[drink];
			neighboursScore = ADB[anv].smakGrannar[granne].score;
			summer += neighboursRating * neighboursScore;
			counter += neighboursScore;
			if (counter >= 1) {
				console.log("summeraEnDrinkscore for " + anv + "'s drink " + drink + "'s counter reached 1 and therefore stopped counting and will return " + summer/counter);
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
		for (var dd in ADB[obj.namn].drinkbetyg) {
			if (ai === dd) {
				return true;
			}
		}
	}
	return false;
}

function saollaPaoPris(ai, pris) {
	if (pris !== "" && pris !== null && pris !== undefined && pris.length > 0){
		if (lillaSystemetDB[ai].pris > pris || lillaSystemetDB[ai].pris[0] > pris) {
			return true;
		}
	}
	return false;
}

function saollaPaoSoekterm(ai, st) {
	if (st !== "" && st !== null && st.length > 0 && lillaSystemetDB[ai].namn.indexOf(st) === -1) {
		//console.log(lillaSystemetDB[ai].namn + " saollades pao soekterm")
		return true;
	}
	else {
		return false;
	}
}

function saollaPaoKategori(ai, arr) {
	if (arr !== undefined && arr.length > 0){
		for (var kat in arr) {
			if (lillaSystemetDB[ai].kat1 === arr[kat]) {
				return false;
			}
		}
	}
	else {return false;}
	//console.log(lillaSystemetDB[ai].namn + " saollades pao kategori");
	return true;
}

var addaBetyg = function(arr) {
	//Denna är nu gammal när SQLiten börjar funka. 
	if (!ADB[arr[0]]) {
		ADB[arr[0]] = {};
		ADB[arr[0]].drinkbetyg = {};
	}
	ADB[arr[0]].drinkbetyg[arr[1]] = arr[2];
};

function raeknaUtGlobalaDrinkscores() {
	//Här ska jag lägga till JS som plockar all drinkdata från den lokala SQLite:n och sedan räknar ut snittbetygen på varje drink
}

var rekommendera = function () {
	var returner = [];
	var rows = localdb.execute('SELECT * FROM drinkscores ORDER BY score DESC');
		while (rows.isValidRow()) {
		//sjaelv.drinkbetyg[rows.fieldByName('drinkid')] = rows.fieldByName('betyg');
		returner.push([rows.fieldByName('drinkid'), rows.fieldByName('score')]);
		rows.next();
	};
	redoRekArray = returner;
	koerFloedet();
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
	console.log(rekommendera({"namn": namn, "redanDruckna": redanDruckna, "antal": floedescap, "maxpris": maxpris, "soekterm": soekterm, "kat": form.kat}));
};**/

var floedescap = 100;

var form = {
	druckna: {value: true},
	maxpris: {value: 300},
	soekterm: {value: ""},
	kat: ["Öl", "Rött vin", "Brännviner"]
};

//Följande rad är nog för gammal nu när man betygsätter från en annan funktion funkar.
//var bedoemningsSubmit = [inloggad.anvid,131,3]; //[Anvid, Artikelnummer, Rating(1-5)]
//addaBetyg(bedoemningsSubmit);


var rekommendationsrequest = {"namn": inloggad.anvid, "redanDruckna": form.druckna, "antal": floedescap, "maxpris": form.maxpris, "soekterm": form.soekterm, "": []};
rekommendera();



function koerFloedet() {
	for (var drink in redoRekArray) {
		doenaInEnTillDryckBa(redoRekArray[drink]);
	}
}


//Funktionen nedan funkade bra innan mergen med Erik.
/**function koerFloedet(){
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
		localdb.execute('INSERT OR REPLACE INTO egnabetyg(drinkid,betyg,uppdaterad) VALUES (?,?,?)', klickadDryck, betyg, new Date());
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
	koerFloedet();

	//...från http://developer.appcelerator.com/question/87471/alertdialog-actions
});


var sections = [];

var femStjaernor = Ti.UI.createListSection({ headerTitle: 'Dessa drycker rekommenderas som fan för dig din jävel'});
var fyraStjaernor = Ti.UI.createListSection({ headerTitle: 'Dessa drycker lär du tycka är ganska goa, fan'});
var treStjaernor = Ti.UI.createListSection({ headerTitle: 'Mjä...'});
var tvaoStjaernor = Ti.UI.createListSection({ headerTitle: 'Smakar typ piss'});
var ettStjaernor = Ti.UI.createListSection({ headerTitle: 'Fuck off'});

var femDataSet = [];
var fyraDataSet = [];
var treDataSet = [];
var tvaoDataSet = [];
var ettDataSet = [];

for (var i = 0; i < redoRekArray.length; i++) {
	if (redoRekArray[i][1] >= 4) {
		femDataSet.push({properties: { title: redoRekArray[i][0]}});
	}
	else if (redoRekArray[i][1] >= 3) {
		fyraDataSet.push({properties: { title: redoRekArray[i][0]}});
	}
	else if (redoRekArray[i][1] >= 2) {
		treDataSet.push({properties: { title: redoRekArray[i][0]}});
	}
	else if (redoRekArray[i][1] >= 1) {
		tvaoDataSet.push({properties: { title: redoRekArray[i][0]}});
	}
	else {
		ettDataSet.push({properties: { title: redoRekArray[i][0]}});
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
