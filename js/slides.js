function SlidesCtrl($scope) {
  $scope.name = "Fireworks";

  console.log(Reveal);

    Reveal.addEventListener('slidechanged', function(event) {
      $scope.$apply(function() {
        $scope.slides.index = {h: event.indexh, v: event.indexv}
      // console.log(event);
      });
    });

  $scope.slides = {
    index: {h:0, v:0, f:0},
    slide: ""
  }


}