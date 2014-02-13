fw.directive("nrOfPatients", function(list) {

	return {
		// templateUrl: 'slides/templates/start.html',
		// replace: true,
		link: function linkFn (scope, el, attrs) {
		  	var handle = el[0].querySelector('#handle');
		  	var allMen = el[0].querySelectorAll('.cont-range div');
		  	var number = el[0].querySelector('.percentage-number');
		  	
		  	var currentNumber = 0;
		  	var activeMen = 0;
		  	var handle = new Draggy(handle, {restrictX: true, limitsY: [0, 300], onChange:moveHandle});
		  	
		  	function moveHandle (x,y) {
			  	currentNumber = Math.round(y/3);
			  	for(var y=0;y<40;y++){
				  	allMen[y].classList.remove('blue');
			  		// util.removeClass(slide.element.allMen[y],'blue');
			  	}
			  	if(activeMen <= currentNumber){
			  		for(var i=0;i<currentNumber;i++){
			  			number.innerHTML = currentNumber + '%';
			  			allMen[i].classList.add('active');
			  			// util.addClass(slide.element.allMen[i],'active');
			  		}
			  	}
			  	else{
			  		for(var i=currentNumber;i<activeMen;i++){
			  			number.innerHTML = currentNumber + '%';
			  			allMen[i].classList.remove('active');
			  			// util.removeClass(slide.element.allMen[i],'active');
			  		}
			  	}
			  	activeMen = currentNumber;
		  	}
		  	
		  	scope.showPatientsResult = function () {
				currentNumber = 40;
				handle.moveTo(0,120);
				
				for(var i=0;i<currentNumber;i++){
					if (!allMen[i].classList.contains('active')) {
						allMen[i].classList.add('blue');
					}
				}
				
				for(var y=40;y<100;y++){
					allMen[y].classList.remove('active');
				}
			
				number.innerHTML = currentNumber + '%';
				
				// scope.fw.next();
		  	
			}
			
		  	scope.$on('enter:diabetes_patients', function() {
			  	console.log(':: Entering: blue_urine'); 
			});
		 }
	}
});