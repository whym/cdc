"use strict";

// Load dependencies:
// The below is for demonstration, not intended for production use.
// Host the files below locally or use a CDN as needed.
require.config({
	baseUrl: 'scripts',
	paths: {
		jquery: 'https://code.jquery.com/jquery-2.1.3.min',
		cdc: 'cdc'
	}
});

require(['jquery', 'cdc'], function($, cdc) {
	// The function below is derived from <https://github.com/cowboy/jquery-bbq/blob/8e0064b/jquery.ba-bbq.js#L444>, reused under GPL. Copyright (c) 2010 "Cowboy" Ben Alman.
	(function(h){h.deparam=function(i,j){var d={},k={"true":!0,"false":!1,"null":null};h.each(i.replace(/\+/g," ").split("&"),function(i,l){var m;var a=l.split("="),c=decodeURIComponent(a[0]),g=d,f=0,b=c.split("]["),e=b.length-1;/\[/.test(b[0])&&/\]$/.test(b[e])?(b[e]=b[e].replace(/\]$/,""),b=b.shift().split("[").concat(b),e=b.length-1):e=0;if(2===a.length)if(a=decodeURIComponent(a[1]),j&&(a=a&&!isNaN(a)?+a:"undefined"===a?void 0:void 0!==k[a]?k[a]:a),e)for(;f<=e;f++)c=""===b[f]?g.length:b[f],m=g[c]=f<e?g[c]||(b[f+1]&&isNaN(b[f+1])?{}:[]):a,g=m;else h.isArray(d[c])?d[c].push(a):d[c]=void 0!==d[c]?[d[c],a]:a;else c&&(d[c]=j?void 0:"")});return d}})(jQuery);
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
	
	cdc.draw(user, days, num, sites, '#chart');
});
