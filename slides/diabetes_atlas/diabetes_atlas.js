fw.register("diabetesAtlas", function(list) {

	return {
		link: function linkFn (scope, el, attrs) {
			var currentRegion = null;
			
			scope.showRegionStats = function (event) {
				var button = event.target;
				if (currentRegion) {
					currentRegion.classList.remove('active');
				}
				currentRegion = button.parentElement;
				currentRegion.classList.add('active'); 
			}
			
			scope.$on('enter:diabetes_atlas', function() {
				console.log(":: Entering: diabetes_atlas");
			})
			
			scope.$on('exit:diabetes_atlas', function() {
				currentRegion = null;
				console.log(":: Exiting: diabetes_atlas");
			})
			
		}
		
	}
});
