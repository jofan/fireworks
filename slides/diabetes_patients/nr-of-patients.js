fw.register("nrOfPatients", function(list) {

	return {
		// templateUrl: 'slides/templates/start.html',
		// replace: true,
		link: function linkFn (scope, el, attrs) {
		  	var allMen = el[0].querySelectorAll('.cont-range div');
		  	var number = el[0].querySelector('.percentage-number');
		  	
		  	scope.currentNumber = 0;
		  	scope.activeMen = 0;
		  	
		  	scope.$on('change:patient-slider', moveHandle);
		  	
		  	function moveHandle (event, coords) {
			  	var y = coords[1];
			  	scope.currentNumber = Math.round(y/3);
			  	for(var y=0;y<40;y++){
				  	allMen[y].classList.remove('blue');
			  	}
			  	if(scope.activeMen <= scope.currentNumber){
			  		for(var i=0;i<scope.currentNumber;i++){
			  			number.innerHTML = scope.currentNumber + '%';
			  			allMen[i].classList.add('active');
			  		}
			  	}
			  	else{
			  		for(var i=scope.currentNumber;i<scope.activeMen;i++){
			  			number.innerHTML = scope.currentNumber + '%';
			  			allMen[i].classList.remove('active');
			  		}
			  	}
			  	scope.activeMen = scope.currentNumber;
		  	}
		  	
		  	scope.showPatientsResult = function () {
				scope.currentNumber = 40;
				scope.$broadcast('move:patient-slider', [0, 120]);
				
				for(var i=0;i<scope.currentNumber;i++){
					if (!allMen[i].classList.contains('active')) {
						allMen[i].classList.add('blue');
					}
				}
				
				for(var y=40;y<100;y++){
					allMen[y].classList.remove('active');
				}
			
				number.innerHTML = scope.currentNumber + '%';
				
				// scope.fw.next();
		  	
			}
			
			scope.$on('$destroy', function() {
				allMen = null;
				number = null;
				console.log("Removing diabetes_patients DOM");
			})
			
		  	scope.$on('enter:diabetes_patients', function() {
			  	console.log(':: Entering: blue_urine'); 
			});
			
			scope.$on('exit:diabetes_patients', function() {
			  	console.log(':: Exiting: blue_urine'); 
			});
		 }
	}
});