fw.directive("diabetesAtlas", function(list) {

	return {
		link: function linkFn (scope, el, attrs) {
			var isInited = false;
			var currentRegion = null;
			
			function onEnter (slideElement) {
				// isLoad = false;
				// if(!isInited){
				// 	onInit(slideElement);
				// 	isInited = true;
				// }
			}
			
			function onExit () {
							
			}
			
			scope.showRegionStats = function (event) {
				console.log('Show region stats');
				var button = event.target;
				if (currentRegion) {
					currentRegion.classList.remove('active');
				}
				currentRegion = button.parentElement;
				currentRegion.classList.add('active'); 
			}
							
			
			function onInit (slideElement) {
				// var regionsButtons = slideElement.getElementsByClassName('map-wrapper')[0].getElementsByTagName('button'),
				// 	blueFlag;
				// previousRegion = null;
				// regionsButtons.forEach(function(button){
				// 	button.addEventListener('click', function(){
				// 		if(previousRegion){
				// 			previousRegion.classList.remove('active');
				// 		}else{
				// 			blueFlag = slideElement.getElementsByClassName('blue-flag')[0];
				// 			blueFlag.classList.add('show');
				// 			setTimeout(function(){
				// 				blueFlag.addEventListener(touchy.events.start, goToProblem);
				// 			}, 10);
				// 		}
				// 		if(!isLoad){
				// 			isLoad = true;
				// 		}
				// 		button.parentElement.classList.add('active');
				// 		previousRegion = button.parentElement;
				          // ag.submit.data({
				          //   unique: true,
				          //   category: 'Regions',
				          //   categoryId: 'regions',
				          //   label: 'Region selected',
				          //   labedId: 'selected_region',
				          //   value: button.getAttribute('data-region'),
				          //   path: app.getPath()
				          // });
				// 	});
				// });
			}
			
			function goToProblem (event) {
				// touchy.stop(event);
				// app.goTo(app.slideshow.id, app.slideshow.currentIndex + 1);
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
