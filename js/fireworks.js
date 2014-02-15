/**
 * Converts the target object to an array.
 */
function toArray( o ) {

    return Array.prototype.slice.call( o );

}

/**
 * Retrieves the height of the given element by looking
 * at the position and height of its immediate children.
 */
function getAbsoluteHeight( element ) {

    var height = 0;

    if( element ) {
        var absoluteChildren = 0;

        toArray( element.childNodes ).forEach( function( child ) {

            if( typeof child.offsetTop === 'number' && child.style ) {
                // Count # of abs children
                if( child.style.position === 'absolute' ) {
                    absoluteChildren += 1;
                }

                height = Math.max( height, child.offsetTop + child.offsetHeight );
            }

        } );

        // If there are no absolute children, use offsetHeight
        if( absoluteChildren === 0 ) {
            height = element.offsetHeight;
        }

    }

    return height;

}

var fw = angular.module('fireworks', ['ngTouch'])
  .config(function($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide)
  {
      // We need to reference this for lazy loading
      // http://ify.io/lazy-loading-in-angularjs/
      fw.registerCtrl       = $controllerProvider.register;
      fw.registerDirective  = $compileProvider.register;
      // fw.registerRoute      = $routeProvider.register;
      fw.registerFilter     = $filterProvider.register;
      fw.provide            = $provide;
      
      // $locationProvider.html5Mode(true);
      
  })
  
  .directive('fireworks', function($http, $location, list) {
      return {
          controller: function($scope) {
              
              // Could be replaced with a $scope.$watch for 'fw.current'
              function update() {
                  $location.path($scope.fw.current);
                  $scope.$emit('slidechange', list.getIndex());
              } 
              
              // PUBLIC API - available to views, e.g. in ng-click
              $scope.fw = {
                  config: {
                      center: true,
                      width: 960,
                      height: 700,
                      margin: 0.1,
                      minScale: 0.2,
                      maxScale: 1.0
                  },
                  current: "",
                  previous: "",
                  goto: function(slide) {
                      this.previous = list.get();
                      list.goTo(slide);
                      this.current = slide;
                      update();
                  },
                  next: function() {
                      this.previous = list.get();
                      list.next();
                      this.current = list.get();
                      update();
                  },
                  prev: function() {
                      this.previous = list.get();
                      list.previous();
                      this.current = list.get();
                      update();
                  },
                  left: function() {},
                  right: function() {},
                  up: function() {},
                  down: function() {}
              }
              
              // PRIVATE API - only available to directives requiring it
              this.readUrl = function() {
                  var path = $location.path().match(/\/(\w|-|_)+/g) || ["/"];
                  // TODO: allow more items in path, e.g. chapter/subchapter/slide
                  var slide = path[0].replace("/", "");
                  var previous = list.get();
                  
                  // Only update if URL is not the current slide displayed
                  if (slide && slide !== $scope.fw.current) {
                      // Check if slide exist in current list
                      if (list.getIndex(slide)) {
                          list.goTo(slide);
                          $scope.fw.previous = previous;
                          $scope.fw.current = slide;
                          
                          $scope.$emit('slidechange', list.getIndex());
                      }
                      // if not, then check if it exist as slide in model
                      // TODO: update with check if the slide exist
                      // else {
                      //     list.setList([slide]);
                      //     list.goTo(slide);
                      // }
                      // $scope.fw.previous = previous;
                      // $scope.fw.current = slide;
                      // 
                      // $scope.$emit('slidechange', list.getIndex());
                      
                  }
              }
              this.changeSlide = function() {
                  $scope.$emit('exit:' + $scope.fw.previous);
                  $scope.$emit('enter:' + $scope.fw.current);
              }
              this.sync = function() {
                  this.readUrl();
                  $scope.$emit('fw:sync');
              }
              this.ready = function() {
                  $scope.$emit('fw:ready');
              }
              
              $scope.$on('slidechange', this.changeSlide)
          },
          link: function linkFn(scope, el, attrs, ctrl) {
              var model = attrs.fireworks || "";
              var initialList = attrs.fwInit || null;
              var slides = [];

              el.addClass('reveal linear');
              
              // Check if any slides are hard-coded in index file
              var htmlSlides = el[0].querySelectorAll('.slides > section');
              // If we got hard-coded slides, they'll be prepended to the list set below
              // Slides without id will be ignored
              toArray(htmlSlides).forEach(function(sEl) {
                  if (sEl.id) slides.push(sEl.id);  
              });
              
                            
              if (/\.json$/.test(model)) {
                  // Read JSON file and get initial list from there
                  $http.get(model).success(function(data) {
                      scope.model = data;
                      // If the model defines the structures
                      if (data.structures) {
                          // If an initial list has been defined
                          if (initialList) {
                              if (data.structures[initialList]) {
                                  slides = slides.concat(data.structures[initialList].content);
                              }
                          }
                          // Open first item in storyboard
                          else if (data.storyboard) {
                              slides = slides.concat(data.structures[data.storyboard[0]].content);
                          }
                      }
                      // Try to set storyboard as list
                      else {
                          if (data.storyboard) slides = slides.concat(data.storyboard);
                      }
                      
                      list.setList(slides);
                      ctrl.ready();
                  })
              }
              else {
                  // We treat the string as a list of slides separated with comma or space
                  slides = model.replace(/,/g, ' ').replace("  ", " ").split(" ");
                  list.setList(slides);
                  scope.model = {
                      "structures": {
                          "presentation": {
                              "content": slides
                          }
                      },
                      "storyboard": ["presentation"]
                  }
                  ctrl.ready();
              }
              
          }
      }
  })
  
  .directive('fwSlides', function($compile, $window, $swipe, list) {
    return {
      require: "^fireworks",
      template: '<div class="slides"></div>',
      replace: true,
      link: function linkFn(scope, el, attrs, ctrl) {
        
        // Make sure we scale presentation if window size change
        $window.addEventListener( 'resize', layout, false );
        
        var slidesInDOM = [];
          
        // var x = null;
        // 
        // function testSwipeStart(coord) {
        //     x = coord.x;
        // }
        // 
        // function testSwipeEnd(coord) {
        //     $window.alert('Start: ' + x + ', End: ' + coord.x);
        // }
        // 
        // $swipe.bind(el, {start: testSwipeStart, end: testSwipeEnd});
          
        var parent = el.parent();
        
        // When we got our list, we need to insert some slides
        scope.$on('fw:ready', function() {
            var slides = list.getList();
            
            slides.forEach(function(slide, i) {
                addSlide(slide, i)
            });
            
            ctrl.sync();
            
        });
        
        scope.$on('fw:sync', function() {
            // Get slides
            layout();
            // Every time the URL updates, check if the slide should change
            
        });
        
        scope.$on('$locationChangeStart', function(event, path) {
            ctrl.readUrl();
        });
        
        function addSlide (slide, i) {
            var newSlide = document.createElement('section');
            newSlide.setAttribute('fw-template', slide);
            newSlide.setAttribute('slide-index', i);
            el[0].appendChild(newSlide);
            $compile(newSlide)(scope);
        }
        
        // Scale slides container according to config - from Reveal.js
        function layout () {
        
            // Available space to scale within
            var availableWidth = parent[0].offsetWidth,
                availableHeight = parent[0].offsetHeight;
                
            var scale = 1;
            
            // Reduce available space by margin
            availableWidth -= ( availableHeight * scope.fw.config.margin );
            availableHeight -= ( availableHeight * scope.fw.config.margin );
            
            // Dimensions of the content
            var slideWidth = scope.fw.config.width,
                slideHeight = scope.fw.config.height,
                slidePadding = 20; // TODO Dig this out of DOM
            
            // Slide width may be a percentage of available width
            if( typeof slideWidth === 'string' && /%$/.test( slideWidth ) ) {
                slideWidth = parseInt( slideWidth, 10 ) / 100 * availableWidth;
            }
            
            // Slide height may be a percentage of available height
            if( typeof slideHeight === 'string' && /%$/.test( slideHeight ) ) {
                slideHeight = parseInt( slideHeight, 10 ) / 100 * availableHeight;
            }
            
            el[0].style.width = slideWidth + 'px';
            el[0].style.height = slideHeight + 'px';
            
            // Determine scale of content to fit within available space
            scale = Math.min( availableWidth / slideWidth, availableHeight / slideHeight );
            
            // Respect max/min scale settings
            scale = Math.max( scale, scope.fw.config.minScale );
            scale = Math.min( scale, scope.fw.config.maxScale );
            
            // Prefer applying scale via zoom since Chrome blurs scaled content
            // with nested transforms
            if( typeof el[0].style.zoom !== 'undefined' && !navigator.userAgent.match( /(iphone|ipod|ipad|android)/gi ) ) {
                el[0].style.zoom = scale;
            }
            // Apply scale transform as a fallback
            else {
                // transformElement( el[0], 'translate(-50%, -50%) scale('+ scale +') translate(50%, 50%)' );
            }
        }
        
      }
    }
  })
  
  // For adding HTML that does not need JS
  .directive('fwTemplate', function($http, $compile, $location, $timeout, list) {
    return {
      require: '^fireworks',
      link: function linkFn(scope, el, attrs, ctrl) {
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
        $http.get('slides/' + template + '/' + template + '.html').success(function(html) {
          var slide = angular.element(html);
          $compile(slide)(scope);
          slide.addClass(classes.join(" "));
          el.replaceWith(slide);
          el = slide;
          updateSlide(list.getIndex());
          positionSlide();
          if (template === scope.fw.current) {
              scope.$emit('enter:' + scope.fw.current);
          }
        });
        
        function updateSlide (index) {
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
             } 
        }
        
        function positionSlide () {
            if( scope.fw.config.center ) {
                // Vertical stacks are not centred since their section
                // children will be
                if(el.hasClass('stack')) {
                    slide.style.top = 0;
                }
                else {
                    el[0].style.top = Math.max( - ( getAbsoluteHeight( el[0] ) / 2 ) - 20, -700 / 2 ) + 'px';
                } 
            }
            else {
                slide.style.top = '';
            }
        }
        
        scope.$on('slidechange', function(event, index) {
          // Change class if necessary
          updateSlide(index);
        });
        
      }
    }
  })
  
  .directive('fwProgress', function(list) {
      return {
          link: function linkFn(scope, el, attrs) {
              // Add the span element that acts as the indicator bar
              var barEl = angular.element('<span></span>');
              el.append(barEl);
              el.addClass('progress');
              // Using Reveal stylesheet, so make sure it displays
              el.css('display', 'block');
              
              function updateProgress (index) {
                  var index = index || list.getIndex();
                  var totalCount = list.getList().length; // TODO: replace with list.size()
                  var pastCount = index.h; // TODO: replace with flattened list
                  
                  barEl[0].style.width = ( pastCount / ( totalCount - 1 ) ) * window.innerWidth + 'px';
              }
              
              scope.$on('slidechange', function(event, index) {
                // Change class if necessary
                updateProgress(index);
              });
              
              scope.$on('fw:sync', function() {
                  updateProgress();
              })
              
              
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
              scope.$on('fw:sync', function() {
                  updateControls(list.getIndex());
              })
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
     
     // Return the next item available (down or right)
     function getNext () {
       // See if there is an item below to go to
       // else go to the next item to the right if available
       var downIndex = {h: current.h, v: current.v + 1};
       var rightIndex = {h: current.h + 1, v: 0};
       var itemBelow = get(downIndex.h, downIndex.v);
       var itemRight;
       if (itemBelow) {
         return downIndex
       }
       else {
         itemRight = get(rightIndex.h, 0);
         if (itemRight) return rightIndex;
       }
       return undefined;
     }
     
     // Should move vertically if possible
     function next () {
       var nextItem = getNext();
       if (nextItem) _set(nextItem);
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
      getNext: getNext,
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