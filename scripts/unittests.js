require.config({
	baseUrl: 'scripts',
	paths: {
		'QUnit': 'http://code.jquery.com/qunit/qunit-1.16.0',
		'cdcTests': 'tests/cdcTests'
	},
	shim: {
	   'QUnit': {
		   exports: 'QUnit',
		   init: function() {
			   QUnit.config.autoload = false;
			   QUnit.config.autostart = false;
		   }
	   } 
	}
});
(function(url){
	var link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = url;
	document.getElementsByTagName('head')[0].appendChild(link);
})('http://code.jquery.com/qunit/qunit-1.16.0.css');


// require the unit tests.
require(
	['QUnit', 'cdcTests'],
	function(QUnit, cdcTests) {
		// run the tests.
		cdcTests.run();
		// start QUnit.
		QUnit.load();
		QUnit.start();
	}
);
