
fw.directive('intro', function(list) {
    return {
      // templateUrl: 'slides/templates/intro.html',
      // replace:true,
      // scope: {},
      link: function linkFn(scope, el, attrs) {
        scope.test = "No";
        scope.name = "Introduction"
        
        el.on('enter:intro', function(event) {
          console.log('Calling intro.onEnter');
          console.log('Entered intro slide');
        });
      }
    }
  })