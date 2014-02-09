
var fw = angular.module('fireworks', ['ngRoute'])
  .config(function($locationProvider, $routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide)
  {
      fw.registerCtrl       = $controllerProvider.register;
      fw.registerDirective  = $compileProvider.register;
      fw.registerRoute      = $routeProvider.register;
      fw.registerFilter     = $filterProvider.register;
      fw.provide            = $provide;
      
      function setSlide ($q, $route) {
          var deferred = $q.defer();
          var slide = $route.current.params.slide || null;

          deferred.resolve(slide);
          
          return deferred.promise;
      }
  
      // Register routes with the $routeProvider
      // $routeProvider
      // .when('/', {
      //     controller: 'fwController',
      //     templateUrl: 'fireworks.html',
      //     resolve: {slide: setSlide}
      // })
      // .when('/:slide', {
      //    controller: 'fwController',
      //    templateUrl: 'fireworks.html',
      //    resolve: {slide: setSlide}
      // })
      // .otherwise({
      //     redirectTo: '/'
      // });
      
      // $locationProvider.html5Mode(true);
  })
  
  .controller('fwController', function($scope, list, $location) {
    
    // Demo
    // list.setList(['start', 'intro', 'heads-up']);
    
    var path = $location.path().match(/\/(\w|-|_)+/g) || ["/"];
    
    // TODO: allow more items in path, e.g. chapter/subchapter/slide
    var slide = path[0].replace("/", "");
    
    var slides = ['start', 'intro', 'heads-up', 'blue_urine'];
    list.setList(slides);
    
    if (slide) {
        list.goTo(slide);
    }
    
    $scope.fw = {
        goto: function(slide) {
            list.goTo(slide);
            $scope.$emit('slidechange', list.getIndex());
        },
        next: function() {
            list.next();
            $scope.$emit('slidechange', list.getIndex());
        },
        previous: function() {
            list.previous();
            $scope.$emit('slidechange', list.getIndex());
        }
    }
    
  })
  
  .directive('fireworks', function($compile, list) {
    return {
      controller: 'fwController',  
      link: function linkFn(scope, el, attrs) {
          
        el.addClass('slides');
          
        var slides = list.getList();
        
        slides.forEach(function(slide, i) {
            var newSlide = document.createElement('section');
            newSlide.setAttribute('fw-template', slide);
            newSlide.setAttribute('slide-index', i);
            el[0].appendChild(newSlide);
            $compile(newSlide)(scope);
        });
        
        scope.$on('$locationChangeStart', function(event, path) {
            console.log(path);
            var path = path.match(/#\/(\w|-|_)+/g) || ["/"];
            
            // TODO: allow more items in path, e.g. chapter/subchapter/slide
            var slide = path[0].replace("#/", "");
            console.log(slide);
        })
        
      }
    }
  })
  
  // For adding HTML that does not need JS
  .directive('fwTemplate', function($http, $compile, $location, list) {
    return {
      // templateUrl: 'slides/templates/heads-up.html',
      // replace:true,
      // scope: {},
      link: function linkFn(scope, el, attrs) {
        var template = attrs.fwTemplate;
        var slideIndexRaw = attrs.slideIndex; 
        var classes = [].slice.call(el[0].classList);
        var slideIndex;
        
        if (slideIndexRaw) {
            slideIndex = {h: slideIndexRaw, v:0}
        }
        else {
            slideIndex = list.getIndex(template);
        }
        
        scope[template] = {};
        // console.log(classes);
        $http.get('slides/templates/' + template + ".html").success(function(html) {
          var slide = angular.element(html);
          $compile(slide)(scope);
          slide.addClass(classes.join(" "));
          el.replaceWith(slide);
          el = slide;
          updateClass(list.getIndex());
        });
        
        function updateClass (index) {
            // If h index is smaller, then class should be 'past'
             if (index.h > slideIndex.h) {
                 el.removeClass("present future");
                 el.addClass("past");
             }
             // If h index is larger, then class should be 'future'
             else if (index.h < slideIndex.h) {
                 el.removeClass("present past");
                 el.addClass("future");
             }
             // If h index is same as current, check vertical index
             else {
                 el.removeClass("past future");
                 el.addClass("present");
                 $location.path(template);
                 el.triggerHandler('enter:' + template);
             } 
        }
        
        scope.$on('slidechange', function(event, index) {
          // Change class if necessary
          updateClass(index);
        });
        
        
        // console.log(attrs.fwTemplate);
      }
    }
  })
  
  .directive('fwControls', function(list) {
      return {
          templateUrl: 'controls.html',
          replace: true,
          link: function linkFn(scope, el, attrs) {
              var leftArrow = el.find('div').eq(0);
              var rightArrow = el.find('div').eq(1);
              var upArrow = el.find('div').eq(2);
              var downArrow = el.find('div').eq(3);
              
              function updateControls (index) {
                  var slides = list.getList();
                   if (index.h > -1 && index.h < slides.length - 1) {
                       rightArrow.addClass("enabled");
                   }
                   else {
                       rightArrow.removeClass("enabled");
                   }
                   if (index.h > 0 && index.h < slides.length) {
                       leftArrow.addClass("enabled");
                   }
                   else {
                       leftArrow.removeClass("enabled");
                   } 
              }
              scope.$on('slidechange', function(event, index) {
                  updateControls(index);
              });
              updateControls(list.getIndex());
          }
      }
  })
  
  .factory('list', function() {
    
    var current = {h:0, v:0};
    var list = [];
    
    function size () {
      return _.flatten(list, true).length;
    }
    
    /**
      * Retrieves the list item at provided index. Falls back to
      * providing current item if no index provided
      *
      * @param {Number} h If specified, the returned
      * list item will be for this horizontal index
      * rather than the current one
      *
      * @param {Number} v If specified, the returned
      * list item will be for this vertical index
      * rather than the current one
      *
      * @return {String} list item
      */
     function get (h, v) {
       var itemType;
       // Use current if no index provided
       if (h === undefined) {
         h = current.h;
         v = current.v;
       }
       v = v || 0;
       itemType = getType(h);
       if (itemType) {
         if (itemType === 'list') {
           return list[h][v];
         }
         // If v is not 0 or undefined
         else if (!v) {
           return list[h];
         }
       }
       return undefined;
     };
     
     function getIndex (item) {
       var h = list.indexOf(item);
       var index;
       if (item) {
         if (h > -1) {
           return {h: h, v: 0}
         }
         // Need to look in nested lists
         else {
           // TODO: improve loop so that we stop when we find it
           list.forEach(function(list, i) {
             if (typeof list !== 'string') {
               h = list.indexOf(item);
               if (h > -1) {
                 index = {h: i, v: h}
               }
             }
           });
           return index;
         } 
       }
       else {
         return current;
       }
       return undefined;
     };
     
     function getType (h) {
       // In range?
       if (h > -1 && h < list.length) {
         // TODO: improve type check
         if (typeof list[h] === 'string') {
           return "item";
         }
         else {
           return "list";
         }
       }
       return undefined;
     }
     
     // Check if there is an item at the provided indices
     function inRange (h) {
       if (h > -1 && h < list.length) {
         return true;
       }
       return false;
     };
     
     // PRIVATE
     function _set (index) {
       var previous = current;
       // Setting by name
       // if (typeof index === 'string') {
       //   index = getIndex(index);
       // }
       // if (index > -1 && index < list.length) {
         current = index;
       // }
       // 
     };
     
     function getList () {
         return list;
     }
     
     function setList (arr) {
       var current = current,
           previousList = list.slice();
       list = arr;
       if (!inRange(current)) {
         _set({h:0, v:0});
         current = 0;
       }
       // 
     };
     
     // TODO: properly handle non-existing strings
     function goTo (index) {
       // Setting by name
       if (typeof index === 'string') {
         index = getIndex(index);
       }
       index.h = index.h || 0;
       index.v = index.v || 0;
       if (get(index.h, index.v)) {
         _set(index);
       }
     }
     
     // Should only move horizontally
     function left () {
       var index = {h: current.h - 1, v: 0};
       if (get(index.h)) {
         _set(index);
       }
       
     };
     
     // Should only move horizontally
     function right () {
       var index = {h: current.h + 1, v: 0};
       if (get(index.h)) {
         _set(index);
       }
       
     };
     
     // Should only move vertically
     function down () {
       var index = {h: current.h, v: current.v + 1};
       if (get(index.h, index.v)) {
         _set(index);
       }
       
     };
     
     // Should only move vertically
     function up () {
       var index = {h: current.h, v: current.v - 1};
       if (get(index.h, index.v)) {
         _set(index);
       }
       
     };
     
     // Should move vertically if possible
     function next () {
       // See if there is an item below
       var downIndex = {h: current.h, v: current.v + 1};
       var rightIndex = {h: current.h + 1, v: 0};
       var itemBelow = get(downIndex.h, downIndex.v);
       var itemRight;
       if (itemBelow) {
         _set(downIndex);
       }
       else {
         itemRight = get(rightIndex.h, 0);
         if (itemRight) _set(rightIndex);
       }
       
     };
     
     // Should move vertically if possible
     function previous () {
       // See if there is an item above
       var upIndex = {h: current.h, v: current.v - 1};
       var leftIndex = {h: current.h - 1, v: 0};
       var itemAbove = get(upIndex.h, upIndex.v);
       var itemLeft, leftType;
     
       if (itemAbove) {
         _set(upIndex);
       }
       else {
         // See if previous item is a list or a string
         leftType = getType(leftIndex.h);
         console.log(leftType);
         if (leftType === 'item') {
           _set(leftIndex);
         }
         else if (leftType === 'list') {
           // Find last item in list
           leftIndex.v = list[leftIndex.h].length - 1;
           _set(leftIndex);
         }
       }
     
       
     };
     
     function gotoFirst () {
       _set({h:0, v:0});
     };
     
     // TODO: make this actually go to last if nested array
     function gotoLast () {
       _set({h:list.length - 1, v:0});
     };
     
     function append (item) {
       var previous = list.slice();
       list.push(item);
     };
     
     function prepend (item) {
       var previous = list.slice();
       list.unshift(item);
       current += 1;
     };
     
     function insert (item, index) {
       var previous = get(index.h, index.v);
       var prevType = getType(index.h);
     
       if (prevType === 'item') {
         list.splice(index.h, 0, item);
       }
       else if (prevType === 'list' && typeof item === 'string') {
         list[index.h].splice(index.v, 0, item);
       }
     };
     
     function replace (index, item) {
       var previous;
       var prevType;
     
       if (typeof index === 'string') {
         previous = index;
         index = getIndex(index);
       }
       else {
         previous = get(index.h, index.v);
       }
     
       prevType = getType(index.h); 
     
       if (prevType === 'list' && typeof item === 'string') {
         // Replace single item in nested list
         list[index.h].splice(index.v, 1, item);
       }
       else if (prevType === 'item' || prevType === 'list') {
         // Replace entire nested list or string item
         list.splice(index.h, 1, item);
       }
     };
     
     function remove (index) {
       var previous;
       var prevType;
     
       if (typeof index === 'string') {
         previous = index;
         index = getIndex(index);
       }
       else {
         previous = get(index.h, index.v);
       }
     
       prevType = getType(index.h);
     
       if (prevType === 'list' && index.v !== undefined) {
         // Replace single item in nested list
         list[index.h].splice(index.v, 1);
       }
       else if (prevType === 'item' || prevType === 'list') {
         // Replace entire nested list or string item
         list.splice(index.h, 1);
       }
     };
     
     function move (from, to) {
       var item, itemAtIndex, itemType, locationType;
     
       if (typeof from === 'string') {
         item = from;
         from = getIndex(from);
       }
       else {
         item = get(from.h, from.v);
       }
     
       if (typeof to === 'string') {
         itemAtIndex = to;
         to = getIndex(to);
       }
       else {
         itemAtIndex = get(to.h, to.v);
       }
     
       itemType = getType(from.h);
       locationType = getType(to.h);
     
       if (itemType === 'item' && locationType === 'item') {
         // Move single item to single item location
         if (from.h < to.h) to.h = to.h - 1; // Make sure location index is correct after removing item
         list.splice(from.h, 1);
         list.splice(to.h, 0, item);
       }
       else if (itemType === 'item' && locationType === 'list') {
         if (to.v !== undefined) {
           // Move single item into nested list
           if (from.h < to.h) to.h = to.h - 1; // Make sure location index is correct after removing item
           list.splice(from.h, 1);
           list[to.h].splice(to.v, 0, item);
         }
         else {
           // Move single item to nested list location
           if (from.h < to.h) to.h = to.h - 1; // Make sure location index is correct after removing item
           list.splice(from.h, 1);
           list.splice(to.h, 0, item);
         }
       }
       else if (itemType === 'list' && locationType === 'item') {
         if (from.v !== undefined) {
           // Move item in nested list to single item location
           // TODO: check if item is the only one in nested list, if so nested list should be removed
           list[from.h].splice(from.v, 1);
           list.splice(to.h, 0, item);
         } 
         else {
           // Move nested list to single item location
           if (from.h < to.h) to.h = to.h - 1; // Make sure location index is correct after removing item
           list.splice(from.h, 1);
           list.splice(to.h, 0, item);
         }
       }
       else if (itemType === 'list' && locationType === 'list') {
         if (to.v !== undefined && from.v !== undefined) {
           // Move item in nested list into a nested list
           // TODO: check if item is the only one in nested list, if so nested list should be removed
           if (from.h === to.h && from.v < to.v) to.v = to.v - 1;
           list[from.h].splice(from.v, 1);
           list[to.h].splice(to.v, 0, item);
         }
         else if (to.v === undefined && from.v === undefined) {
           // Move nested list to nested list location
           if (from.h < to.h) to.h = to.h - 1; // Make sure location index is correct after removing item
           list.splice(from.h, 1);
           list.splice(to.h, 0, item);
         }
         else if (to.v === undefined && from.v !== undefined) {
           // Move item in nested list to nested list location
           // TODO: check if item is the only one in nested list, if so nested list should be removed
           list[from.h].splice(from.v, 1);
           list.splice(to.h, 0, item);
         }
       }
     }; 
    
    return {
      get: get,
      getIndex: getIndex,
      getList: getList,
      setList: setList,
      goTo: goTo,
      left: left,
      right: right,
      up: up,
      down: down,
      next: next,
      previous: previous,
      gotoFirst: gotoFirst,
      gotoLast: gotoLast,
      append: append,
      prepend: prepend,
      replace: replace,
      remove: remove,
      move: move,
      size: size
    }
  });
  
fw.ready = function(fn) {
  setTimeout(function() {
    fn()
  },100);
}