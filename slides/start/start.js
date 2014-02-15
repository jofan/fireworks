angular.module('fireworks').directive("epidemicGraph", function() {

  var clickCounter = 0, countUpInterval;

  return {
    // templateUrl: 'slides/templates/start.html',
    // replace: true,
    // scope: {},
    link: function linkFn (scope, el, attrs) {
      var slideElement = el[0];
      function onEnter () {
        var redBulletNumber = slideElement.getElementsByClassName('patients-count')[0],
          currentCountOfPatients = 285,
          rightNumberGraphsAnimation = function(){
            var maxCount = 439;
            clickCounter++;
            slideElement.classList.add('step-' + clickCounter);
            if(clickCounter === 2){
              slideElement.removeEventListener('click', rightNumberGraphsAnimation);
              setTimeout(function(){
                countUpInterval = setInterval(function(){
                  redBulletNumber.innerHTML = currentCountOfPatients;
                  currentCountOfPatients++;
                  if(currentCountOfPatients > maxCount){
                    clearInterval(countUpInterval);
                  }
                }, 15);
              }, 500);
            }
          };
        redBulletNumber.innerHTML = currentCountOfPatients;
        slideElement.addEventListener('click', rightNumberGraphsAnimation);
        // rightNumberGraphsAnimation();

      }

      function onExit() {
        clickCounter = 0;
        slideElement.classList.remove('step-1');
        slideElement.classList.remove('step-2');
        clearInterval(countUpInterval);
      }
      
      scope.$on('enter:start', function() {
        console.log(':: Entering start');
        onEnter();
      });
      
      scope.$on('exit:start', function() {
        console.log(':: Exiting start');
        onExit();
      })
      
    }
  }
});