var mobile = document.documentElement.clientWidth <= 700;

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYXNtYXJ0aW5lbGxpIiwiYSI6ImNqMXMyYTRuejAwOHkzM3Frbjg1ZW9kNnAifQ.F5tkdGnKJMv4yaYZNOTJ5w';
window.map = new mapboxgl.Map({
	container: "map", // container id
	style: "mapbox://styles/lukasmartinelli/cj1rztb6o000g2st2zlb7mp7t", //stylesheet location
	center: [24.323, -19.036], // starting position
	zoom: 5.8,
	maxZoom: 14,
	minZoom: 1,
	hash: true
});

var sidebar = document.getElementById('sidebar');
if (!mobile) {
	sidebar.className += " pin-bottomleft";
}

var playControl = document.getElementById('play-control');
var range = document.getElementById('range');
var time = document.getElementById('time');
var buildings = document.getElementById('buildings');

var startDate = new Date(2016, 6, 1);
var tally = 0; // The current index in the layers array we are showing.
var playback = false;
var max = range.max;

var dayStats = {};

var styleByDay = throttle(function (day) {
	var layers = ['malaria-building-point', 'malaria-building-glow', 'malaria-building-shape'];
	var filter = ["<=", "@day", day];

	if (map.loaded()) {
		layers.forEach(function(layer) {
			map.setFilter(layer, filter);
		});
	}
}, 400);

var updateCounts = throttle(function(total, date) {
	buildings.innerHTML = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	time.innerHTML = date.format('MMM D, YYYY');
}, 150);

function play(v) {
	range.value = v;
	var date = moment(startDate).add(range.value, 'days');

	var sum = 0;
	for(var d = 0; d <= v; d++) {
		sum += dayStats[d] || 0;
	}
	updateCounts(sum, date);
	styleByDay(v);

	// If range hit's the end show play button again
	if (parseInt(range.value) >= parseInt(range.max)) {
		clearPlayback();
	}
}

loadBuildingStats(function(stats) {
	dayStats = stats;
	map.on('load', function() {
		var minDay = parseInt(getQueryVariable('minday') || 160);
		var day = parseInt(getQueryVariable('day') || 0);
		var speed = parseInt(getQueryVariable('speed')) || 130;
		range.min = minDay;

		styleByDay(day);
		playControl.addEventListener('click', setPlay);
		setTimeout(function() {
			range.value = day;
			setPlay(speed);
		}, 500);
	});
});

map.on('zoomend', function() {
	var zoom = map.getZoom();
	if(zoom <= 5) {
		setSpeed(50);
	}
});

// Add events.
range.addEventListener('input', function() {
	if (playback) clearPlayback();
	play(parseInt(range.value, 10));
});

function loadBuildingStats(callback) {
	var xmlhttp;
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
			callback(JSON.parse(xmlhttp.responseText));
		}
	}
	xmlhttp.open("GET", "malaria_buildings_by_day.json", true);
	xmlhttp.send();
}

function clearPlayback() {
	window.clearInterval(playback);
	playControl.classList.remove('pause');
	playControl.classList.add('play');
	playback = false;
}

function setSpeed(speed) {
	console.log('Set speed', speed);
	clearPlayback();
	playback = window.setInterval(function() {
		var value = parseInt(range.value, 10);
		play(value + 1);
	}, speed);
}

function setPlay(speed) {
	if (parseInt(range.value) >= parseInt(range.max)) {
		range.value = parseInt(range.min);
	}

	speed = parseInt(speed) || 200;
	if (playback) return clearPlayback();
	playControl.classList.remove('play');
	playControl.classList.add('pause');
	playback = window.setInterval(function() {
		var value = parseInt(range.value, 10);
		play(value + 1);
	}, speed);
}

function throttle(fn, threshhold, scope) {
	threshhold || (threshhold = 250);
	var last,
			deferTimer;
	return function () {
		var context = scope || this;

		var now = +new Date,
				args = arguments;
		if (last && now < last + threshhold) {
			// hold on to it
			clearTimeout(deferTimer);
			deferTimer = setTimeout(function () {
				last = now;
				fn.apply(context, args);
			}, threshhold);
		} else {
			last = now;
			fn.apply(context, args);
		}
	};
}

function flyHandler(id, options) {
	var button = document.getElementById(id);
  if(!button) return;
	button.addEventListener('click', function() {
		map.flyTo({
			center: options.center,
			zoom: options.zoom || 5
		});
		if (options.startDay) {
			console.log('Play from day', options.startDay);
			play(options.startDay);
		}
		if (options.speed) {
			setSpeed(options.speed);
		}
	});
}

flyHandler('botswana', {
	center: [22.966, -21.918],
	zoom: 5.5,
	startDay: 140,
	speed: 450
});
flyHandler('zambia', {
	center: [25.155, -13.605],
	startDay: 210,
	zoom: 5.5,
	speed: 450
});
flyHandler('zimbabwe', {
	center: [27.234, -19.072],
	zoom: 5.5,
	speed: 300
});
/*
flyHandler('laos', {
	center: [105.9620, 16.6489],
	zoom: 8.4,
	startDay: 90,
	speed: 300
});
flyHandler('cambodia', {
	center: [104.5779, 11.8601],
	zoom: 7,
	startDay: 190,
	speed: 500
});
*/
flyHandler('guatemala', {
	center: [-91.302, 15.225],
	startDay: 60,
	zoom: 7.5,
	speed: 500
});
flyHandler('honduras', {
	center: [-86.214, 15.330],
	zoom: 6.5,
	startDay: 190,
	speed: 500
});

function getQueryVariable(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if (decodeURIComponent(pair[0]) == variable) {
						return decodeURIComponent(pair[1]);
				}
		}
		console.log('Query variable %s not found', variable);
}

