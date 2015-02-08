var { ToggleButton } = require('sdk/ui/button/toggle');
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var panels = require("sdk/panel");

var sites = ["reddit","facebook","4chan","twitter","9gag","funnyjunk", "youtube", "buzzfeed", "imgur", "pinterest", "instagram"];

var date = new Date();
var timeSpent = 0;
var timeLoaded = 0;
var timeActivated = 0;
var timeDeactivated = 0;

var cameFromLoaded;

function checkSite(){
	for(let site of sites){
		if(tabs.activeTab.url.search(site) != -1){
			return true;
		}
	}
	return false;
}

var button = ToggleButton({
  id: "my-button",
  label: "Time Wasted",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleChange
});

function handleChange(state) {
	if (state.checked) {
  		if(checkSite() && timeActivated != 0){
    		date = new Date();
			timeDeactivated = date.getTime(); //milliseconds
			timeSpent += timeDeactivated - timeActivated;
			timeActivated = timeDeactivated;
		}
		else if(checkSite() && timeLoaded != 0 ){
			date = new Date();
			timeDeactivated = date.getTime(); //milliseconds
			timeSpent += timeDeactivated - timeLoaded;
			timeActivated = timeDeactivated;
			cameFromLoaded = false;
		}
    panel.show({
      position: button
    });
  }
}

var panel = panels.Panel({
	width: 190,
  	height: 180,
	contentScriptFile: self.data.url("./changetext.js"),
	contentURL: self.data.url("./panel.html"),
	onHide: handleHide,
});

panel.on("show", function(string) {
	var time = timeSpent/100000;
	panel.port.emit("show", time);
	panel.postMessage(time);
});

function handleHide() {
  button.state('window', {checked: false});
}

tabs.on('pageshow', function() {
	cameFromLoaded = true;

	if(checkSite()){
		date = new Date();
		timeLoaded = date.getTime();
		console.log('loaded site at ' + timeLoaded);
	}
});

tabs.on('activate', function () {
  cameFromLoaded = false;

  if(checkSite()){
  	date = new Date();
 	timeActivated = date.getTime(); //milliseconds
  	console.log(tabs.activeTab.url + ' timeActivated = ' + timeActivated);
  }
});

tabs.on('deactivate', function () {
	console.log("deactivated nerd");

	if(checkSite() && !cameFromLoaded){
		date = new Date();
		timeDeactivated = date.getTime(); //milliseconds
		timeSpent += timeDeactivated - timeActivated;
		//console.log( tabs.activeTab.url + ' timeDeactivated = ' + timeDeactivated);
		//console.log('timeSpent: ' + timeSpent);
	}

	else if(checkSite() && cameFromLoaded){
		date = new Date();
		timeDeactivated = date.getTime(); //milliseconds
		timeSpent += timeDeactivated - timeLoaded;
		cameFromLoaded = false;
		//console.log( tabs.activeTab.url + ' cameFromLoaded: timeDeactivated = ' + timeDeactivated);
		//console.log('timeSpent: ' + timeSpent);
	}
});

tabs.on('close', function() {

	if(checkSite() && !cameFromLoaded){
		date = new Date();
		timeClosed = date.getTime();
		timeSpent += timeClosed - timeActivated; 
		//console.log('timeSpent: ' + timeSpent);
	}

	else if(checkSite() && cameFromLoaded){
		date = new Date();
		timeClosed = date.getTime();
		timeSpent += timeClosed - timeLoaded;
		//console.log('timeSpent from loaded: ' + timeSpent);
	}
});

function onOpen(tab) {
  console.log(tab.url + " is open");
  tab.on("pageshow", logShow);
  tab.on("activate", logActivate);
  tab.on("deactivate", logDeactivate);
  tab.on("close", logClose);
}

function logShow(tab) {
  console.log(tab.url + " is loaded");
}

function logActivate(tab) {
  console.log(tab.url + " is activated");
}

function logDeactivate(tab) {
  console.log(tab.url + " is deactivated");
}

function logClose(tab) {
  console.log(tab.url + " is closed");
}

tabs.on('open', onOpen);