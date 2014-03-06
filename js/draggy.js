angular.module('ngDraggy', [])
	.directive('draggy', function($window, $document, $rootScope) {
		
		// Browser compatibility
		var ele = document.createElement('div'),
			style = ele.style,
			prefix;
		
		
		if ('transform' in style) {
		  prefix = '';
		}
		else if ('WebkitTransform' in style) {
		  prefix = '-webkit-';
		}
		else if ('MozTransform' in style) {
		  prefix = '-moz-';
		}
		else if ('msTransform' in style) {
		  prefix = '-ms-';
		}
		else if ('OTransform' in style) {
		  prefix = '-o-';
		}
		
		ele = null;
		
		var isTouch = 'ontouchstart' in $window,
			doubleTap = false,
			touchEvents = {
			  start: 'touchstart',
			  move: 'touchmove',
			  end: 'touchend'
			},
			mouseEvents = {
			  start: 'mousedown',
			  move: 'mousemove',
			  end: 'mouseup'
			},
			// http://jessefreeman.com/articles/from-webkit-to-windows-8-touch-events/
			msPointerEvents = {
			  start: 'MSPointerDown',
			  move: 'MSPointerMove',
			  end: 'MSPointerUp'
			},
			events = isTouch ? touchEvents : setEvents();
			
		function setEvents() {
			return $window.navigator.msPointerEnabled ? msPointerEvents : mouseEvents;
		}
		
		// PPK script for getting position of element
		// http://www.quirksmode.org/js/findpos.html
		function getPosition(ele) {
		  var curleft = 0;
		  var curtop = 0;
		  if (ele.offsetParent) {
			do {
			  curleft += ele.offsetLeft;
			  curtop += ele.offsetTop;
			} while (ele = ele.offsetParent);
		  }
		  return [curleft,curtop];
		}
		
		return {
			// scope: true,
			link: function linkFn($scope, $el, attrs) {
				// config from attributes
				var id = attrs.draggy || $el.id || null;
				var bindTo = attrs.bindTo || null;
				var restrictX = attrs.restrictX ? true : false;
				var restrictY = attrs.restrictY ? true : false;
				var limitsX   = attrs.limitsX || "-9999 9999";
				var limitsY   = attrs.limitsY || "-9999 9999";
				var snapBack  = attrs.snapBack ? true : false;
				
				limitsX = limitsX.split(" ");
				limitsY = limitsY.split(" ");
				
				limitsX[0] = parseInt(limitsX[0],10) || 0;
				limitsX[1] = parseInt(limitsX[1],10) || 9999;
				limitsY[0] = parseInt(limitsY[0],10) || 0;
				limitsY[1] = parseInt(limitsY[1],10) || 9999;
				
				var position = [0,0];
				
				if (id) {
					enable();
				}
				else {
					throw new Error("Cannot enable 'draggy' element without identifier");
				}
				
				// Calling the public API
				$scope.$on('move:' + id, moveTo);
				$scope.$on('set:' + id, setTo);
				$scope.$on('disable:' + id, disable);
				$scope.$on('enable:' + id, enable);
				
				setTimeout(function() {
					if (bindTo) bind(bindTo);
				}, 0);
				
				// Disable the draggy object so that it can't be moved
				function disable() {
				  $el.off(events.start, start);
				}
				// Enable the draggy object so that it can be moved
				function enable() {
				  $el.on(events.start, start);
				}
				
				$scope.$on("$destroy", function() {
				  disable();
				  $el.remove();
				});
				
				function start(event) {
					event.stopPropagation();
					
					var posX = isTouch ? event.touches[0].pageX : event.clientX,
						posY = isTouch ? event.touches[0].pageY : event.clientY,
						relativeX = position[0],
						relativeY = position[1];
						
					// Prevent panning and zooming (IE)
					if (event.preventManipulation) event.preventManipulation();
					
					// See blog.msdn.com/b/ie/20111/10/19/handling-multi-touch-and-mouse-input-in-all-browsers.aspx
					if (typeof event.target.style.msTouchAction !== 'undefined') event.target.style.msTouchAction = 'none';
					
					$el.addClass('draggy-active');
					
					$document.on(events.move, drag);
					$document.on(events.end, end);
					
					function drag(e) {
						e.preventDefault();
						var movedX, movedY, relX, relY,
							clientX = isTouch ? e.touches[0].pageX : e.clientX,
							clientY = isTouch ? e.touches[0].pageY : e.clientY;
						if (!restrictX) {
						  // Mouse movement (x axis) in px
						  movedX = clientX - posX;
						  // New pixel value (x axis) of element
						  newX = relativeX + movedX;
						  if (newX >= limitsX[0] && newX <= limitsX[1]) {
							posX = clientX;
							relativeX = newX;
						  }
						  else if (newX < limitsX[0]) {
							relativeX = limitsX[0];
						  }
						  else if (newX > limitsX[1]) {
							relativeX = limitsX[1];
						  }
						}
						if (!restrictY) {
						  movedY = clientY - posY;
						  newY = relativeY + movedY;
						  if (newY >= limitsY[0] && newY <= limitsY[1]) {
							posY = clientY;
							relativeY = newY;
						  }
						  else if (newY < limitsY[0]) {
							relativeY = limitsY[0];
						  }
						  else if (newY > limitsY[1]) {
							relativeY = limitsY[1];
						  }
						}
						position = [relativeX, relativeY];
						$el[0].style.cssText = prefix + 'transform:translate(' + relativeX + 'px,' + relativeY + 'px);';
						// $el.css('WebkitTransform', 'transform:translate(' + relativeX + 'px,' + relativeY + 'px)');
						$scope.$emit('change:' + id, position);
					}
					
					function end(e) {
						$el.removeClass('draggy-active');
						$rootScope.$broadcast('drop:' + id, position);
						$document.off(events.move, drag);
						$document.off(events.end, end);
					}
					
				}
				
				// API method for moving the draggy object
				// Position is updated
				// Limits and restrictions are adhered to
				// Callback is NOT called
				// onDrop event is NOT dispatched
				function moveTo(event, coords) {
				  var x = restrictX ? 0 : coords[0];
				  var y = restrictY ? 0 : coords[1];
				  if (x < limitsX[0] || x > limitsX[1]) { return; }
				  if (y < limitsY[0] || y > limitsY[1]) { return; }
				  $el[0].style.cssText = prefix + 'transform:translate(' + x + 'px,' + y + 'px);';
				  position = [x,y];
				}
				
				// API method for setting the draggy object at a certain point
				// Limits and restrictions are adhered to
				// Callback is called
				// onDrop event is dispatched
				function setTo(event, coords) {
				  x = restrictX ? 0 : coords[0];
				  y = restrictY ? 0 : coords[1];
				  if (x < limitsX[0] || x > limitsX[1]) { return; }
				  if (y < limitsY[0] || y > limitsY[1]) { return; }
				  $el[0].style.cssText = prefix + 'transform:translate(' + x + 'px,' + y + 'px);';	
				  $rootScope.$broadcast('drop:' + id);
				  position = [x,y];
				}
				
				// API method for resetting position of draggy object
				function reset() {
				  $el[0].style.cssText = prefix + 'transform:translate(0, 0);';
				  position = [0,0];
				}
				
				// API method for restricting draggy object to boundaries of an element
				// Sets x and y limits
				// Used internally if config option "bindTo" is used
				function bind(element) {
				  var ele,
					  draggyPos, elePos, draggyWidth, eleWidth, draggyHeight, eleHeight,
					  xLimit1,  xLimit2, yLimit1, yLimit2;
					  
				  if (element === 'parent') {
					  ele = $el[0].parentNode;
				  }
				  else {
					  ele = (typeof element === 'string' ? document.getElementById(element) : element);
				  }
				
				  xLimit1 = xLimit2 = yLimit1 = yLimit2 = 0;
				  
				  $scope.$on('$destroy', function() {ele = null;});
				
				  if (ele) {
					draggyPos    = getPosition($el[0]);
					elePos       = getPosition(ele);
					draggyWidth  = parseInt($el[0].offsetWidth, 10);
					eleWidth     = parseInt(ele.offsetWidth, 10);
					draggyHeight = parseInt($el[0].offsetHeight, 10);
					eleHeight    = parseInt(ele.offsetHeight, 10);
					if (!restrictX) {
					  xLimit1      = elePos[0] - draggyPos[0];
					  xLimit2      = (eleWidth - draggyWidth) - Math.abs(xLimit1);
					}
					if (!restrictY) {
					  yLimit1      = elePos[1] - draggyPos[1];
					  yLimit2      = (eleHeight - draggyHeight) - Math.abs(yLimit1);
					}
				
					limitsX = [xLimit1, xLimit2];
					limitsY = [yLimit1, yLimit2];
					
				  }
				}
				
			}
		}
	});