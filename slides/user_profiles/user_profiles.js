fw.register('user_profiles', function() {
	return {
		link: function linkFn(scope, el, attrs) {
			var slideElement = el[0];
			
			scope.$on('enter:user_profiles', function() {
				setProfile(slideElement);
			});
			
			function setProfile () {
				var patientCase = '';
			      if (app.flow.data[app.flow.id]) {
			        patientCase = app.flow.data[app.flow.id].goToPatientCase;
			      }
				if(currentCase){
					slideElement.classList.remove('state' + currentCase);
				}
				currentCase = patientCase.num ? patientCase.num : 1;
				slideElement.classList.add('state' + currentCase);
			}
		}
	}
});