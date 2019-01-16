jQuery(function($) {

	// Functia apelata in cazul in care coordonatele au fost preluate cu succes
	function success(position) {

		// Ascundem mesajul de eroare
		$('.error').css('display', 'none');

		// Stocam in variabile latitudinea si longitudinea
		var lat = position.coords.latitude,
			lon = position.coords.longitude;

		// Functie de convertire a unei date de tip UNIX in zi a saptamanii
		var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		function time(timestamp) {
			var a = new Date(timestamp*1000);
			return days[a.getDay()];
		}

		// Functie de trecere a unui string la litere mari
		function upper(text) {
			return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
		}

		// Facem un apel catre API-ul de la Geonames pentru a obtine informatii
		// legate de locatie (codul tarii, numele tarii si numele orasului)
		// cu ajutorul latitudinii si longitudinii
		$.getJSON('https://secure.geonames.org/countrySubdivisionJSON?lat=' + lat + '&lng=' + lon + '&username=cristeaioan', function(locInfo) {
			// Setam unitatea de masura specifica tarii (metric/imperial)
			var impCountryCodes = ['BS', 'BZ', 'KY', 'PW', 'US'],
				units;
			if(impCountryCodes.indexOf(locInfo.countryCode) === -1) {
				units='si';
			} else {
				units='us';
			}

			// Functie pentru afisarea unitatii de masura pentru temperatura
			function unitText() {
				if (units === 'si') return ' &deg;C'; else return ' &deg;F';
			}


			// Afisam numele orasului
			$('.location h2').html(locInfo.adminName1);
			// Afisam numele tarii
			$('.location h3').html(locInfo.countryName);


			// Facem un apel catre API-ul de la Darksky pentru a obtine informatii
			// legate de vreme cu ajutorul latitudinii si a longitudinii
			// Precizam unitatea de masura
			$.get('https://api.darksky.net/forecast/b421d301ce7ef50d4a9d6e02ff0373ed/' + lat +',' + lon + '?units=' + units, function(weatherInfo) {
				$('.curr-wthr .container').css('background-image', 'url("images/bgs/' + weatherInfo.currently.icon + '.jpg")');

				// Afisam temperatura actuala
				$('.curr-wthr .temp h1').html(Math.floor(weatherInfo.currently.temperature) + '<span>' + unitText() + '</span>');

				// Afisam icoana specifica prognozei actuale
				$('.curr-wthr-state .icon img').attr('src', 'images/icons/' + weatherInfo.currently.icon + '.svg');
				$('.curr-wthr-state .description').html(upper(weatherInfo.currently.summary));

				// Afisam prognoza meteo pentru urmatoarele zile
				$('.daily .day').each(function(day) {
					day++;

					// Afisam ziua saptamanii
					$(this).children('.heading').html(time(weatherInfo.daily.data[day].time));
					// Afisam icoana specifica prognozei pe acea zi
					$(this).children('.icon').children('img').attr('src', 'images/icons/' + weatherInfo.daily.data[day].icon + '.svg');
					// Calculam si afisam temperatura media in acea zi
					$(this).children('.temp').html(Math.floor((weatherInfo.daily.data[day].temperatureMin+weatherInfo.daily.data[day].temperatureMax)/2) + unitText());
				});

			}, 'jsonp');
		});
	}

	// Functia apelata in cazul in care coordonatele nu au putut fi preluate
	function error() {
		$('.error').css('display', 'flex');
	}

	// Preluarea coordonatelor
	navigator.geolocation.getCurrentPosition(success, error);
});