fw.register("diabetesAtlas", function(list) {

	return {
		link: function linkFn (scope, el, attrs) {
			var currentRegion = null;
			
			function onEnter (slideElement) {
			}
			
			function onExit () {
							
			}
			
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
				onEnter(el[0]);
			})
			
			scope.$on('exit:diabetes_atlas', function() {
				onExit(el[0]);
			})
			
		}
		
	}
});
