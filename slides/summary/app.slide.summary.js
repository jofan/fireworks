(function(){
	'use strict';
	document.addEventListener('presentationInit', function(){
		["summary", "summary_2"].forEach(function(slideId){
			var patientsFuture,
				undiagnosedPercetage,
				undiagnosedPatients,
				budgetReduction,
				choice;
			app.slide[slideId] = {
				onEnter: function(slideElement){
					if(!slideElement.isInit){
						slideElement.isInit = true;
						this.onInit(slideElement);
					}
					patientsFuture.innerText = app.flow.data[app.flow.id].problems.patients_2030;
					undiagnosedPercetage.innerText = app.flow.data[app.flow.id].diabetes.undiagnosed;
					undiagnosedPatients.innerText = app.flow.data[app.flow.id].problems.patients_undiagnosed;
					choice.innerText = app.flow.data[app.flow.id].treatment_of_choice;
					if(budgetReduction){
						budgetReduction.innerText = parseSum( app.flow.data[app.flow.id].costs.budget_reduction );
					}
				},
				onExit: function(){
				},
				onInit: function(slideElement){
					patientsFuture = slideElement.getElementsByClassName('value-patients-future')[0],
					undiagnosedPercetage = slideElement.getElementsByClassName('value-undiagnosed-percetage')[0],
					undiagnosedPatients = slideElement.getElementsByClassName('value-undiagnosed-patients')[0],
					budgetReduction = slideElement.getElementsByClassName('value-budget-reduction')[0],
					choice = slideElement.getElementsByClassName('value-choice')[0];
				}
			};
		});
		function parseSum(sum){
			return sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		}
	});
})();
