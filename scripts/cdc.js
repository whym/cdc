// Load dependencies:
// The below is for demonstration, not intended for production use.
// Host the files below locally or use a CDN as needed.
require.config({
	baseUrl: '/scripts',
	paths: {
		jquery: 'https://code.jquery.com/jquery-2.1.3.min',
		d3: 'https://raw.githubusercontent.com/mbostock/d3/v3.5.2/d3.min',
		c3: 'https://raw.githubusercontent.com/masayuki0812/c3/0.4.8/c3.min',
	}
});
(function(url){
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
})('https://rawgit.com/masayuki0812/c3/0.4.8/c3.css');

require(['jquery', 'd3', 'c3'], function($, d3, c3) {
	// The function below is derived from <https://github.com/cowboy/jquery-bbq/blob/8e0064b/jquery.ba-bbq.js#L444>, reused under GPL. Copyright (c) 2010 "Cowboy" Ben Alman.
	(function(h){h.deparam=function(i,j){var d={},k={"true":!0,"false":!1,"null":null};h.each(i.replace(/\+/g," ").split("&"),function(i,l){var m;var a=l.split("="),c=decodeURIComponent(a[0]),g=d,f=0,b=c.split("]["),e=b.length-1;/\[/.test(b[0])&&/\]$/.test(b[e])?(b[e]=b[e].replace(/\]$/,""),b=b.shift().split("[").concat(b),e=b.length-1):e=0;if(2===a.length)if(a=decodeURIComponent(a[1]),j&&(a=a&&!isNaN(a)?+a:"undefined"===a?void 0:void 0!==k[a]?k[a]:a),e)for(;f<=e;f++)c=""===b[f]?g.length:b[f],m=g[c]=f<e?g[c]||(b[f+1]&&isNaN(b[f+1])?{}:[]):a,g=m;else h.isArray(d[c])?d[c].push(a):d[c]=void 0!==d[c]?[d[c],a]:a;else c&&(d[c]=j?void 0:"")});return d}})(jQuery);
	
	function convertCounts(counts) {
		var nums = {};
		$.each(counts, function(d, value) {
			nums[d] = value[0].userdailycontribs.timeFrameEdits;
		});
		var ret = [];
		Object.keys(nums).sort().forEach(function(x){
			ret.push(nums[x]);
		});
		return ret;
	}
	function genDates(base, days, n) {
		var ret = [];
		n--;
		while ( n >= 0 ) {
			ret.push(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() - days * n, 23, 59, 59)).toISOString().substring(0, 19));
			n--;
		}
		return ret;
	}
	
	function queryDailyCount(site, user, days, date) {
		var data = {
			format: 'json',
			action: 'userdailycontribs',
			user: user,
			daysago: days - 1 // substract 1 for today
		};
		if ( date ) {
			data['basetimestamp'] = date;
		}
		return $.ajax({
			url: site,
			data: data,
			dataType: 'jsonp',
			cache: true
		});
	}
	
	function draw(user, days, num, sites, chart_path) {
		var d = new Date();
		var dates = genDates(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), days, num);
		dates.unshift('date');
		var dummies = [];
		$.each(sites, function(name, api){
			dummies.push([name].concat(Array.apply(null, new Array(num)).map(Number.prototype.valueOf, 0)));
		});
		var chart = c3.generate({
			bindto: chart_path,
			
			data: {
				x: 'date',
				localtime: false,
				xFormat : '%Y-%m-%dT%H:%M:%S',
				columns: [dates].concat(dummies),
				type: 'bar',
				order: 'asc',

		onclick: function (d, i) {
			var baseurl = sites[d.name].replace('api.php', 'index.php');
			var timestamp = d.x.toISOString().replace(/T.*$/, '235959').replace(/[\-:]/g, '');
			window.open(baseurl + '?title=Special:Contributions&target=' + user + '&offset=' + timestamp + '&limit=' + d.value);
        },
			},
			axis: {
				x: {
					type: 'timeseries',
					tick: {
						format: '%Y-%m-%d'
					}
				},
				y: {
					label: 'number of edits'
				}
			},
			grid: {
				y: { show: true }
			}
		});


		$('#title .username').text(user);
		$('#title .days').text(days);

		chart.groups([Object.keys(sites)]);
		var n = 0;
		$.each(sites, function(name, api){
			var counts = {};
			queryDailyCount(api, user, days * num).done(function(data, textStatus, jqXHR){
				if ( data.userdailycontribs.id == 0 || data.userdailycontribs.timeFrameEdits == 0 ) {
					n++;
					return;
				}
				dates.slice(1).forEach(function(date){
					queryDailyCount(api, user, days, date.replace(/[\-T:]/g, '')).done(function(data, textStatus, jqXHR){
						counts[date] = [data, textStatus, jqXHR];
						if ( data.userdailycontribs.id == 0 ) {
							return;
						}
						if ( Object.keys(counts).length == Object(dates).length - 1 ) {
							chart.load({
								columns: [
									dates,
									[name].concat(convertCounts(counts))
								],
								done: function() {
									n++;
									// if it's the last, show the "save" link
									if ( n == Object.keys(sites).length ) {
										window.setTimeout(function(){ // stacked view seems to take some more time after'done' on Firefox, so use timeout in 500 msecs
											$('#savelink a').html('<a href-lang="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(($('<div/>').append($('svg', $(chart_path)).clone())).html()) + '" download="chart.svg">Save as SVG<a>');
											document.title = $('#title').text();
										}, 1500);
									}
								}
							});
						}
					}).fail(function(jqXHR, textStatus, error){ alert("fail! " + JSON.stringify()); });
				});
			});
		});
	}

	var params = $.deparam(location.search.substr(1));
	var user = params['user'] || prompt('Username?');
	var days = parseInt(params['days']) || 30;
	var num  = parseInt(params['n'])	|| 20;
	var sites = {
		commons: 'http://commons.wikimedia.org/w/api.php',
		meta: 'http://meta.wikimedia.org/w/api.php',
		wikidata: 'http://www.wikidata.org/w/api.php',
		mw: 'http://www.mediawiki.org/w/api.php',
		enwiki: 'http://en.wikipedia.org/w/api.php',
		enwikt: 'http://en.wiktionary.org/w/api.php',
		enwikivoyage: 'http://en.wikivoyage.org/w/api.php',
		enwikibooks: 'http://en.wikibooks.org/w/api.php',
		jawiki: 'http://ja.wikipedia.org/w/api.php',
		jawikt: 'http://ja.wiktionary.org/w/api.php',
		translatewiki: 'http://translatewiki.net/w/api.php',
	};

	draw(user, days, num, sites, '#chart');
});
