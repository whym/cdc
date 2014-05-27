require.config({
    baseUrl: '/scripts',
    paths: {
		jquery: 'https://code.jquery.com/jquery-1.9.1.min',
		d3: 'http://d3js.org/d3.v3.min',
		c3: 'https://raw.githubusercontent.com/masayuki0812/c3/0.1.42/c3.min',
    }
});

require(['jquery', 'd3', 'c3'], function($, d3, c3) {
	// The function below is derived from <https://github.com/cowboy/jquery-bbq/blob/master/jquery.ba-bbq.js#L444>, reused under GPL. Copyright (c) 2010 "Cowboy" Ben Alman.
	(function(h){h.deparam=function(i,j){var d={},k={"true":!0,"false":!1,"null":null};h.each(i.replace(/\+/g," ").split("&"),function(i,l){var m;var a=l.split("="),c=decodeURIComponent(a[0]),g=d,f=0,b=c.split("]["),e=b.length-1;/\[/.test(b[0])&&/\]$/.test(b[e])?(b[e]=b[e].replace(/\]$/,""),b=b.shift().split("[").concat(b),e=b.length-1):e=0;if(2===a.length)if(a=decodeURIComponent(a[1]),j&&(a=a&&!isNaN(a)?+a:"undefined"===a?void 0:void 0!==k[a]?k[a]:a),e)for(;f<=e;f++)c=""===b[f]?g.length:b[f],m=g[c]=f<e?g[c]||(b[f+1]&&isNaN(b[f+1])?{}:[]):a,g=m;else h.isArray(d[c])?d[c].push(a):d[c]=void 0!==d[c]?[d[c],a]:a;else c&&(d[c]=j?void 0:"")});return d}})(jQuery);
	
    function convertCounts(counts) {
		var nums = {};
		$.each(counts, function(days, value) {
			nums[days] = value[0].userdailycontribs.timeFrameEdits;
		});
		var ret = [];
		var last = 0;
		Object.keys(nums).sort(function(a,b){return a-b}).forEach(function(x){
			ret.push(nums[x] - last);
			last = nums[x];
		});
		return ret.reverse();
    }
	
    function genDates(last, days, n) {
		var ret = [];
		n--;
		while ( n >= 0 ) {
			ret.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() - days * n).toISOString().substring(0, 10));
			n--;
		}
		return ret;
    }
	
    function datapoints(site, user, days, num, callback) {
		var ret = {};
		var s = 0;
		var gets = [];
		var qs = [];
		while ( s < days * num ) {
			s += days;
			qs.push(s);
		}
		qs.forEach(function(d){
			gets.push($.ajax({
				url: site,
				data: {
					format: 'json',
					action: 'userdailycontribs',
					user: user,
					daysago: d
				},
				dataType: 'jsonp',
				cache: true
			}).done(function(data, textStatus, jqXHR) {
				if ( data.userdailycontribs.id != 0 ) {
					ret[d] = [data, textStatus, jqXHR];
				}
			}
				   ));
		});
		$.when.apply($, gets).done(function() {
			callback(ret);
		}).fail(function(){ alert("fail!" + JSON.stringify(ret)); });
    }
	
    function draw(user, days, num, sites, chart_path) {
		var dates = genDates(new Date(), days, num);
		dates.unshift('date');
		var dummies = [];
		$.each(sites, function(name, api){
			dummies.push([name].concat(Array.apply(null, new Array(num)).map(Number.prototype.valueOf, 0)));
		});
		var chart = c3.generate({
			bindto: chart_path,
			
			data: {
				x: 'date',
				x_format : '%Y-%m-%d',
				columns: [dates].concat(dummies),
				type: 'bar',
				order: 'asc',
			},
			axis: {
				x: {
					type: 'timeseries'
				},
				y: {
					label: 'number of edits'
				}
			},
			grid: {
				y: { show: true }
			}
		});

		var names = [];
		$.each(sites, function(name, api){
			datapoints(api, user, days, num, function(countData){
				chart.load({
					columns: [
						dates,
						[name].concat(convertCounts(countData))
					],
					done: function(){
						names.push(name);
						chart.groups([names]);
						window.setTimeout(function(){
							$('#savelink a').html('<a href-lang="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(($('<div/>').append($('svg', $(chart_path)).clone())).html()) + '" download="chart.svg">Save<a>');
						}, 1000);
					} 
				});
			});
		});
		$('#title .username').text(user);
		$('#title .days').text(days);
		document.title = $('#title').text();
    }


    var params = $.deparam(location.search.substr(1));
    var user = params['user'] || prompt('Username?');
    var days = parseInt(params['days']) || 30;
    var num  = parseInt(params['n'])    || 20;
    var sites = {
		commons: 'http://commons.wikimedia.org/w/api.php',
		meta: 'http://meta.wikimedia.org/w/api.php',
		wikidata: 'http://www.wikidata.org/w/api.php',
		mw: 'http://www.mediawiki.org/w/api.php',
		enwiki: 'http://en.wikipedia.org/w/api.php',
		jawiki: 'http://ja.wikipedia.org/w/api.php',
		jawikt: 'http://ja.wiktionary.org/w/api.php',
		enwikt: 'http://en.wiktionary.org/w/api.php',
		translatewiki: 'http://translatewiki.net/w/api.php',
    };

    draw(user, days, num, sites, '#chart');
});
