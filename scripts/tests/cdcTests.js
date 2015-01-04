(function(){
	"use strict";
	require.config({
		baseUrl: 'scripts',
		paths: {
			cdc: 'cdc'
		}
	});
	define(
		['cdc'],
		function(cdc) {
			var run = function() {
				test('genDates: 2 dates with a 2-day interval', function() {
					deepEqual(cdc.genDates(new Date(Date.UTC(2014, 3, 3)), 2, 2),
							  [
								  "2014-04-01T23:59:59",
								  "2014-04-03T23:59:59",
							  ]);
				});
			};
			return {run: run};
		}
	);
})();

