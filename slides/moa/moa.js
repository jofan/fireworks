// angular.module('fireworks').directive("moa", function() {
	
fw.register('moa', function() {

  return {
	link: function linkFn (scope, el, attrs) {
	  var slideElement = el[0];
	  var fillWrapper, fillWrapperArea, fillWrapperNum, fillInterval, stepTimeout, pill, clock;
	  var defaultFillOptions = {
			value: 100,
			setValue: 0,
			interval: 30,
			stop: false
		},
		setOptions = function(options){
			var currentOptions = {}, i;
			for(i in defaultFillOptions){
				currentOptions[i] = defaultFillOptions[i];
			}
			if(options){
				for(i in options){
					currentOptions[i] = options[i];
				}
			}
			currentOptions.dir = currentOptions.value > currentOptions.setValue ? -1 : 1;
			return currentOptions;
		},
		allowTap, currentStep;
		
		var moaSlide = {

			onEnter:function(){
				console.log(":: Entering MoA slide");
				allowTap = false;
				currentStep = 1;
				if(!slideElement.isInit){
					slideElement.isInit = true;
					moaSlide.onInit(slideElement);
				}
				moaSlide.setStep(currentStep);
			},
			onInit:function(){
				var that = moaSlide;
				fillWrapper = slideElement.getElementsByClassName('fill-wrapper')[0];
				fillWrapperArea = fillWrapper.getElementsByClassName('fill')[0];
				fillWrapperNum = fillWrapper.getElementsByClassName('number')[0];
				pill = slideElement.getElementsByClassName('pill')[0];
				clock = slideElement.getElementsByClassName('clock')[0];
	
				slideElement.addEventListener(touchy.events.end, function(){
					if(allowTap){
						currentStep++;
						that.setStep(currentStep);
	          // ag.submit.event({
	          //   unique: true,
	          //   label: 'MoA step ' + currentStep + ' entered',
	          //   labelId: 'MoA_step_' + currentStep,
	          //   value: 'true',
	          //   valueType: 'boolean',
	          //   category: 'MoA',
	          //   categoryId: 'MoA'
	          // });
					}
				});
			},
			onExit:function(){
				moaSlide.setStep();
			},
			animateFill: function(options, callback){
				var currentOptions = setOptions(options),
					height = fillWrapperArea.offsetHeight,
					wrapperClass = 'fill-wrapper',
					setValue = function(){
						fillWrapperArea.style.webkitTransform = 'translate3d(0, ' + ((100 - currentOptions.value) * height / 100) + 'px, 0)';
						fillWrapperNum.innerHTML = currentOptions.value;
						setColor();
					},
					setColor = function(){
						if(currentOptions.value <= 100 && currentOptions.value > 66){
							fillWrapper.className = wrapperClass + ' green';
						}
						if(currentOptions.value <= 66 && currentOptions.value > 33){
							fillWrapper.className = wrapperClass + ' orange';
						}
						if(currentOptions.value <= 33 && currentOptions.value >= 0){
							fillWrapper.className = wrapperClass + ' red';
						}
					};
	
				clearInterval(fillInterval);
				setValue();
	
				if(!currentOptions.stop){
					fillInterval = setInterval(function(){
						currentOptions.value += currentOptions.dir;
						setValue();
						if(currentOptions.value === currentOptions.setValue){
							clearInterval(fillInterval);
							callback && callback();
						}
					}, currentOptions.interval);
				}
			},
			setStep: function(step){
				var that = moaSlide, options;
				clearTimeout(stepTimeout);
				pill.classList.remove('animate');
				clock.classList.remove('animate');
				switch(step){
					case 1:
						stepTimeout = setTimeout(function(){
							that.animateFill({}, function(){
								allowTap = true;
							});
						}, 1000);
						break;
					case 2:
						slideElement.classList.add('step' + step);
						setTimeout(function(){
							pill.classList.add('animate');
						}, 0);
						stepTimeout = setTimeout(function(){
							clock.classList.add('animate');
							that.animateFill({value: 0, setValue: 100, interval: 10}, function(){
								setTimeout(function(){
									that.animateFill({interval: 20}, function(){
										that.setStep(step);
									});
								}, 1000);
							});
						}, 1000);
						break;
					case 3:
						allowTap = false;
						options = {value: 0, setValue: 100, interval: 40, stop: true};
						that.animateFill(options);
						slideElement.classList.add('step' + step);
						setTimeout(function(){
							pill.classList.add('animate');
							options.stop = false;
						}, 0);
						stepTimeout = setTimeout(function(){
							clock.classList.add('animate');
							that.animateFill(options, function(){
								clock.classList.remove('animate');
							});
						}, 1000);
						break;
					default:
						currentStep = 1;
						slideElement.classList.remove('step2');
						slideElement.classList.remove('step3');
						that.animateFill({stop: true});
				}
			}
		}
		
		scope.$on('enter:moa', moaSlide.onEnter);
		scope.$on('exit:moa', moaSlide.onExit);
		
	}
  }
});
