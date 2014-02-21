
fw.register('intro', function(list) {
    return {
      // templateUrl: 'slides/templates/intro.html',
      // replace:true,
      // scope: {},
      link: function linkFn(scope, el, attrs) {
        scope.test = "No";
        scope.name = "Introduction"
        
        scope.$on('enter:intro', function(event) {
          console.log(':: Entering: intro');
        });
        
        scope.$on('exit:intro', function(event) {
          console.log(':: Exiting: intro');
        })
      }
    }
  })