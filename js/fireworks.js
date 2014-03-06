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

var fw = angular.module('fireworks', ['ngTouch', 'ngDraggy'])
  .config(function($locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide)
  {
      // We need to reference this for lazy loading
      // http://ify.io/lazy-loading-in-angularjs/
      fw.registerController = $controllerProvider.register;
      fw.register           = $compileProvider.directive;
      fw.registerFilter     = $filterProvider.register;
      fw.provide            = $provide;
      
  })
  
  .directive('fireworks', function($http, $location, list) {
      return {
          controller: function($document, $rootScope, $scope, $timeout) {
              
              // Could be replaced with a $scope.$watch for 'fw.current'
              function update() {
                  $location.path($scope.fw.current);
              } 
              
              // PUBLIC API - available to views, e.g. in ng-click
              $scope.fw = {
                  config: {
                      center: true,
                      width: 1024,
                      height: 700,
                      margin: 0.1,
                      minScale: 0.2,
                      maxScale: 1.0
                  },
                  current: "",
                  previous: "",
                  isPaused: false,
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
                  left: function() {
                      this.previous = list.get();
                      list.left();
                      this.current = list.get();
                      update();
                  },
                  right: function() {
                      this.previous = list.get();
                      list.right();
                      this.current = list.get();
                      update();
                  },
                  up: function() {
                      this.previous = list.get();
                      list.up();
                      this.current = list.get();
                      update();
                  },
                  down: function() {
                      this.previous = list.get();
                      list.down();
                      this.current = list.get();
                      update();
                  },
                  first: function() {
                      this.previous = list.get();
                      list.gotoFirst();
                      this.current = list.get();
                      update();
                  },
                  last: function() {
                      this.previous = list.get();
                      list.gotoLast();
                      this.current = list.get();
                      update();
                  },
                  togglePause: function() {
                      if( this.isPaused ) {
                          $rootScope.$broadcast('pause:resume');
                          this.isPaused = false;
                      }
                      else {
                          $rootScope.$broadcast('pause:enter');
                          this.isPaused = true;
                      }
                  },
                  fullScreen: function() {
                      // From RevealJS
                      var element = document.body;
                      
                      // Check which implementation is available
                      var requestMethod = element.requestFullScreen ||
                                          element.webkitRequestFullscreen ||
                                          element.webkitRequestFullScreen ||
                                          element.mozRequestFullScreen ||
                                          element.msRequestFullScreen;
                      
                      if( requestMethod ) {
                          requestMethod.apply( element );
                      }
                  }
              }
              
              // Document keypress
              $document.on('keydown', function(event) {
                  // From RevealJS
                  // Check if there's a focused element that could be using
                  // the keyboard
                  var activeElement = document.activeElement;
                  var hasFocus = !!( document.activeElement && ( document.activeElement.type || document.activeElement.href || document.activeElement.contentEditable !== 'inherit' ) );
                  
                  // Disregard the event if there's a focused element or a
                  // keyboard modifier key is present
                  if( hasFocus || (event.shiftKey && event.keyCode !== 32) || event.altKey || event.ctrlKey || event.metaKey ) return;
                  
                  // While paused only allow "unpausing" keyboard events (b and .)
                  if( $scope.fw.isPaused && [66,190,191].indexOf( event.keyCode ) === -1 ) {
                      return false;
                  }
                  
                  var triggered = false;
                  
                  // // 1. User defined key bindings
                  // if( typeof config.keyboard === 'object' ) {
                  // 
                  //     for( var key in config.keyboard ) {
                  // 
                  //         // Check if this binding matches the pressed key
                  //         if( parseInt( key, 10 ) === event.keyCode ) {
                  // 
                  //             var value = config.keyboard[ key ];
                  // 
                  //             // Callback function
                  //             if( typeof value === 'function' ) {
                  //                 value.apply( null, [ event ] );
                  //             }
                  //             // String shortcuts to reveal.js API
                  //             else if( typeof value === 'string' && typeof Reveal[ value ] === 'function' ) {
                  //                 Reveal[ value ].call();
                  //             }
                  // 
                  //             triggered = true;
                  // 
                  //         }
                  // 
                  //     }
                  // 
                  // }
                  
                  // 2. System defined key bindings
                  if( triggered === false ) {
                  
                      // Assume true and try to prove false
                      triggered = true;
                      
                      $scope.$apply(function() {
                          switch( event.keyCode ) {
                              // p, page up
                              case 80: case 33: $scope.fw.prev(); break;
                              // n, page down
                              case 78: case 34: $scope.fw.next(); break;
                              // h, left
                              case 72: case 37: $scope.fw.left(); break;
                              // l, right
                              case 76: case 39: $scope.fw.right(); break;
                              // k, up
                              case 75: case 38: $scope.fw.up(); break;
                              // j, down
                              case 74: case 40: $scope.fw.down(); break;
                              // home
                              case 36: $scope.fw.first(); break;
                              // end
                              case 35: $scope.fw.last(); break;
                              // space
                              case 32: event.shiftKey ? $scope.fw.prev() : $scope.fw.next(); break;
                              // return
                              // case 13: isOverview() ? deactivateOverview() : triggered = false; break;
                              // b, period, Logitech presenter tools "black screen" button
                              case 66: case 190: case 191: $scope.fw.togglePause(); break;
                              // f
                              case 70: $scope.fw.fullScreen(); break;
                              default:
                                  triggered = false;
                          }
                      });
                  
                      
                  
                  }
                  
                  // If the input resulted in a triggered action we should prevent
                  // the browsers default behavior
                  if( triggered ) {
                      event.preventDefault();
                  }
              })
              
              // PRIVATE API - only available to directives requiring it
              this.readUrl = function() {
                  var slide,chapter;
                  var path = $location.path()
                  var items = path.match(/\/(\w|-|_)+/g) || ["/"];
                  var previous = list.get();
                  
                  // If the path is match to item in current list, go there
                  if (list.getIndex(path)) {
                      list.goTo(path);
                      $scope.fw.previous = previous;
                      $scope.fw.current = path;
                      return;
                  }
                  
                  // TODO: allow more items in path, e.g. chapter/subchapter/slide
                  if (items.length === 2) {
                      slide = items[1].replace("/", "");
                      chapter = items[0].replace("/", "");
                  }
                  else {
                      slide = items[items.length - 1].replace("/", "");
                  }
                  
                  if (chapter) {
                      if (chapter === 'slide') {
                          if ($scope.model.slides[slide]) {
                             list.setList([slide]);
                             list.goTo(slide);
                             $scope.fw.previous = previous;
                             $scope.fw.current = slide;
                          }
                      }
                      if ($scope.model.structures[chapter]) {
                          list.setList($scope.model.structures[chapter].content);
                      }
                  }
                  
                  if (slide) {
                      // Only update if URL is not the current slide displayed
                      if (slide !== $scope.fw.current) {
                          // Check if slide exist in current list
                          if (list.getIndex(slide)) {
                              list.goTo(slide);
                              $scope.fw.previous = previous;
                              $scope.fw.current = slide;
                          }
                          // if not, then check if it exist as slide in model
                          // TODO: update with check if the slide exist
                          else {
                             // Open an individual slide
                             if ($scope.model.slides[slide]) {
                                list.setList([slide]);
                                list.goTo(slide);
                                $scope.fw.previous = previous;
                                $scope.fw.current = slide;
                             }
                             // open a new list
                             else if ($scope.model.structures[slide]) {
                                 list.setList($scope.model.structures[slide].content);
                                 list.gotoFirst();
                                 $scope.fw.previous = previous;
                                 $scope.fw.current = list.get();
                             }
                          }
                      }
                      
                  }
                  else {
                      // If no slide in URL then we set the first in list
                      list.gotoFirst();
                      $scope.fw.current = list.get();
                  }
              }
              this.changeSlide = function() {
                  $rootScope.$broadcast('exit:' + $scope.fw.previous);
                  $rootScope.$broadcast('enter:' + $scope.fw.current);
              }
              this.sync = function() {
                  this.readUrl();
                  $rootScope.$broadcast('fw:sync');
              }
              this.ready = function() {
                  $timeout(function() {
                    $scope.$emit('fw:ready');
                  }, 100); // Make sure plugin listeners have time to register
              }
              
              $scope.$on('slidechange', this.changeSlide)
          },
          link: function linkFn(scope, el, attrs, ctrl) {
              var model = attrs.fireworks || "presentation.json";
              var initialList = attrs.fwInit || null;
              var slides = [];
              var transition = attrs.transition || 'default';
              

              el.addClass('reveal ' + transition);
              
                            
              if (/\.json$/.test(model)) {
                  // Read JSON file and get initial list from there
                  $http.get(model).success(function(data) {
                      data.slides = data.components|| null; // Null means we will try to load CSS and JS automatically
                      data.structures = data.structures || null;
                      data.storyboard = data.storyboard || [];
                      
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
                      "components": null,
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
  
  .directive('fwSlides', function($rootScope, $compile, $window, $swipe, $timeout, $templateCache, list) {
    return {
      require: "^fireworks",
      // template: '<div class="slides"></div>',
      // replace: true,
      link: function linkFn(scope, el, attrs, ctrl) {
        scope.pathToSlides = attrs.path || 'slides/<id>/';
        
        el[0].removeAttribute('fw-slides');
        
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
        // Check if any slides are hard-coded in index file
        var htmlSlides = el[0].querySelectorAll('section');
        
        // When we got our list, we need to insert some slides
        scope.$on('fw:ready', function() {
            var slides = list.getList();
            
            if (htmlSlides.length > 0) {
                
                // Create empty list to display the inline slides
                list.setList([]);
            
                // If we got hard-coded slides, they'll be the initial list by default
                toArray(htmlSlides).reverse().forEach(function(sEl, i) {
                    var slidePath = null;
                    // var index = null;
                    var id = sEl.id || "slide_" + (i + 1); // Start from 1
                        // index = list.getIndex(sEl.id);
                        slidePath = scope.pathToSlides.replace(/<id>/g, id);
                        
                        list.prepend(id);
                        
                        // Put the HTML in cache
                        var wrap = document.createElement('div');
                        wrap.appendChild(sEl.cloneNode(true));
                        $templateCache.put(slidePath + id + ".html", wrap.innerHTML);
                        
                        // if (i === htmlSlides.length - 1) {
                        //     console.log('Present:', id);
                        //     sEl.classList.add('present');
                        // }
                        // else {
                        //     sEl.classList.add('future');
                        // }
                        
                        // if (index) {
                            // sEl.setAttribute('slide-index', index.h + ' ' + index.v);
                            sEl.setAttribute('fw-slide', id);
                            sEl.setAttribute('fw-template', id);
                            
                            slidesInDOM.push(id);
                        // }
                        // Remove from DOM if not in current list
                });
                            $compile(el)(scope);
            }
            
            // Every time the URL updates, check if the slide should change
            scope.$on('$locationChangeStart', function(event, path) {
                ctrl.sync();
            });
            
            ctrl.sync();
            
        });
        
        $rootScope.$on('remove:slide', function(event, id) {
          var loc = slidesInDOM.indexOf(id);
          if (loc !== -1) slidesInDOM.splice(loc, 1);
          console.log('Removed slide: ' + id, slidesInDOM);
        });
        
        // At this point the list have been updated to reflect the latest state
        scope.$watch('fw.current', function() {
            var slideIndex, rightSlide, leftSlide, upSlide, downSlide;
            if (scope.fw.current) {
                slideIndex = list.getIndex();
                rightSlide = list.get(slideIndex.h + 1, 0);
                leftSlide = list.get(slideIndex.h - 1, 0);
                upSlide = list.get(slideIndex.h, slideIndex.v - 1);
                downSlide = list.get(slideIndex.h, slideIndex.v + 1);
                // Check if this slide is in the DOM
                if (slidesInDOM.indexOf(scope.fw.current) === -1) {
                    addSlide(scope.fw.current, list.getIndex());
                }
                // Slide to the right
                if (rightSlide) {
                   if (slidesInDOM.indexOf(rightSlide) === -1) {
                       addSlide(rightSlide, {h: slideIndex.h + 1, v: 0});
                   }
                }
                if (leftSlide) {
                   if (slidesInDOM.indexOf(leftSlide) === -1) {
                       addSlide(leftSlide, {h: slideIndex.h - 1, v: 0});
                   }
                }
                if (upSlide) {
                   if (slidesInDOM.indexOf(upSlide) === -1) {
                       addSlide(upSlide, {h: slideIndex.h, v: slideIndex.v - 1});
                   }
                }
                if (downSlide) {
                   if (slidesInDOM.indexOf(downSlide) === -1) {
                       addSlide(downSlide, {h: slideIndex.h, v: slideIndex.v + 1});
                   }
                }
                // $timeout(function() {
                    $rootScope.$broadcast('slidechange', list.getIndex());
                // },50);
            }
        });
        
        // Find out what slides we need to have in DOM
        // and add the ones we don't
        scope.$on('fw:sync', function() {
            // Get slides that are in range now
            layout();
        });
        
        function getType (slide) {
            if ((/\.jpeg|jpg|png|gif$/i).test(slide)) {
              return 'image';
            }
            else if ((/\.pdf$/i).test(slide)) {
              return 'doc';
            }
            else if ((/\.mp4|mpeg|wmf$/i).test(slide)) {
              return 'video';
            }
            else if ((/^http:|https:/i).test(slide)) {
              return 'url';
            }
            return 'template'
        }
        
        function getDependencies(deps) {
            var allFiles = [];
            deps.forEach(function(name) {
               var component = scope.model.components[name] || null;
               var files = [];
               if (component) {
                   if (component.dependencies) allFiles.concat(getDependencies(component.dependencies));
                   if (component.files) {
                       component.files.scripts = component.files.scripts || [];
                       component.files.styles = component.files.styles || [];
                       files = files.concat(component.files.scripts);
                       files = files.concat(component.files.styles);
                   }
               }
                allFiles = allFiles.concat(files);
            });
            return allFiles;
        }
        
        function createElement (slide, i, template) {
            var newSlide = document.createElement('section');
            var type = getType(slide);
            var path = type === 'template' ? template : slide; 
            newSlide.setAttribute('fw-' + type, path);
            newSlide.setAttribute('fw-slide', slide);
            newSlide.setAttribute('slide-index', i.h + ' ' + i.v);
            newSlide.classList.add('future');
            if (i.v > 0) newSlide.classList.add('stack');
            el[0].appendChild(newSlide);
            $compile(newSlide)(scope);
            slidesInDOM.push(slide);  
            newSlide = null;
        }
        
        // See if there are any CSS or JS dependecies and load those first
        function addSlide (slide, i) {
            var data;
            var files = [];
            var templates;
            var pathToFiles = scope.pathToSlides.replace(/<id>/g, slide);
            var pathToTemplate = pathToFiles + slide + '.html';
            // Do we have a slide id or path to template?
            // If model.slides is defined, then dependencies are expected to be defined per slide
            if (scope.model.slides && scope.model.slides[slide]) {
                data = scope.model.slides[slide] || {};
                if (data.files) {
                    
                    // Get any dependencies
                    if (data.dependencies) files = getDependencies(data.dependencies);
                    
                    // Load slide files
                    templates = data.files.templates || [pathToTemplate];
                    data.files.scripts = data.files.scripts || [];
                    data.files.styles = data.files.styles || [];
                    files = files.concat(data.files.scripts);
                    files = files.concat(data.files.styles);
                    
                    // Load any css or js files
                    if (files.length > 0) {
                      head.load(files, function() {
                         createElement(slide, i, templates[0]); 
                      });
                    }
                    else {
                      createElement(slide, i, pathToTemplate);
                    }
                    
                }
                else {
                    createElement(slide, i, pathToTemplate); 
                }
            }
            // If model.slides is undefined, then we try to load one CSS and one JS file per slide
            else {
                files.push(pathToFiles + slide + '.js');
                files.push(pathToFiles + slide + '.css');
                head.load(files, function() {
                    createElement(slide, i, pathToTemplate); 
                }); 
            }
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
                $rootScope.$broadcast('layout:scale', scale);
            }
            // Apply scale transform as a fallback
            else {
                // transformElement( el[0], 'translate(-50%, -50%) scale('+ scale +') translate(50%, 50%)' );
            }
        }
        
      }
    }
  })
  
  .directive('fwStack', function(list) {
      return {
          template: '<section class="stack"></section>',
          replace: true,
          link: function linkFn(scope, el, attrs) {
              var index = attrs.slideIndex.split(" ");
              var slides = list.getList()[index[0]];
          }
      }
  })
  
  // Everything is a slide
  // From here we will find what type of template to load
  .directive('fwSlide', function($rootScope, $timeout, list) {
      return {
          scope: true,
          controller: function($scope) {
              var timeToRemove = null;
              
              var slideId = null
              var slideIndex = null;
              var slideEl = null;
              
              this.setId = function(id) {
                  slideId = id;
                  $scope.slideId = id;
              }
              
              this.setIndex = function(index) {
                  slideIndex = index;
              }
              
              // Keep a local reference to the slide element
              // Directives requiring this controller can replace the element
              this.setElement = function(el) {
                  slideEl = el;
              }
              
              this.updateSlide = function(index) {
                  if (list.get() === slideId) {
                      if (timeToRemove) {
                          $timeout.cancel(timeToRemove);
                          timeToRemove = null;
                      }
                      slideEl.removeClass("past future");
                      slideEl.addClass("present");
                  }
                  // If h index is larger, then class should be 'future'
                  else if (index.h < slideIndex.h) {
                      if (!timeToRemove) this.removeSlide();
                      slideEl.removeClass("present past");
                      slideEl.addClass("future");
                  }
                  // 
                  else if (index.h === slideIndex.h && index.v < slideIndex.v) {
                      if (!timeToRemove) this.removeSlide();
                      slideEl.removeClass("present past");
                      slideEl.addClass("future");
                  }
                  // If h index is smaller, then class should be 'past'
                  else {
                      if (!timeToRemove) this.removeSlide();
                      slideEl.removeClass("present future");
                      slideEl.addClass("past");
                  }
                  // Add 'stack' class if it's a nested slide
                  if (index.h === slideIndex.h && (index.v > 0 || slideIndex.v > 0)) {
                      slideEl.addClass('stack');
                  }
                  // Remove 'stack' class when it's not current stack
                  else if (slideIndex.v === 0 || index.h !== slideIndex.h) {
                      slideEl.removeClass('stack');
                  }
              }
              
              this.removeSlide = function() {
                  timeToRemove = $timeout(function() {
                      // Check to make sure we're not an immediate neighbor
                      var cIndex = list.getIndex();
                      var hIndex = parseInt(slideIndex.h, 10);
                      // cIndex = 5 -> hIndex = 3, hIndex = 7
                      if (hIndex < (cIndex.h - 2) || hIndex > (cIndex.h + 2)) {
                      // if (cIndex.h !== hIndex && (hIndex - 1) !== cIndex.h && (hIndex + 1) !== cIndex.h) {
                          $timeout.cancel(timeToRemove);
                          $scope.$destroy();
                          slideEl.remove();
                          $rootScope.$broadcast('remove:slide', slideId);
                      }
                      else {
                          $timeout.cancel(timeToRemove);
                          timeToRemove = null;
                      }
                      // TODO: add check for verticals if current and this index is same
                  },30000);
              }
              
              // param el - Angular element
              this.positionSlide = function(el) {
                  if( $scope.fw.config.center ) {
                      // Vertical stacks are not centred since their section
                      // children will be
                      if(slideEl.hasClass('stacky')) {
                          slideEl[0].style.top = 0;
                      }
                      else {
                          slideEl[0].style.top = Math.max( - ( getAbsoluteHeight( slideEl[0] ) / 2 ) - 20, - $scope.fw.config.height / 2 ) + 'px';
                      } 
                  }
                  else {
                      slideEl[0].style.top = '';
                  }
              }
              
              $scope.$on('$destroy', function() {
                 $timeout.cancel(timeToRemove); 
              });
              
          },
          link: function linkFn (scope, el, attrs, ctrl) {
              
              // NOTE: will not necessarily have access to 'el' in here
              
              var slideId = attrs.fwSlide;
              var slideIndexRaw = attrs.slideIndex;
              var slideIndex = null;
              
              ctrl.setId(slideId);
              ctrl.setElement(el);
              
              // Make sure we have the correct slide index
              // This allow same id to be used multiple times in a list
              if (slideIndexRaw) {
                  slideIndexRaw = slideIndexRaw.split(' ');
                  slideIndex = {h: parseInt(slideIndexRaw[0], 10), v: parseInt(slideIndexRaw[1], 10) || 0};
                  ctrl.setIndex(slideIndex);
              }
              else {
                  ctrl.setIndex(list.getIndex(slideId));
              }
              
              // Let any other slide directives know that they can alter the element
              scope.$emit('slide:ready', slideId);
              
              scope.$on('slidechange', function(event, index) {
                ctrl.updateSlide(index);
              });
              
          }
      }
  })
  
  // For adding HTML that does not need JS
  .directive('fwTemplate', function($rootScope, $http, $compile, $location, $timeout, $templateCache, list) {
    return {
      require: 'fwSlide',
      link: function linkFn(scope, el, attrs, slide) {
        var slideId = attrs.fwSlide;
        var template = attrs.fwTemplate;
        var classes = [].slice.call(el[0].classList);
        var html = $templateCache.get(template);
        // If a path have been provided, get info 0: file name, 1: file name w/o extension, 2: file extension
        var pathInfo = template.match(/([^\/]+)(?=\.\w+$)[\.]([0-9A-Za-z_-]{1,4})$/);
       
        scope.$on('slide:ready', function(event, id) {
            if (html) {
                insertContent();
            }
            else {
                $http.get(template).success(function(str) {
                  html = str;
                  $templateCache.put(template, html);
                  insertContent();
                });
            }
            
            function insertContent () {
                var newEl = angular.element(html);
                // slide.attr('fw-slide', template);
                // $templateCache.put(template + '.html', html);
                $compile(newEl)(scope);
                newEl.addClass(classes.join(" "));
                el.replaceWith(newEl);
                el = newEl;
                slide.setElement(newEl);
                slide.positionSlide();
                if (slideId === scope.fw.current) {
                    slide.updateSlide(list.getIndex());
                    scope.$emit('enter:' + scope.fw.current);
                }
                newEl = null;
            }
        })
        
      }
    }
  })

  // Default display of images
  .directive('fwImage', function(list) {
      return {
          require: 'fwSlide',
          template: '<section><img ng-src="{{imgSrc}}" /></section>',
          replace: true,
          link: function linkFn(scope, el, attrs, slide) {
              var src = attrs.fwImage;
              scope.imgSrc = src;
              console.log(src);
              if (src === scope.fw.current) {
                  slide.updateSlide(list.getIndex());
              }
          }
      }
  })
  
  // Default display of images
  .directive('fwVideo', function(list) {
      return {
          require: 'fwSlide',
          template: '<section><video ng-src="{{imgSrc}}"></video></section>',
          replace: true,
          link: function linkFn(scope, el, attrs, slide) {
              var src = attrs.fwVideo;
              scope.imgSrc = src;
              console.log(src);
              if (src === scope.fw.current) {
                  slide.updateSlide(list.getIndex());
              }
          }
      }
  })
  
  // Default display of docs (pdfs)
  .directive('fwDoc', function(list) {
      return {
          require: 'fwSlide',
          template: '<section><iframe width="100%" height="{{docHeight}}" ng-src="{{docSrc}}" seamless></iframe>' +
                        '<div class="fw-doc-bar">{{docSrc}}</div>' +
                    '</section>',
          replace: true,
          link: function linkFn(scope, el, attrs, slide) {
              var src = attrs.fwDoc;
              scope.docHeight = scope.fw.config.height || '700';
              scope.docSrc = src;
              console.log(src);
              if (src === scope.fw.current) {
                  slide.updateSlide(list.getIndex());
              }
          }
      }
  })
  
  // Default display of docs (pdfs)
  .directive('fwUrl', function($sce, list) {
      return {
          require: 'fwSlide',
          template: '<section><iframe width="100%" height="{{docHeight}}" ng-src="{{urlSrc}}" seamless></iframe></section>',
          replace: true,
          link: function linkFn(scope, el, attrs, slide) {
              var src = attrs.fwUrl;
              scope.docHeight = scope.fw.config.height || '700';
              scope.urlSrc = $sce.trustAsResourceUrl(src);
              console.log(src);
              if (src === scope.fw.current) {
                  slide.updateSlide(list.getIndex());
              }
          }
      }
  })
  
  // Copying the Reveal.js progress functionality
  .directive('fwProgress', function($window, list) {
      return {
          scope: true,
          link: function linkFn(scope, el, attrs) {
              // Add the span element that acts as the indicator bar
              var barEl = angular.element('<span></span>');
              var parent = el.parent();
              el.append(barEl);
              el.addClass('progress');
              // Using Reveal stylesheet, so make sure it displays
              el.css('display', 'block');
              
              function updateProgress (index) {
                  var index = index || list.getIndex();
                  var totalCount = list.getList().length; // TODO: replace with list.size()
                  var pastCount = parseInt(index.h, 10); // TODO: replace with flattened list
                  var width = ( pastCount / ( totalCount - 1 ) ) * $window.innerWidth;
                  
                  if (totalCount > 1) {
                    barEl[0].style.width = width + 'px';
                  }
                  else {
                      barEl[0].style.width = $window.innerWidth + 'px';
                  }
              }
              
              // Go to slide when clicking progress bar
              scope.progressToSlide = function(event) {
                  event.preventDefault();
                  
                  var slidesTotal = list.getList().length;
                  var slideIndex = Math.floor( ( event.clientX / parent[0].offsetWidth ) * slidesTotal );
                  var slide = list.get(slideIndex, 0);
                  
                  console.log(slide);
                  
                  scope.fw.goto(slide);
              }
              
              scope.$on('slidechange', function(event, index) {
                updateProgress(index);
              });
              
              
          }
      }
  })
  
  // Copying the Reveal.js controls functionality
  .directive('fwControls', function($rootScope, list) {
      return {
          template: '<aside class="controls" style="display: block;">' +
                        '<div class="navigate-left" ng-click="fw.left()"></div>' +
                        '<div class="navigate-right" ng-click="fw.right()"></div>' +
                        '<div class="navigate-up" ng-click="fw.prev()"></div>' + 
                        '<div class="navigate-down" ng-click="fw.next()"></div>' + 
                    '</aside>',
          replace: true,
          link: function linkFn(scope, el, attrs) {
              var leftArrow = el.find('div').eq(0);
              var rightArrow = el.find('div').eq(1);
              var upArrow = el.find('div').eq(2);
              var downArrow = el.find('div').eq(3);
              
              function updateControls (index) {
                  var slides = list.getList();
                   if (index.h < slides.length - 1) {
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
                   if (list.get(index.h, index.v + 1)) {
                       downArrow.addClass("enabled");
                   }
                   else {
                       downArrow.removeClass("enabled");
                   }
                   if (index.v > 0) {
                       upArrow.addClass("enabled");
                   }
                   else {
                       upArrow.removeClass("enabled");
                   }
              }
              scope.$on('slidechange', function(event, index) {
                  updateControls(index);
              });
          }
      }
  })
  
  .directive('fwPause', function($rootScope) {
      return {
          scope: true,
          link: function linkFn(scope, el, attrs) {
              var parent = el.parent();
              
              scope.$on('pause:enter', function() {
                  parent.addClass('paused');
              });
              
              scope.$on('pause:resume', function() {
                  parent.removeClass('paused');
              });
          }
      }
  })
  
  .directive('animateOnEnter', function() {
      return {
          link: function linkFn(scope, el, attrs) {
              var slide = attrs.animateOnEnter || el[0].id;
              if  (slide) {
                  console.log(slide);
                  scope.$on('enter:' + slide, function() {
                     setTimeout(function() {
                        el.addClass('animate');
                     }, 700);
                  });
                  scope.$on('exit:' + slide, function() {
                     el.removeClass('animate'); 
                  });
              }
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
       // var previous = list.slice();
       list.push(item);
     };
     
     function prepend (item) {
       // var previous = list.slice();
       list.unshift(item);
       current += 1;
     };
     
     function insert (item, index) {
       // var previous = get(index.h, index.v);
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
      getType: getType,
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

fw.register = fw.register || fw.directive;

fw.update = function(path) {
    // var scope = angular.element('#fireworks').scope();
    // scope.$apply(function() {
       window.location.hash = path;
    // });
}