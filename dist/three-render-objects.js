// Version 1.27.4 three-render-objects - https://github.com/vasturiano/three-render-objects
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('three')) :
  typeof define === 'function' && define.amd ? define(['three'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ThreeRenderObjects = factory(global.THREE));
})(this, (function (three$1) { 'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css_248z = ".scene-nav-info {\n  bottom: 5px;\n  width: 100%;\n  text-align: center;\n  color: slategrey;\n  opacity: 0.7;\n  font-size: 10px;\n}\n\n.scene-tooltip {\n  top: 0;\n  color: lavender;\n  font-size: 15px;\n}\n\n.scene-nav-info, .scene-tooltip {\n  position: absolute;\n  font-family: sans-serif;\n  pointer-events: none;\n}\n\n.scene-container canvas:focus {\n  outline: none;\n}";
  styleInject(css_248z);

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest$1();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$1(arr);
  }

  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit$1(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
  }

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  const _changeEvent$2 = { type: 'change' };
  const _startEvent$1 = { type: 'start' };
  const _endEvent$1 = { type: 'end' };

  class TrackballControls extends three$1.EventDispatcher {

  	constructor( object, domElement ) {

  		super();

  		const scope = this;
  		const STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

  		this.object = object;
  		this.domElement = domElement;
  		this.domElement.style.touchAction = 'none'; // disable touch scroll

  		// API

  		this.enabled = true;

  		this.screen = { left: 0, top: 0, width: 0, height: 0 };

  		this.rotateSpeed = 1.0;
  		this.zoomSpeed = 1.2;
  		this.panSpeed = 0.3;

  		this.noRotate = false;
  		this.noZoom = false;
  		this.noPan = false;

  		this.staticMoving = false;
  		this.dynamicDampingFactor = 0.2;

  		this.minDistance = 0;
  		this.maxDistance = Infinity;

  		this.keys = [ 'KeyA' /*A*/, 'KeyS' /*S*/, 'KeyD' /*D*/ ];

  		this.mouseButtons = { LEFT: three$1.MOUSE.ROTATE, MIDDLE: three$1.MOUSE.DOLLY, RIGHT: three$1.MOUSE.PAN };

  		// internals

  		this.target = new three$1.Vector3();

  		const EPS = 0.000001;

  		const lastPosition = new three$1.Vector3();
  		let lastZoom = 1;

  		let _state = STATE.NONE,
  			_keyState = STATE.NONE,

  			_touchZoomDistanceStart = 0,
  			_touchZoomDistanceEnd = 0,

  			_lastAngle = 0;

  		const _eye = new three$1.Vector3(),

  			_movePrev = new three$1.Vector2(),
  			_moveCurr = new three$1.Vector2(),

  			_lastAxis = new three$1.Vector3(),

  			_zoomStart = new three$1.Vector2(),
  			_zoomEnd = new three$1.Vector2(),

  			_panStart = new three$1.Vector2(),
  			_panEnd = new three$1.Vector2(),

  			_pointers = [],
  			_pointerPositions = {};

  		// for reset

  		this.target0 = this.target.clone();
  		this.position0 = this.object.position.clone();
  		this.up0 = this.object.up.clone();
  		this.zoom0 = this.object.zoom;

  		// methods

  		this.handleResize = function () {

  			const box = scope.domElement.getBoundingClientRect();
  			// adjustments come from similar code in the jquery offset() function
  			const d = scope.domElement.ownerDocument.documentElement;
  			scope.screen.left = box.left + window.pageXOffset - d.clientLeft;
  			scope.screen.top = box.top + window.pageYOffset - d.clientTop;
  			scope.screen.width = box.width;
  			scope.screen.height = box.height;

  		};

  		const getMouseOnScreen = ( function () {

  			const vector = new three$1.Vector2();

  			return function getMouseOnScreen( pageX, pageY ) {

  				vector.set(
  					( pageX - scope.screen.left ) / scope.screen.width,
  					( pageY - scope.screen.top ) / scope.screen.height
  				);

  				return vector;

  			};

  		}() );

  		const getMouseOnCircle = ( function () {

  			const vector = new three$1.Vector2();

  			return function getMouseOnCircle( pageX, pageY ) {

  				vector.set(
  					( ( pageX - scope.screen.width * 0.5 - scope.screen.left ) / ( scope.screen.width * 0.5 ) ),
  					( ( scope.screen.height + 2 * ( scope.screen.top - pageY ) ) / scope.screen.width ) // screen.width intentional
  				);

  				return vector;

  			};

  		}() );

  		this.rotateCamera = ( function () {

  			const axis = new three$1.Vector3(),
  				quaternion = new three$1.Quaternion(),
  				eyeDirection = new three$1.Vector3(),
  				objectUpDirection = new three$1.Vector3(),
  				objectSidewaysDirection = new three$1.Vector3(),
  				moveDirection = new three$1.Vector3();

  			return function rotateCamera() {

  				moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
  				let angle = moveDirection.length();

  				if ( angle ) {

  					_eye.copy( scope.object.position ).sub( scope.target );

  					eyeDirection.copy( _eye ).normalize();
  					objectUpDirection.copy( scope.object.up ).normalize();
  					objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

  					objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
  					objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

  					moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

  					axis.crossVectors( moveDirection, _eye ).normalize();

  					angle *= scope.rotateSpeed;
  					quaternion.setFromAxisAngle( axis, angle );

  					_eye.applyQuaternion( quaternion );
  					scope.object.up.applyQuaternion( quaternion );

  					_lastAxis.copy( axis );
  					_lastAngle = angle;

  				} else if ( ! scope.staticMoving && _lastAngle ) {

  					_lastAngle *= Math.sqrt( 1.0 - scope.dynamicDampingFactor );
  					_eye.copy( scope.object.position ).sub( scope.target );
  					quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
  					_eye.applyQuaternion( quaternion );
  					scope.object.up.applyQuaternion( quaternion );

  				}

  				_movePrev.copy( _moveCurr );

  			};

  		}() );


  		this.zoomCamera = function () {

  			let factor;

  			if ( _state === STATE.TOUCH_ZOOM_PAN ) {

  				factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
  				_touchZoomDistanceStart = _touchZoomDistanceEnd;

  				if ( scope.object.isPerspectiveCamera ) {

  					_eye.multiplyScalar( factor );

  				} else if ( scope.object.isOrthographicCamera ) {

  					scope.object.zoom /= factor;
  					scope.object.updateProjectionMatrix();

  				} else {

  					console.warn( 'THREE.TrackballControls: Unsupported camera type' );

  				}

  			} else {

  				factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * scope.zoomSpeed;

  				if ( factor !== 1.0 && factor > 0.0 ) {

  					if ( scope.object.isPerspectiveCamera ) {

  						_eye.multiplyScalar( factor );

  					} else if ( scope.object.isOrthographicCamera ) {

  						scope.object.zoom /= factor;
  						scope.object.updateProjectionMatrix();

  					} else {

  						console.warn( 'THREE.TrackballControls: Unsupported camera type' );

  					}

  				}

  				if ( scope.staticMoving ) {

  					_zoomStart.copy( _zoomEnd );

  				} else {

  					_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

  				}

  			}

  		};

  		this.panCamera = ( function () {

  			const mouseChange = new three$1.Vector2(),
  				objectUp = new three$1.Vector3(),
  				pan = new three$1.Vector3();

  			return function panCamera() {

  				mouseChange.copy( _panEnd ).sub( _panStart );

  				if ( mouseChange.lengthSq() ) {

  					if ( scope.object.isOrthographicCamera ) {

  						const scale_x = ( scope.object.right - scope.object.left ) / scope.object.zoom / scope.domElement.clientWidth;
  						const scale_y = ( scope.object.top - scope.object.bottom ) / scope.object.zoom / scope.domElement.clientWidth;

  						mouseChange.x *= scale_x;
  						mouseChange.y *= scale_y;

  					}

  					mouseChange.multiplyScalar( _eye.length() * scope.panSpeed );

  					pan.copy( _eye ).cross( scope.object.up ).setLength( mouseChange.x );
  					pan.add( objectUp.copy( scope.object.up ).setLength( mouseChange.y ) );

  					scope.object.position.add( pan );
  					scope.target.add( pan );

  					if ( scope.staticMoving ) {

  						_panStart.copy( _panEnd );

  					} else {

  						_panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( scope.dynamicDampingFactor ) );

  					}

  				}

  			};

  		}() );

  		this.checkDistances = function () {

  			if ( ! scope.noZoom || ! scope.noPan ) {

  				if ( _eye.lengthSq() > scope.maxDistance * scope.maxDistance ) {

  					scope.object.position.addVectors( scope.target, _eye.setLength( scope.maxDistance ) );
  					_zoomStart.copy( _zoomEnd );

  				}

  				if ( _eye.lengthSq() < scope.minDistance * scope.minDistance ) {

  					scope.object.position.addVectors( scope.target, _eye.setLength( scope.minDistance ) );
  					_zoomStart.copy( _zoomEnd );

  				}

  			}

  		};

  		this.update = function () {

  			_eye.subVectors( scope.object.position, scope.target );

  			if ( ! scope.noRotate ) {

  				scope.rotateCamera();

  			}

  			if ( ! scope.noZoom ) {

  				scope.zoomCamera();

  			}

  			if ( ! scope.noPan ) {

  				scope.panCamera();

  			}

  			scope.object.position.addVectors( scope.target, _eye );

  			if ( scope.object.isPerspectiveCamera ) {

  				scope.checkDistances();

  				scope.object.lookAt( scope.target );

  				if ( lastPosition.distanceToSquared( scope.object.position ) > EPS ) {

  					scope.dispatchEvent( _changeEvent$2 );

  					lastPosition.copy( scope.object.position );

  				}

  			} else if ( scope.object.isOrthographicCamera ) {

  				scope.object.lookAt( scope.target );

  				if ( lastPosition.distanceToSquared( scope.object.position ) > EPS || lastZoom !== scope.object.zoom ) {

  					scope.dispatchEvent( _changeEvent$2 );

  					lastPosition.copy( scope.object.position );
  					lastZoom = scope.object.zoom;

  				}

  			} else {

  				console.warn( 'THREE.TrackballControls: Unsupported camera type' );

  			}

  		};

  		this.reset = function () {

  			_state = STATE.NONE;
  			_keyState = STATE.NONE;

  			scope.target.copy( scope.target0 );
  			scope.object.position.copy( scope.position0 );
  			scope.object.up.copy( scope.up0 );
  			scope.object.zoom = scope.zoom0;

  			scope.object.updateProjectionMatrix();

  			_eye.subVectors( scope.object.position, scope.target );

  			scope.object.lookAt( scope.target );

  			scope.dispatchEvent( _changeEvent$2 );

  			lastPosition.copy( scope.object.position );
  			lastZoom = scope.object.zoom;

  		};

  		// listeners

  		function onPointerDown( event ) {

  			if ( scope.enabled === false ) return;

  			if ( _pointers.length === 0 ) {

  				scope.domElement.setPointerCapture( event.pointerId );

  				scope.domElement.addEventListener( 'pointermove', onPointerMove );
  				scope.domElement.addEventListener( 'pointerup', onPointerUp );

  			}

  			//

  			addPointer( event );

  			if ( event.pointerType === 'touch' ) {

  				onTouchStart( event );

  			} else {

  				onMouseDown( event );

  			}

  		}

  		function onPointerMove( event ) {

  			if ( scope.enabled === false ) return;

  			if ( event.pointerType === 'touch' ) {

  				onTouchMove( event );

  			} else {

  				onMouseMove( event );

  			}

  		}

  		function onPointerUp( event ) {

  			if ( scope.enabled === false ) return;

  			if ( event.pointerType === 'touch' ) {

  				onTouchEnd( event );

  			} else {

  				onMouseUp();

  			}

  			//

  			removePointer( event );

  			if ( _pointers.length === 0 ) {

  				scope.domElement.releasePointerCapture( event.pointerId );

  				scope.domElement.removeEventListener( 'pointermove', onPointerMove );
  				scope.domElement.removeEventListener( 'pointerup', onPointerUp );

  			}


  		}

  		function onPointerCancel( event ) {

  			removePointer( event );

  		}

  		function keydown( event ) {

  			if ( scope.enabled === false ) return;

  			window.removeEventListener( 'keydown', keydown );

  			if ( _keyState !== STATE.NONE ) {

  				return;

  			} else if ( event.code === scope.keys[ STATE.ROTATE ] && ! scope.noRotate ) {

  				_keyState = STATE.ROTATE;

  			} else if ( event.code === scope.keys[ STATE.ZOOM ] && ! scope.noZoom ) {

  				_keyState = STATE.ZOOM;

  			} else if ( event.code === scope.keys[ STATE.PAN ] && ! scope.noPan ) {

  				_keyState = STATE.PAN;

  			}

  		}

  		function keyup() {

  			if ( scope.enabled === false ) return;

  			_keyState = STATE.NONE;

  			window.addEventListener( 'keydown', keydown );

  		}

  		function onMouseDown( event ) {

  			if ( _state === STATE.NONE ) {

  				switch ( event.button ) {

  					case scope.mouseButtons.LEFT:
  						_state = STATE.ROTATE;
  						break;

  					case scope.mouseButtons.MIDDLE:
  						_state = STATE.ZOOM;
  						break;

  					case scope.mouseButtons.RIGHT:
  						_state = STATE.PAN;
  						break;

  				}

  			}

  			const state = ( _keyState !== STATE.NONE ) ? _keyState : _state;

  			if ( state === STATE.ROTATE && ! scope.noRotate ) {

  				_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
  				_movePrev.copy( _moveCurr );

  			} else if ( state === STATE.ZOOM && ! scope.noZoom ) {

  				_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
  				_zoomEnd.copy( _zoomStart );

  			} else if ( state === STATE.PAN && ! scope.noPan ) {

  				_panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
  				_panEnd.copy( _panStart );

  			}

  			scope.dispatchEvent( _startEvent$1 );

  		}

  		function onMouseMove( event ) {

  			const state = ( _keyState !== STATE.NONE ) ? _keyState : _state;

  			if ( state === STATE.ROTATE && ! scope.noRotate ) {

  				_movePrev.copy( _moveCurr );
  				_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );

  			} else if ( state === STATE.ZOOM && ! scope.noZoom ) {

  				_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

  			} else if ( state === STATE.PAN && ! scope.noPan ) {

  				_panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

  			}

  		}

  		function onMouseUp() {

  			_state = STATE.NONE;

  			scope.dispatchEvent( _endEvent$1 );

  		}

  		function onMouseWheel( event ) {

  			if ( scope.enabled === false ) return;

  			if ( scope.noZoom === true ) return;

  			event.preventDefault();

  			switch ( event.deltaMode ) {

  				case 2:
  					// Zoom in pages
  					_zoomStart.y -= event.deltaY * 0.025;
  					break;

  				case 1:
  					// Zoom in lines
  					_zoomStart.y -= event.deltaY * 0.01;
  					break;

  				default:
  					// undefined, 0, assume pixels
  					_zoomStart.y -= event.deltaY * 0.00025;
  					break;

  			}

  			scope.dispatchEvent( _startEvent$1 );
  			scope.dispatchEvent( _endEvent$1 );

  		}

  		function onTouchStart( event ) {

  			trackPointer( event );

  			switch ( _pointers.length ) {

  				case 1:
  					_state = STATE.TOUCH_ROTATE;
  					_moveCurr.copy( getMouseOnCircle( _pointers[ 0 ].pageX, _pointers[ 0 ].pageY ) );
  					_movePrev.copy( _moveCurr );
  					break;

  				default: // 2 or more
  					_state = STATE.TOUCH_ZOOM_PAN;
  					const dx = _pointers[ 0 ].pageX - _pointers[ 1 ].pageX;
  					const dy = _pointers[ 0 ].pageY - _pointers[ 1 ].pageY;
  					_touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );

  					const x = ( _pointers[ 0 ].pageX + _pointers[ 1 ].pageX ) / 2;
  					const y = ( _pointers[ 0 ].pageY + _pointers[ 1 ].pageY ) / 2;
  					_panStart.copy( getMouseOnScreen( x, y ) );
  					_panEnd.copy( _panStart );
  					break;

  			}

  			scope.dispatchEvent( _startEvent$1 );

  		}

  		function onTouchMove( event ) {

  			trackPointer( event );

  			switch ( _pointers.length ) {

  				case 1:
  					_movePrev.copy( _moveCurr );
  					_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
  					break;

  				default: // 2 or more

  					const position = getSecondPointerPosition( event );

  					const dx = event.pageX - position.x;
  					const dy = event.pageY - position.y;
  					_touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );

  					const x = ( event.pageX + position.x ) / 2;
  					const y = ( event.pageY + position.y ) / 2;
  					_panEnd.copy( getMouseOnScreen( x, y ) );
  					break;

  			}

  		}

  		function onTouchEnd( event ) {

  			switch ( _pointers.length ) {

  				case 0:
  					_state = STATE.NONE;
  					break;

  				case 1:
  					_state = STATE.TOUCH_ROTATE;
  					_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
  					_movePrev.copy( _moveCurr );
  					break;

  				case 2:
  					_state = STATE.TOUCH_ZOOM_PAN;
  					_moveCurr.copy( getMouseOnCircle( event.pageX - _movePrev.x, event.pageY - _movePrev.y ) );
  					_movePrev.copy( _moveCurr );
  					break;

  			}

  			scope.dispatchEvent( _endEvent$1 );

  		}

  		function contextmenu( event ) {

  			if ( scope.enabled === false ) return;

  			event.preventDefault();

  		}

  		function addPointer( event ) {

  			_pointers.push( event );

  		}

  		function removePointer( event ) {

  			delete _pointerPositions[ event.pointerId ];

  			for ( let i = 0; i < _pointers.length; i ++ ) {

  				if ( _pointers[ i ].pointerId == event.pointerId ) {

  					_pointers.splice( i, 1 );
  					return;

  				}

  			}

  		}

  		function trackPointer( event ) {

  			let position = _pointerPositions[ event.pointerId ];

  			if ( position === undefined ) {

  				position = new three$1.Vector2();
  				_pointerPositions[ event.pointerId ] = position;

  			}

  			position.set( event.pageX, event.pageY );

  		}

  		function getSecondPointerPosition( event ) {

  			const pointer = ( event.pointerId === _pointers[ 0 ].pointerId ) ? _pointers[ 1 ] : _pointers[ 0 ];

  			return _pointerPositions[ pointer.pointerId ];

  		}

  		this.dispose = function () {

  			scope.domElement.removeEventListener( 'contextmenu', contextmenu );

  			scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
  			scope.domElement.removeEventListener( 'pointercancel', onPointerCancel );
  			scope.domElement.removeEventListener( 'wheel', onMouseWheel );

  			scope.domElement.removeEventListener( 'pointermove', onPointerMove );
  			scope.domElement.removeEventListener( 'pointerup', onPointerUp );

  			window.removeEventListener( 'keydown', keydown );
  			window.removeEventListener( 'keyup', keyup );

  		};

  		this.domElement.addEventListener( 'contextmenu', contextmenu );

  		this.domElement.addEventListener( 'pointerdown', onPointerDown );
  		this.domElement.addEventListener( 'pointercancel', onPointerCancel );
  		this.domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );


  		window.addEventListener( 'keydown', keydown );
  		window.addEventListener( 'keyup', keyup );

  		this.handleResize();

  		// force an update at start
  		this.update();

  	}

  }

  // This set of controls performs orbiting, dollying (zooming), and panning.
  // Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
  //
  //    Orbit - left mouse / touch: one-finger move
  //    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
  //    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

  const _changeEvent$1 = { type: 'change' };
  const _startEvent = { type: 'start' };
  const _endEvent = { type: 'end' };

  class OrbitControls extends three$1.EventDispatcher {

  	constructor( object, domElement ) {

  		super();

  		this.object = object;
  		this.domElement = domElement;
  		this.domElement.style.touchAction = 'none'; // disable touch scroll

  		// Set to false to disable this control
  		this.enabled = true;

  		// "target" sets the location of focus, where the object orbits around
  		this.target = new three$1.Vector3();

  		// How far you can dolly in and out ( PerspectiveCamera only )
  		this.minDistance = 0;
  		this.maxDistance = Infinity;

  		// How far you can zoom in and out ( OrthographicCamera only )
  		this.minZoom = 0;
  		this.maxZoom = Infinity;

  		// How far you can orbit vertically, upper and lower limits.
  		// Range is 0 to Math.PI radians.
  		this.minPolarAngle = 0; // radians
  		this.maxPolarAngle = Math.PI; // radians

  		// How far you can orbit horizontally, upper and lower limits.
  		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  		this.minAzimuthAngle = - Infinity; // radians
  		this.maxAzimuthAngle = Infinity; // radians

  		// Set to true to enable damping (inertia)
  		// If damping is enabled, you must call controls.update() in your animation loop
  		this.enableDamping = false;
  		this.dampingFactor = 0.05;

  		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  		// Set to false to disable zooming
  		this.enableZoom = true;
  		this.zoomSpeed = 1.0;

  		// Set to false to disable rotating
  		this.enableRotate = true;
  		this.rotateSpeed = 1.0;

  		// Set to false to disable panning
  		this.enablePan = true;
  		this.panSpeed = 1.0;
  		this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
  		this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

  		// Set to true to automatically rotate around the target
  		// If auto-rotate is enabled, you must call controls.update() in your animation loop
  		this.autoRotate = false;
  		this.autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

  		// The four arrow keys
  		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };

  		// Mouse buttons
  		this.mouseButtons = { LEFT: three$1.MOUSE.ROTATE, MIDDLE: three$1.MOUSE.DOLLY, RIGHT: three$1.MOUSE.PAN };

  		// Touch fingers
  		this.touches = { ONE: three$1.TOUCH.ROTATE, TWO: three$1.TOUCH.DOLLY_PAN };

  		// for reset
  		this.target0 = this.target.clone();
  		this.position0 = this.object.position.clone();
  		this.zoom0 = this.object.zoom;

  		// the target DOM element for key events
  		this._domElementKeyEvents = null;

  		//
  		// public methods
  		//

  		this.getPolarAngle = function () {

  			return spherical.phi;

  		};

  		this.getAzimuthalAngle = function () {

  			return spherical.theta;

  		};

  		this.getDistance = function () {

  			return this.object.position.distanceTo( this.target );

  		};

  		this.listenToKeyEvents = function ( domElement ) {

  			domElement.addEventListener( 'keydown', onKeyDown );
  			this._domElementKeyEvents = domElement;

  		};

  		this.saveState = function () {

  			scope.target0.copy( scope.target );
  			scope.position0.copy( scope.object.position );
  			scope.zoom0 = scope.object.zoom;

  		};

  		this.reset = function () {

  			scope.target.copy( scope.target0 );
  			scope.object.position.copy( scope.position0 );
  			scope.object.zoom = scope.zoom0;

  			scope.object.updateProjectionMatrix();
  			scope.dispatchEvent( _changeEvent$1 );

  			scope.update();

  			state = STATE.NONE;

  		};

  		// this method is exposed, but perhaps it would be better if we can make it private...
  		this.update = function () {

  			const offset = new three$1.Vector3();

  			// so camera.up is the orbit axis
  			const quat = new three$1.Quaternion().setFromUnitVectors( object.up, new three$1.Vector3( 0, 1, 0 ) );
  			const quatInverse = quat.clone().invert();

  			const lastPosition = new three$1.Vector3();
  			const lastQuaternion = new three$1.Quaternion();

  			const twoPI = 2 * Math.PI;

  			return function update() {

  				const position = scope.object.position;

  				offset.copy( position ).sub( scope.target );

  				// rotate offset to "y-axis-is-up" space
  				offset.applyQuaternion( quat );

  				// angle from z-axis around y-axis
  				spherical.setFromVector3( offset );

  				if ( scope.autoRotate && state === STATE.NONE ) {

  					rotateLeft( getAutoRotationAngle() );

  				}

  				if ( scope.enableDamping ) {

  					spherical.theta += sphericalDelta.theta * scope.dampingFactor;
  					spherical.phi += sphericalDelta.phi * scope.dampingFactor;

  				} else {

  					spherical.theta += sphericalDelta.theta;
  					spherical.phi += sphericalDelta.phi;

  				}

  				// restrict theta to be between desired limits

  				let min = scope.minAzimuthAngle;
  				let max = scope.maxAzimuthAngle;

  				if ( isFinite( min ) && isFinite( max ) ) {

  					if ( min < - Math.PI ) min += twoPI; else if ( min > Math.PI ) min -= twoPI;

  					if ( max < - Math.PI ) max += twoPI; else if ( max > Math.PI ) max -= twoPI;

  					if ( min <= max ) {

  						spherical.theta = Math.max( min, Math.min( max, spherical.theta ) );

  					} else {

  						spherical.theta = ( spherical.theta > ( min + max ) / 2 ) ?
  							Math.max( min, spherical.theta ) :
  							Math.min( max, spherical.theta );

  					}

  				}

  				// restrict phi to be between desired limits
  				spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

  				spherical.makeSafe();


  				spherical.radius *= scale;

  				// restrict radius to be between desired limits
  				spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

  				// move target to panned location

  				if ( scope.enableDamping === true ) {

  					scope.target.addScaledVector( panOffset, scope.dampingFactor );

  				} else {

  					scope.target.add( panOffset );

  				}

  				offset.setFromSpherical( spherical );

  				// rotate offset back to "camera-up-vector-is-up" space
  				offset.applyQuaternion( quatInverse );

  				position.copy( scope.target ).add( offset );

  				scope.object.lookAt( scope.target );

  				if ( scope.enableDamping === true ) {

  					sphericalDelta.theta *= ( 1 - scope.dampingFactor );
  					sphericalDelta.phi *= ( 1 - scope.dampingFactor );

  					panOffset.multiplyScalar( 1 - scope.dampingFactor );

  				} else {

  					sphericalDelta.set( 0, 0, 0 );

  					panOffset.set( 0, 0, 0 );

  				}

  				scale = 1;

  				// update condition is:
  				// min(camera displacement, camera rotation in radians)^2 > EPS
  				// using small-angle approximation cos(x/2) = 1 - x^2 / 8

  				if ( zoomChanged ||
  					lastPosition.distanceToSquared( scope.object.position ) > EPS ||
  					8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

  					scope.dispatchEvent( _changeEvent$1 );

  					lastPosition.copy( scope.object.position );
  					lastQuaternion.copy( scope.object.quaternion );
  					zoomChanged = false;

  					return true;

  				}

  				return false;

  			};

  		}();

  		this.dispose = function () {

  			scope.domElement.removeEventListener( 'contextmenu', onContextMenu );

  			scope.domElement.removeEventListener( 'pointerdown', onPointerDown );
  			scope.domElement.removeEventListener( 'pointercancel', onPointerCancel );
  			scope.domElement.removeEventListener( 'wheel', onMouseWheel );

  			scope.domElement.removeEventListener( 'pointermove', onPointerMove );
  			scope.domElement.removeEventListener( 'pointerup', onPointerUp );


  			if ( scope._domElementKeyEvents !== null ) {

  				scope._domElementKeyEvents.removeEventListener( 'keydown', onKeyDown );

  			}

  			//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

  		};

  		//
  		// internals
  		//

  		const scope = this;

  		const STATE = {
  			NONE: - 1,
  			ROTATE: 0,
  			DOLLY: 1,
  			PAN: 2,
  			TOUCH_ROTATE: 3,
  			TOUCH_PAN: 4,
  			TOUCH_DOLLY_PAN: 5,
  			TOUCH_DOLLY_ROTATE: 6
  		};

  		let state = STATE.NONE;

  		const EPS = 0.000001;

  		// current position in spherical coordinates
  		const spherical = new three$1.Spherical();
  		const sphericalDelta = new three$1.Spherical();

  		let scale = 1;
  		const panOffset = new three$1.Vector3();
  		let zoomChanged = false;

  		const rotateStart = new three$1.Vector2();
  		const rotateEnd = new three$1.Vector2();
  		const rotateDelta = new three$1.Vector2();

  		const panStart = new three$1.Vector2();
  		const panEnd = new three$1.Vector2();
  		const panDelta = new three$1.Vector2();

  		const dollyStart = new three$1.Vector2();
  		const dollyEnd = new three$1.Vector2();
  		const dollyDelta = new three$1.Vector2();

  		const pointers = [];
  		const pointerPositions = {};

  		function getAutoRotationAngle() {

  			return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

  		}

  		function getZoomScale() {

  			return Math.pow( 0.95, scope.zoomSpeed );

  		}

  		function rotateLeft( angle ) {

  			sphericalDelta.theta -= angle;

  		}

  		function rotateUp( angle ) {

  			sphericalDelta.phi -= angle;

  		}

  		const panLeft = function () {

  			const v = new three$1.Vector3();

  			return function panLeft( distance, objectMatrix ) {

  				v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
  				v.multiplyScalar( - distance );

  				panOffset.add( v );

  			};

  		}();

  		const panUp = function () {

  			const v = new three$1.Vector3();

  			return function panUp( distance, objectMatrix ) {

  				if ( scope.screenSpacePanning === true ) {

  					v.setFromMatrixColumn( objectMatrix, 1 );

  				} else {

  					v.setFromMatrixColumn( objectMatrix, 0 );
  					v.crossVectors( scope.object.up, v );

  				}

  				v.multiplyScalar( distance );

  				panOffset.add( v );

  			};

  		}();

  		// deltaX and deltaY are in pixels; right and down are positive
  		const pan = function () {

  			const offset = new three$1.Vector3();

  			return function pan( deltaX, deltaY ) {

  				const element = scope.domElement;

  				if ( scope.object.isPerspectiveCamera ) {

  					// perspective
  					const position = scope.object.position;
  					offset.copy( position ).sub( scope.target );
  					let targetDistance = offset.length();

  					// half of the fov is center to top of screen
  					targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

  					// we use only clientHeight here so aspect ratio does not distort speed
  					panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
  					panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

  				} else if ( scope.object.isOrthographicCamera ) {

  					// orthographic
  					panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
  					panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

  				} else {

  					// camera neither orthographic nor perspective
  					console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
  					scope.enablePan = false;

  				}

  			};

  		}();

  		function dollyOut( dollyScale ) {

  			if ( scope.object.isPerspectiveCamera ) {

  				scale /= dollyScale;

  			} else if ( scope.object.isOrthographicCamera ) {

  				scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
  				scope.object.updateProjectionMatrix();
  				zoomChanged = true;

  			} else {

  				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
  				scope.enableZoom = false;

  			}

  		}

  		function dollyIn( dollyScale ) {

  			if ( scope.object.isPerspectiveCamera ) {

  				scale *= dollyScale;

  			} else if ( scope.object.isOrthographicCamera ) {

  				scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
  				scope.object.updateProjectionMatrix();
  				zoomChanged = true;

  			} else {

  				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
  				scope.enableZoom = false;

  			}

  		}

  		//
  		// event callbacks - update the object state
  		//

  		function handleMouseDownRotate( event ) {

  			rotateStart.set( event.clientX, event.clientY );

  		}

  		function handleMouseDownDolly( event ) {

  			dollyStart.set( event.clientX, event.clientY );

  		}

  		function handleMouseDownPan( event ) {

  			panStart.set( event.clientX, event.clientY );

  		}

  		function handleMouseMoveRotate( event ) {

  			rotateEnd.set( event.clientX, event.clientY );

  			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

  			const element = scope.domElement;

  			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

  			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

  			rotateStart.copy( rotateEnd );

  			scope.update();

  		}

  		function handleMouseMoveDolly( event ) {

  			dollyEnd.set( event.clientX, event.clientY );

  			dollyDelta.subVectors( dollyEnd, dollyStart );

  			if ( dollyDelta.y > 0 ) {

  				dollyOut( getZoomScale() );

  			} else if ( dollyDelta.y < 0 ) {

  				dollyIn( getZoomScale() );

  			}

  			dollyStart.copy( dollyEnd );

  			scope.update();

  		}

  		function handleMouseMovePan( event ) {

  			panEnd.set( event.clientX, event.clientY );

  			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

  			pan( panDelta.x, panDelta.y );

  			panStart.copy( panEnd );

  			scope.update();

  		}

  		function handleMouseWheel( event ) {

  			if ( event.deltaY < 0 ) {

  				dollyIn( getZoomScale() );

  			} else if ( event.deltaY > 0 ) {

  				dollyOut( getZoomScale() );

  			}

  			scope.update();

  		}

  		function handleKeyDown( event ) {

  			let needsUpdate = false;

  			switch ( event.code ) {

  				case scope.keys.UP:
  					pan( 0, scope.keyPanSpeed );
  					needsUpdate = true;
  					break;

  				case scope.keys.BOTTOM:
  					pan( 0, - scope.keyPanSpeed );
  					needsUpdate = true;
  					break;

  				case scope.keys.LEFT:
  					pan( scope.keyPanSpeed, 0 );
  					needsUpdate = true;
  					break;

  				case scope.keys.RIGHT:
  					pan( - scope.keyPanSpeed, 0 );
  					needsUpdate = true;
  					break;

  			}

  			if ( needsUpdate ) {

  				// prevent the browser from scrolling on cursor keys
  				event.preventDefault();

  				scope.update();

  			}


  		}

  		function handleTouchStartRotate() {

  			if ( pointers.length === 1 ) {

  				rotateStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

  			} else {

  				const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
  				const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

  				rotateStart.set( x, y );

  			}

  		}

  		function handleTouchStartPan() {

  			if ( pointers.length === 1 ) {

  				panStart.set( pointers[ 0 ].pageX, pointers[ 0 ].pageY );

  			} else {

  				const x = 0.5 * ( pointers[ 0 ].pageX + pointers[ 1 ].pageX );
  				const y = 0.5 * ( pointers[ 0 ].pageY + pointers[ 1 ].pageY );

  				panStart.set( x, y );

  			}

  		}

  		function handleTouchStartDolly() {

  			const dx = pointers[ 0 ].pageX - pointers[ 1 ].pageX;
  			const dy = pointers[ 0 ].pageY - pointers[ 1 ].pageY;

  			const distance = Math.sqrt( dx * dx + dy * dy );

  			dollyStart.set( 0, distance );

  		}

  		function handleTouchStartDollyPan() {

  			if ( scope.enableZoom ) handleTouchStartDolly();

  			if ( scope.enablePan ) handleTouchStartPan();

  		}

  		function handleTouchStartDollyRotate() {

  			if ( scope.enableZoom ) handleTouchStartDolly();

  			if ( scope.enableRotate ) handleTouchStartRotate();

  		}

  		function handleTouchMoveRotate( event ) {

  			if ( pointers.length == 1 ) {

  				rotateEnd.set( event.pageX, event.pageY );

  			} else {

  				const position = getSecondPointerPosition( event );

  				const x = 0.5 * ( event.pageX + position.x );
  				const y = 0.5 * ( event.pageY + position.y );

  				rotateEnd.set( x, y );

  			}

  			rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );

  			const element = scope.domElement;

  			rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height

  			rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );

  			rotateStart.copy( rotateEnd );

  		}

  		function handleTouchMovePan( event ) {

  			if ( pointers.length === 1 ) {

  				panEnd.set( event.pageX, event.pageY );

  			} else {

  				const position = getSecondPointerPosition( event );

  				const x = 0.5 * ( event.pageX + position.x );
  				const y = 0.5 * ( event.pageY + position.y );

  				panEnd.set( x, y );

  			}

  			panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

  			pan( panDelta.x, panDelta.y );

  			panStart.copy( panEnd );

  		}

  		function handleTouchMoveDolly( event ) {

  			const position = getSecondPointerPosition( event );

  			const dx = event.pageX - position.x;
  			const dy = event.pageY - position.y;

  			const distance = Math.sqrt( dx * dx + dy * dy );

  			dollyEnd.set( 0, distance );

  			dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );

  			dollyOut( dollyDelta.y );

  			dollyStart.copy( dollyEnd );

  		}

  		function handleTouchMoveDollyPan( event ) {

  			if ( scope.enableZoom ) handleTouchMoveDolly( event );

  			if ( scope.enablePan ) handleTouchMovePan( event );

  		}

  		function handleTouchMoveDollyRotate( event ) {

  			if ( scope.enableZoom ) handleTouchMoveDolly( event );

  			if ( scope.enableRotate ) handleTouchMoveRotate( event );

  		}

  		//
  		// event handlers - FSM: listen for events and reset state
  		//

  		function onPointerDown( event ) {

  			if ( scope.enabled === false ) return;

  			if ( pointers.length === 0 ) {

  				scope.domElement.setPointerCapture( event.pointerId );

  				scope.domElement.addEventListener( 'pointermove', onPointerMove );
  				scope.domElement.addEventListener( 'pointerup', onPointerUp );

  			}

  			//

  			addPointer( event );

  			if ( event.pointerType === 'touch' ) {

  				onTouchStart( event );

  			} else {

  				onMouseDown( event );

  			}

  		}

  		function onPointerMove( event ) {

  			if ( scope.enabled === false ) return;

  			if ( event.pointerType === 'touch' ) {

  				onTouchMove( event );

  			} else {

  				onMouseMove( event );

  			}

  		}

  		function onPointerUp( event ) {

  		    removePointer( event );

  		    if ( pointers.length === 0 ) {

  		        scope.domElement.releasePointerCapture( event.pointerId );

  		        scope.domElement.removeEventListener( 'pointermove', onPointerMove );
  		        scope.domElement.removeEventListener( 'pointerup', onPointerUp );

  		    }

  		    scope.dispatchEvent( _endEvent );

  		    state = STATE.NONE;

  		}

  		function onPointerCancel( event ) {

  			removePointer( event );

  		}

  		function onMouseDown( event ) {

  			let mouseAction;

  			switch ( event.button ) {

  				case 0:

  					mouseAction = scope.mouseButtons.LEFT;
  					break;

  				case 1:

  					mouseAction = scope.mouseButtons.MIDDLE;
  					break;

  				case 2:

  					mouseAction = scope.mouseButtons.RIGHT;
  					break;

  				default:

  					mouseAction = - 1;

  			}

  			switch ( mouseAction ) {

  				case three$1.MOUSE.DOLLY:

  					if ( scope.enableZoom === false ) return;

  					handleMouseDownDolly( event );

  					state = STATE.DOLLY;

  					break;

  				case three$1.MOUSE.ROTATE:

  					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

  						if ( scope.enablePan === false ) return;

  						handleMouseDownPan( event );

  						state = STATE.PAN;

  					} else {

  						if ( scope.enableRotate === false ) return;

  						handleMouseDownRotate( event );

  						state = STATE.ROTATE;

  					}

  					break;

  				case three$1.MOUSE.PAN:

  					if ( event.ctrlKey || event.metaKey || event.shiftKey ) {

  						if ( scope.enableRotate === false ) return;

  						handleMouseDownRotate( event );

  						state = STATE.ROTATE;

  					} else {

  						if ( scope.enablePan === false ) return;

  						handleMouseDownPan( event );

  						state = STATE.PAN;

  					}

  					break;

  				default:

  					state = STATE.NONE;

  			}

  			if ( state !== STATE.NONE ) {

  				scope.dispatchEvent( _startEvent );

  			}

  		}

  		function onMouseMove( event ) {

  			switch ( state ) {

  				case STATE.ROTATE:

  					if ( scope.enableRotate === false ) return;

  					handleMouseMoveRotate( event );

  					break;

  				case STATE.DOLLY:

  					if ( scope.enableZoom === false ) return;

  					handleMouseMoveDolly( event );

  					break;

  				case STATE.PAN:

  					if ( scope.enablePan === false ) return;

  					handleMouseMovePan( event );

  					break;

  			}

  		}

  		function onMouseWheel( event ) {

  			if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

  			event.preventDefault();

  			scope.dispatchEvent( _startEvent );

  			handleMouseWheel( event );

  			scope.dispatchEvent( _endEvent );

  		}

  		function onKeyDown( event ) {

  			if ( scope.enabled === false || scope.enablePan === false ) return;

  			handleKeyDown( event );

  		}

  		function onTouchStart( event ) {

  			trackPointer( event );

  			switch ( pointers.length ) {

  				case 1:

  					switch ( scope.touches.ONE ) {

  						case three$1.TOUCH.ROTATE:

  							if ( scope.enableRotate === false ) return;

  							handleTouchStartRotate();

  							state = STATE.TOUCH_ROTATE;

  							break;

  						case three$1.TOUCH.PAN:

  							if ( scope.enablePan === false ) return;

  							handleTouchStartPan();

  							state = STATE.TOUCH_PAN;

  							break;

  						default:

  							state = STATE.NONE;

  					}

  					break;

  				case 2:

  					switch ( scope.touches.TWO ) {

  						case three$1.TOUCH.DOLLY_PAN:

  							if ( scope.enableZoom === false && scope.enablePan === false ) return;

  							handleTouchStartDollyPan();

  							state = STATE.TOUCH_DOLLY_PAN;

  							break;

  						case three$1.TOUCH.DOLLY_ROTATE:

  							if ( scope.enableZoom === false && scope.enableRotate === false ) return;

  							handleTouchStartDollyRotate();

  							state = STATE.TOUCH_DOLLY_ROTATE;

  							break;

  						default:

  							state = STATE.NONE;

  					}

  					break;

  				default:

  					state = STATE.NONE;

  			}

  			if ( state !== STATE.NONE ) {

  				scope.dispatchEvent( _startEvent );

  			}

  		}

  		function onTouchMove( event ) {

  			trackPointer( event );

  			switch ( state ) {

  				case STATE.TOUCH_ROTATE:

  					if ( scope.enableRotate === false ) return;

  					handleTouchMoveRotate( event );

  					scope.update();

  					break;

  				case STATE.TOUCH_PAN:

  					if ( scope.enablePan === false ) return;

  					handleTouchMovePan( event );

  					scope.update();

  					break;

  				case STATE.TOUCH_DOLLY_PAN:

  					if ( scope.enableZoom === false && scope.enablePan === false ) return;

  					handleTouchMoveDollyPan( event );

  					scope.update();

  					break;

  				case STATE.TOUCH_DOLLY_ROTATE:

  					if ( scope.enableZoom === false && scope.enableRotate === false ) return;

  					handleTouchMoveDollyRotate( event );

  					scope.update();

  					break;

  				default:

  					state = STATE.NONE;

  			}

  		}

  		function onContextMenu( event ) {

  			if ( scope.enabled === false ) return;

  			event.preventDefault();

  		}

  		function addPointer( event ) {

  			pointers.push( event );

  		}

  		function removePointer( event ) {

  			delete pointerPositions[ event.pointerId ];

  			for ( let i = 0; i < pointers.length; i ++ ) {

  				if ( pointers[ i ].pointerId == event.pointerId ) {

  					pointers.splice( i, 1 );
  					return;

  				}

  			}

  		}

  		function trackPointer( event ) {

  			let position = pointerPositions[ event.pointerId ];

  			if ( position === undefined ) {

  				position = new three$1.Vector2();
  				pointerPositions[ event.pointerId ] = position;

  			}

  			position.set( event.pageX, event.pageY );

  		}

  		function getSecondPointerPosition( event ) {

  			const pointer = ( event.pointerId === pointers[ 0 ].pointerId ) ? pointers[ 1 ] : pointers[ 0 ];

  			return pointerPositions[ pointer.pointerId ];

  		}

  		//

  		scope.domElement.addEventListener( 'contextmenu', onContextMenu );

  		scope.domElement.addEventListener( 'pointerdown', onPointerDown );
  		scope.domElement.addEventListener( 'pointercancel', onPointerCancel );
  		scope.domElement.addEventListener( 'wheel', onMouseWheel, { passive: false } );

  		// force an update at start

  		this.update();

  	}

  }

  const _changeEvent = { type: 'change' };

  class FlyControls extends three$1.EventDispatcher {

  	constructor( object, domElement ) {

  		super();

  		this.object = object;
  		this.domElement = domElement;

  		// API

  		this.movementSpeed = 1.0;
  		this.rollSpeed = 0.005;

  		this.dragToLook = false;
  		this.autoForward = false;

  		// disable default target object behavior

  		// internals

  		const scope = this;

  		const EPS = 0.000001;

  		const lastQuaternion = new three$1.Quaternion();
  		const lastPosition = new three$1.Vector3();

  		this.tmpQuaternion = new three$1.Quaternion();

  		this.mouseStatus = 0;

  		this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
  		this.moveVector = new three$1.Vector3( 0, 0, 0 );
  		this.rotationVector = new three$1.Vector3( 0, 0, 0 );

  		this.keydown = function ( event ) {

  			if ( event.altKey ) {

  				return;

  			}

  			switch ( event.code ) {

  				case 'ShiftLeft':
  				case 'ShiftRight': this.movementSpeedMultiplier = .1; break;

  				case 'KeyW': this.moveState.forward = 1; break;
  				case 'KeyS': this.moveState.back = 1; break;

  				case 'KeyA': this.moveState.left = 1; break;
  				case 'KeyD': this.moveState.right = 1; break;

  				case 'KeyR': this.moveState.up = 1; break;
  				case 'KeyF': this.moveState.down = 1; break;

  				case 'ArrowUp': this.moveState.pitchUp = 1; break;
  				case 'ArrowDown': this.moveState.pitchDown = 1; break;

  				case 'ArrowLeft': this.moveState.yawLeft = 1; break;
  				case 'ArrowRight': this.moveState.yawRight = 1; break;

  				case 'KeyQ': this.moveState.rollLeft = 1; break;
  				case 'KeyE': this.moveState.rollRight = 1; break;

  			}

  			this.updateMovementVector();
  			this.updateRotationVector();

  		};

  		this.keyup = function ( event ) {

  			switch ( event.code ) {

  				case 'ShiftLeft':
  				case 'ShiftRight': this.movementSpeedMultiplier = 1; break;

  				case 'KeyW': this.moveState.forward = 0; break;
  				case 'KeyS': this.moveState.back = 0; break;

  				case 'KeyA': this.moveState.left = 0; break;
  				case 'KeyD': this.moveState.right = 0; break;

  				case 'KeyR': this.moveState.up = 0; break;
  				case 'KeyF': this.moveState.down = 0; break;

  				case 'ArrowUp': this.moveState.pitchUp = 0; break;
  				case 'ArrowDown': this.moveState.pitchDown = 0; break;

  				case 'ArrowLeft': this.moveState.yawLeft = 0; break;
  				case 'ArrowRight': this.moveState.yawRight = 0; break;

  				case 'KeyQ': this.moveState.rollLeft = 0; break;
  				case 'KeyE': this.moveState.rollRight = 0; break;

  			}

  			this.updateMovementVector();
  			this.updateRotationVector();

  		};

  		this.mousedown = function ( event ) {

  			if ( this.dragToLook ) {

  				this.mouseStatus ++;

  			} else {

  				switch ( event.button ) {

  					case 0: this.moveState.forward = 1; break;
  					case 2: this.moveState.back = 1; break;

  				}

  				this.updateMovementVector();

  			}

  		};

  		this.mousemove = function ( event ) {

  			if ( ! this.dragToLook || this.mouseStatus > 0 ) {

  				const container = this.getContainerDimensions();
  				const halfWidth = container.size[ 0 ] / 2;
  				const halfHeight = container.size[ 1 ] / 2;

  				this.moveState.yawLeft = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth ) / halfWidth;
  				this.moveState.pitchDown = ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

  				this.updateRotationVector();

  			}

  		};

  		this.mouseup = function ( event ) {

  			if ( this.dragToLook ) {

  				this.mouseStatus --;

  				this.moveState.yawLeft = this.moveState.pitchDown = 0;

  			} else {

  				switch ( event.button ) {

  					case 0: this.moveState.forward = 0; break;
  					case 2: this.moveState.back = 0; break;

  				}

  				this.updateMovementVector();

  			}

  			this.updateRotationVector();

  		};

  		this.update = function ( delta ) {

  			const moveMult = delta * scope.movementSpeed;
  			const rotMult = delta * scope.rollSpeed;

  			scope.object.translateX( scope.moveVector.x * moveMult );
  			scope.object.translateY( scope.moveVector.y * moveMult );
  			scope.object.translateZ( scope.moveVector.z * moveMult );

  			scope.tmpQuaternion.set( scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1 ).normalize();
  			scope.object.quaternion.multiply( scope.tmpQuaternion );

  			if (
  				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
  				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS
  			) {

  				scope.dispatchEvent( _changeEvent );
  				lastQuaternion.copy( scope.object.quaternion );
  				lastPosition.copy( scope.object.position );

  			}

  		};

  		this.updateMovementVector = function () {

  			const forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

  			this.moveVector.x = ( - this.moveState.left + this.moveState.right );
  			this.moveVector.y = ( - this.moveState.down + this.moveState.up );
  			this.moveVector.z = ( - forward + this.moveState.back );

  			//console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

  		};

  		this.updateRotationVector = function () {

  			this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
  			this.rotationVector.y = ( - this.moveState.yawRight + this.moveState.yawLeft );
  			this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

  			//console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

  		};

  		this.getContainerDimensions = function () {

  			if ( this.domElement != document ) {

  				return {
  					size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
  					offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
  				};

  			} else {

  				return {
  					size: [ window.innerWidth, window.innerHeight ],
  					offset: [ 0, 0 ]
  				};

  			}

  		};

  		this.dispose = function () {

  			this.domElement.removeEventListener( 'contextmenu', contextmenu );
  			this.domElement.removeEventListener( 'mousedown', _mousedown );
  			this.domElement.removeEventListener( 'mousemove', _mousemove );
  			this.domElement.removeEventListener( 'mouseup', _mouseup );

  			window.removeEventListener( 'keydown', _keydown );
  			window.removeEventListener( 'keyup', _keyup );

  		};

  		const _mousemove = this.mousemove.bind( this );
  		const _mousedown = this.mousedown.bind( this );
  		const _mouseup = this.mouseup.bind( this );
  		const _keydown = this.keydown.bind( this );
  		const _keyup = this.keyup.bind( this );

  		this.domElement.addEventListener( 'contextmenu', contextmenu );

  		this.domElement.addEventListener( 'mousemove', _mousemove );
  		this.domElement.addEventListener( 'mousedown', _mousedown );
  		this.domElement.addEventListener( 'mouseup', _mouseup );

  		window.addEventListener( 'keydown', _keydown );
  		window.addEventListener( 'keyup', _keyup );

  		this.updateMovementVector();
  		this.updateRotationVector();

  	}

  }

  function contextmenu( event ) {

  	event.preventDefault();

  }

  /**
   * Full-screen textured quad shader
   */

  const CopyShader = {

  	uniforms: {

  		'tDiffuse': { value: null },
  		'opacity': { value: 1.0 }

  	},

  	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  	fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`

  };

  class Pass {

  	constructor() {

  		// if set to true, the pass is processed by the composer
  		this.enabled = true;

  		// if set to true, the pass indicates to swap read and write buffer after rendering
  		this.needsSwap = true;

  		// if set to true, the pass clears its buffer before rendering
  		this.clear = false;

  		// if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
  		this.renderToScreen = false;

  	}

  	setSize( /* width, height */ ) {}

  	render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

  		console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

  	}

  }

  // Helper for passes that need to fill the viewport with a single quad.

  const _camera = new three$1.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

  // https://github.com/mrdoob/three.js/pull/21358

  const _geometry$1 = new three$1.BufferGeometry();
  _geometry$1.setAttribute( 'position', new three$1.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
  _geometry$1.setAttribute( 'uv', new three$1.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

  class FullScreenQuad {

  	constructor( material ) {

  		this._mesh = new three$1.Mesh( _geometry$1, material );

  	}

  	dispose() {

  		this._mesh.geometry.dispose();

  	}

  	render( renderer ) {

  		renderer.render( this._mesh, _camera );

  	}

  	get material() {

  		return this._mesh.material;

  	}

  	set material( value ) {

  		this._mesh.material = value;

  	}

  }

  class ShaderPass extends Pass {

  	constructor( shader, textureID ) {

  		super();

  		this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

  		if ( shader instanceof three$1.ShaderMaterial ) {

  			this.uniforms = shader.uniforms;

  			this.material = shader;

  		} else if ( shader ) {

  			this.uniforms = three$1.UniformsUtils.clone( shader.uniforms );

  			this.material = new three$1.ShaderMaterial( {

  				defines: Object.assign( {}, shader.defines ),
  				uniforms: this.uniforms,
  				vertexShader: shader.vertexShader,
  				fragmentShader: shader.fragmentShader

  			} );

  		}

  		this.fsQuad = new FullScreenQuad( this.material );

  	}

  	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

  		if ( this.uniforms[ this.textureID ] ) {

  			this.uniforms[ this.textureID ].value = readBuffer.texture;

  		}

  		this.fsQuad.material = this.material;

  		if ( this.renderToScreen ) {

  			renderer.setRenderTarget( null );
  			this.fsQuad.render( renderer );

  		} else {

  			renderer.setRenderTarget( writeBuffer );
  			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
  			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
  			this.fsQuad.render( renderer );

  		}

  	}

  }

  class MaskPass extends Pass {

  	constructor( scene, camera ) {

  		super();

  		this.scene = scene;
  		this.camera = camera;

  		this.clear = true;
  		this.needsSwap = false;

  		this.inverse = false;

  	}

  	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

  		const context = renderer.getContext();
  		const state = renderer.state;

  		// don't update color or depth

  		state.buffers.color.setMask( false );
  		state.buffers.depth.setMask( false );

  		// lock buffers

  		state.buffers.color.setLocked( true );
  		state.buffers.depth.setLocked( true );

  		// set up stencil

  		let writeValue, clearValue;

  		if ( this.inverse ) {

  			writeValue = 0;
  			clearValue = 1;

  		} else {

  			writeValue = 1;
  			clearValue = 0;

  		}

  		state.buffers.stencil.setTest( true );
  		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
  		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
  		state.buffers.stencil.setClear( clearValue );
  		state.buffers.stencil.setLocked( true );

  		// draw into the stencil buffer

  		renderer.setRenderTarget( readBuffer );
  		if ( this.clear ) renderer.clear();
  		renderer.render( this.scene, this.camera );

  		renderer.setRenderTarget( writeBuffer );
  		if ( this.clear ) renderer.clear();
  		renderer.render( this.scene, this.camera );

  		// unlock color and depth buffer for subsequent rendering

  		state.buffers.color.setLocked( false );
  		state.buffers.depth.setLocked( false );

  		// only render where stencil is set to 1

  		state.buffers.stencil.setLocked( false );
  		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
  		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
  		state.buffers.stencil.setLocked( true );

  	}

  }

  class ClearMaskPass extends Pass {

  	constructor() {

  		super();

  		this.needsSwap = false;

  	}

  	render( renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

  		renderer.state.buffers.stencil.setLocked( false );
  		renderer.state.buffers.stencil.setTest( false );

  	}

  }

  class EffectComposer {

  	constructor( renderer, renderTarget ) {

  		this.renderer = renderer;

  		if ( renderTarget === undefined ) {

  			const size = renderer.getSize( new three$1.Vector2() );
  			this._pixelRatio = renderer.getPixelRatio();
  			this._width = size.width;
  			this._height = size.height;

  			renderTarget = new three$1.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio );
  			renderTarget.texture.name = 'EffectComposer.rt1';

  		} else {

  			this._pixelRatio = 1;
  			this._width = renderTarget.width;
  			this._height = renderTarget.height;

  		}

  		this.renderTarget1 = renderTarget;
  		this.renderTarget2 = renderTarget.clone();
  		this.renderTarget2.texture.name = 'EffectComposer.rt2';

  		this.writeBuffer = this.renderTarget1;
  		this.readBuffer = this.renderTarget2;

  		this.renderToScreen = true;

  		this.passes = [];

  		// dependencies

  		if ( CopyShader === undefined ) {

  			console.error( 'THREE.EffectComposer relies on CopyShader' );

  		}

  		if ( ShaderPass === undefined ) {

  			console.error( 'THREE.EffectComposer relies on ShaderPass' );

  		}

  		this.copyPass = new ShaderPass( CopyShader );

  		this.clock = new three$1.Clock();

  	}

  	swapBuffers() {

  		const tmp = this.readBuffer;
  		this.readBuffer = this.writeBuffer;
  		this.writeBuffer = tmp;

  	}

  	addPass( pass ) {

  		this.passes.push( pass );
  		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

  	}

  	insertPass( pass, index ) {

  		this.passes.splice( index, 0, pass );
  		pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

  	}

  	removePass( pass ) {

  		const index = this.passes.indexOf( pass );

  		if ( index !== - 1 ) {

  			this.passes.splice( index, 1 );

  		}

  	}

  	isLastEnabledPass( passIndex ) {

  		for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

  			if ( this.passes[ i ].enabled ) {

  				return false;

  			}

  		}

  		return true;

  	}

  	render( deltaTime ) {

  		// deltaTime value is in seconds

  		if ( deltaTime === undefined ) {

  			deltaTime = this.clock.getDelta();

  		}

  		const currentRenderTarget = this.renderer.getRenderTarget();

  		let maskActive = false;

  		for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

  			const pass = this.passes[ i ];

  			if ( pass.enabled === false ) continue;

  			pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
  			pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

  			if ( pass.needsSwap ) {

  				if ( maskActive ) {

  					const context = this.renderer.getContext();
  					const stencil = this.renderer.state.buffers.stencil;

  					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
  					stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

  					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

  					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
  					stencil.setFunc( context.EQUAL, 1, 0xffffffff );

  				}

  				this.swapBuffers();

  			}

  			if ( MaskPass !== undefined ) {

  				if ( pass instanceof MaskPass ) {

  					maskActive = true;

  				} else if ( pass instanceof ClearMaskPass ) {

  					maskActive = false;

  				}

  			}

  		}

  		this.renderer.setRenderTarget( currentRenderTarget );

  	}

  	reset( renderTarget ) {

  		if ( renderTarget === undefined ) {

  			const size = this.renderer.getSize( new three$1.Vector2() );
  			this._pixelRatio = this.renderer.getPixelRatio();
  			this._width = size.width;
  			this._height = size.height;

  			renderTarget = this.renderTarget1.clone();
  			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

  		}

  		this.renderTarget1.dispose();
  		this.renderTarget2.dispose();
  		this.renderTarget1 = renderTarget;
  		this.renderTarget2 = renderTarget.clone();

  		this.writeBuffer = this.renderTarget1;
  		this.readBuffer = this.renderTarget2;

  	}

  	setSize( width, height ) {

  		this._width = width;
  		this._height = height;

  		const effectiveWidth = this._width * this._pixelRatio;
  		const effectiveHeight = this._height * this._pixelRatio;

  		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
  		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

  		for ( let i = 0; i < this.passes.length; i ++ ) {

  			this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

  		}

  	}

  	setPixelRatio( pixelRatio ) {

  		this._pixelRatio = pixelRatio;

  		this.setSize( this._width, this._height );

  	}

  }

  // Helper for passes that need to fill the viewport with a single quad.

  new three$1.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

  // https://github.com/mrdoob/three.js/pull/21358

  const _geometry = new three$1.BufferGeometry();
  _geometry.setAttribute( 'position', new three$1.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );
  _geometry.setAttribute( 'uv', new three$1.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

  class RenderPass extends Pass {

  	constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

  		super();

  		this.scene = scene;
  		this.camera = camera;

  		this.overrideMaterial = overrideMaterial;

  		this.clearColor = clearColor;
  		this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

  		this.clear = true;
  		this.clearDepth = false;
  		this.needsSwap = false;
  		this._oldClearColor = new three$1.Color();

  	}

  	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

  		const oldAutoClear = renderer.autoClear;
  		renderer.autoClear = false;

  		let oldClearAlpha, oldOverrideMaterial;

  		if ( this.overrideMaterial !== undefined ) {

  			oldOverrideMaterial = this.scene.overrideMaterial;

  			this.scene.overrideMaterial = this.overrideMaterial;

  		}

  		if ( this.clearColor ) {

  			renderer.getClearColor( this._oldClearColor );
  			oldClearAlpha = renderer.getClearAlpha();

  			renderer.setClearColor( this.clearColor, this.clearAlpha );

  		}

  		if ( this.clearDepth ) {

  			renderer.clearDepth();

  		}

  		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );

  		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
  		if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
  		renderer.render( this.scene, this.camera );

  		if ( this.clearColor ) {

  			renderer.setClearColor( this._oldClearColor, oldClearAlpha );

  		}

  		if ( this.overrideMaterial !== undefined ) {

  			this.scene.overrideMaterial = oldOverrideMaterial;

  		}

  		renderer.autoClear = oldAutoClear;

  	}

  }

  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };
    return _extends.apply(this, arguments);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct()) {
      _construct = Reflect.construct.bind();
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  // based on https://github.com/styled-components/styled-components/blob/fcf6f3804c57a14dd7984dfab7bc06ee2edca044/src/utils/error.js

  /**
   * Parse errors.md and turn it into a simple hash of code: message
   * @private
   */
  var ERRORS = {
    "1": "Passed invalid arguments to hsl, please pass multiple numbers e.g. hsl(360, 0.75, 0.4) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75 }).\n\n",
    "2": "Passed invalid arguments to hsla, please pass multiple numbers e.g. hsla(360, 0.75, 0.4, 0.7) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75, alpha: 0.7 }).\n\n",
    "3": "Passed an incorrect argument to a color function, please pass a string representation of a color.\n\n",
    "4": "Couldn't generate valid rgb string from %s, it returned %s.\n\n",
    "5": "Couldn't parse the color string. Please provide the color as a string in hex, rgb, rgba, hsl or hsla notation.\n\n",
    "6": "Passed invalid arguments to rgb, please pass multiple numbers e.g. rgb(255, 205, 100) or an object e.g. rgb({ red: 255, green: 205, blue: 100 }).\n\n",
    "7": "Passed invalid arguments to rgba, please pass multiple numbers e.g. rgb(255, 205, 100, 0.75) or an object e.g. rgb({ red: 255, green: 205, blue: 100, alpha: 0.75 }).\n\n",
    "8": "Passed invalid argument to toColorString, please pass a RgbColor, RgbaColor, HslColor or HslaColor object.\n\n",
    "9": "Please provide a number of steps to the modularScale helper.\n\n",
    "10": "Please pass a number or one of the predefined scales to the modularScale helper as the ratio.\n\n",
    "11": "Invalid value passed as base to modularScale, expected number or em string but got \"%s\"\n\n",
    "12": "Expected a string ending in \"px\" or a number passed as the first argument to %s(), got \"%s\" instead.\n\n",
    "13": "Expected a string ending in \"px\" or a number passed as the second argument to %s(), got \"%s\" instead.\n\n",
    "14": "Passed invalid pixel value (\"%s\") to %s(), please pass a value like \"12px\" or 12.\n\n",
    "15": "Passed invalid base value (\"%s\") to %s(), please pass a value like \"12px\" or 12.\n\n",
    "16": "You must provide a template to this method.\n\n",
    "17": "You passed an unsupported selector state to this method.\n\n",
    "18": "minScreen and maxScreen must be provided as stringified numbers with the same units.\n\n",
    "19": "fromSize and toSize must be provided as stringified numbers with the same units.\n\n",
    "20": "expects either an array of objects or a single object with the properties prop, fromSize, and toSize.\n\n",
    "21": "expects the objects in the first argument array to have the properties `prop`, `fromSize`, and `toSize`.\n\n",
    "22": "expects the first argument object to have the properties `prop`, `fromSize`, and `toSize`.\n\n",
    "23": "fontFace expects a name of a font-family.\n\n",
    "24": "fontFace expects either the path to the font file(s) or a name of a local copy.\n\n",
    "25": "fontFace expects localFonts to be an array.\n\n",
    "26": "fontFace expects fileFormats to be an array.\n\n",
    "27": "radialGradient requries at least 2 color-stops to properly render.\n\n",
    "28": "Please supply a filename to retinaImage() as the first argument.\n\n",
    "29": "Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.\n\n",
    "30": "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n",
    "31": "The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation\n\n",
    "32": "To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s')\n\n",
    "33": "The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation\n\n",
    "34": "borderRadius expects a radius value as a string or number as the second argument.\n\n",
    "35": "borderRadius expects one of \"top\", \"bottom\", \"left\" or \"right\" as the first argument.\n\n",
    "36": "Property must be a string value.\n\n",
    "37": "Syntax Error at %s.\n\n",
    "38": "Formula contains a function that needs parentheses at %s.\n\n",
    "39": "Formula is missing closing parenthesis at %s.\n\n",
    "40": "Formula has too many closing parentheses at %s.\n\n",
    "41": "All values in a formula must have the same unit or be unitless.\n\n",
    "42": "Please provide a number of steps to the modularScale helper.\n\n",
    "43": "Please pass a number or one of the predefined scales to the modularScale helper as the ratio.\n\n",
    "44": "Invalid value passed as base to modularScale, expected number or em/rem string but got %s.\n\n",
    "45": "Passed invalid argument to hslToColorString, please pass a HslColor or HslaColor object.\n\n",
    "46": "Passed invalid argument to rgbToColorString, please pass a RgbColor or RgbaColor object.\n\n",
    "47": "minScreen and maxScreen must be provided as stringified numbers with the same units.\n\n",
    "48": "fromSize and toSize must be provided as stringified numbers with the same units.\n\n",
    "49": "Expects either an array of objects or a single object with the properties prop, fromSize, and toSize.\n\n",
    "50": "Expects the objects in the first argument array to have the properties prop, fromSize, and toSize.\n\n",
    "51": "Expects the first argument object to have the properties prop, fromSize, and toSize.\n\n",
    "52": "fontFace expects either the path to the font file(s) or a name of a local copy.\n\n",
    "53": "fontFace expects localFonts to be an array.\n\n",
    "54": "fontFace expects fileFormats to be an array.\n\n",
    "55": "fontFace expects a name of a font-family.\n\n",
    "56": "linearGradient requries at least 2 color-stops to properly render.\n\n",
    "57": "radialGradient requries at least 2 color-stops to properly render.\n\n",
    "58": "Please supply a filename to retinaImage() as the first argument.\n\n",
    "59": "Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.\n\n",
    "60": "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n",
    "61": "Property must be a string value.\n\n",
    "62": "borderRadius expects a radius value as a string or number as the second argument.\n\n",
    "63": "borderRadius expects one of \"top\", \"bottom\", \"left\" or \"right\" as the first argument.\n\n",
    "64": "The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation.\n\n",
    "65": "To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s').\n\n",
    "66": "The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation.\n\n",
    "67": "You must provide a template to this method.\n\n",
    "68": "You passed an unsupported selector state to this method.\n\n",
    "69": "Expected a string ending in \"px\" or a number passed as the first argument to %s(), got %s instead.\n\n",
    "70": "Expected a string ending in \"px\" or a number passed as the second argument to %s(), got %s instead.\n\n",
    "71": "Passed invalid pixel value %s to %s(), please pass a value like \"12px\" or 12.\n\n",
    "72": "Passed invalid base value %s to %s(), please pass a value like \"12px\" or 12.\n\n",
    "73": "Please provide a valid CSS variable.\n\n",
    "74": "CSS variable not found and no default was provided.\n\n",
    "75": "important requires a valid style object, got a %s instead.\n\n",
    "76": "fromSize and toSize must be provided as stringified numbers with the same units as minScreen and maxScreen.\n\n",
    "77": "remToPx expects a value in \"rem\" but you provided it in \"%s\".\n\n",
    "78": "base must be set in \"px\" or \"%\" but you set it in \"%s\".\n"
  };
  /**
   * super basic version of sprintf
   * @private
   */

  function format() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var a = args[0];
    var b = [];
    var c;

    for (c = 1; c < args.length; c += 1) {
      b.push(args[c]);
    }

    b.forEach(function (d) {
      a = a.replace(/%[a-z]/, d);
    });
    return a;
  }
  /**
   * Create an error file out of errors.md for development and a simple web link to the full errors
   * in production mode.
   * @private
   */


  var PolishedError = /*#__PURE__*/function (_Error) {
    _inheritsLoose(PolishedError, _Error);

    function PolishedError(code) {
      var _this;

      if (process.env.NODE_ENV === 'production') {
        _this = _Error.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + code + " for more information.") || this;
      } else {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        _this = _Error.call(this, format.apply(void 0, [ERRORS[code]].concat(args))) || this;
      }

      return _assertThisInitialized(_this);
    }

    return PolishedError;
  }( /*#__PURE__*/_wrapNativeSuper(Error));

  function colorToInt(color) {
    return Math.round(color * 255);
  }

  function convertToInt(red, green, blue) {
    return colorToInt(red) + "," + colorToInt(green) + "," + colorToInt(blue);
  }

  function hslToRgb(hue, saturation, lightness, convert) {
    if (convert === void 0) {
      convert = convertToInt;
    }

    if (saturation === 0) {
      // achromatic
      return convert(lightness, lightness, lightness);
    } // formulae from https://en.wikipedia.org/wiki/HSL_and_HSV


    var huePrime = (hue % 360 + 360) % 360 / 60;
    var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    var secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
    var red = 0;
    var green = 0;
    var blue = 0;

    if (huePrime >= 0 && huePrime < 1) {
      red = chroma;
      green = secondComponent;
    } else if (huePrime >= 1 && huePrime < 2) {
      red = secondComponent;
      green = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
      green = chroma;
      blue = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      green = secondComponent;
      blue = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      red = secondComponent;
      blue = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      red = chroma;
      blue = secondComponent;
    }

    var lightnessModification = lightness - chroma / 2;
    var finalRed = red + lightnessModification;
    var finalGreen = green + lightnessModification;
    var finalBlue = blue + lightnessModification;
    return convert(finalRed, finalGreen, finalBlue);
  }

  var namedColorMap = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '00ffff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000',
    blanchedalmond: 'ffebcd',
    blue: '0000ff',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '00ffff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'ff00ff',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '789',
    lightslategrey: '789',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '0f0',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'f0f',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '639',
    red: 'f00',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'fff',
    whitesmoke: 'f5f5f5',
    yellow: 'ff0',
    yellowgreen: '9acd32'
  };
  /**
   * Checks if a string is a CSS named color and returns its equivalent hex value, otherwise returns the original color.
   * @private
   */

  function nameToHex(color) {
    if (typeof color !== 'string') return color;
    var normalizedColorName = color.toLowerCase();
    return namedColorMap[normalizedColorName] ? "#" + namedColorMap[normalizedColorName] : color;
  }

  var hexRegex = /^#[a-fA-F0-9]{6}$/;
  var hexRgbaRegex = /^#[a-fA-F0-9]{8}$/;
  var reducedHexRegex = /^#[a-fA-F0-9]{3}$/;
  var reducedRgbaHexRegex = /^#[a-fA-F0-9]{4}$/;
  var rgbRegex = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i;
  var rgbaRegex = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
  var hslRegex = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i;
  var hslaRegex = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
  /**
   * Returns an RgbColor or RgbaColor object. This utility function is only useful
   * if want to extract a color component. With the color util `toColorString` you
   * can convert a RgbColor or RgbaColor object back to a string.
   *
   * @example
   * // Assigns `{ red: 255, green: 0, blue: 0 }` to color1
   * const color1 = parseToRgb('rgb(255, 0, 0)');
   * // Assigns `{ red: 92, green: 102, blue: 112, alpha: 0.75 }` to color2
   * const color2 = parseToRgb('hsla(210, 10%, 40%, 0.75)');
   */

  function parseToRgb(color) {
    if (typeof color !== 'string') {
      throw new PolishedError(3);
    }

    var normalizedColor = nameToHex(color);

    if (normalizedColor.match(hexRegex)) {
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[2], 16),
        green: parseInt("" + normalizedColor[3] + normalizedColor[4], 16),
        blue: parseInt("" + normalizedColor[5] + normalizedColor[6], 16)
      };
    }

    if (normalizedColor.match(hexRgbaRegex)) {
      var alpha = parseFloat((parseInt("" + normalizedColor[7] + normalizedColor[8], 16) / 255).toFixed(2));
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[2], 16),
        green: parseInt("" + normalizedColor[3] + normalizedColor[4], 16),
        blue: parseInt("" + normalizedColor[5] + normalizedColor[6], 16),
        alpha: alpha
      };
    }

    if (normalizedColor.match(reducedHexRegex)) {
      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[1], 16),
        green: parseInt("" + normalizedColor[2] + normalizedColor[2], 16),
        blue: parseInt("" + normalizedColor[3] + normalizedColor[3], 16)
      };
    }

    if (normalizedColor.match(reducedRgbaHexRegex)) {
      var _alpha = parseFloat((parseInt("" + normalizedColor[4] + normalizedColor[4], 16) / 255).toFixed(2));

      return {
        red: parseInt("" + normalizedColor[1] + normalizedColor[1], 16),
        green: parseInt("" + normalizedColor[2] + normalizedColor[2], 16),
        blue: parseInt("" + normalizedColor[3] + normalizedColor[3], 16),
        alpha: _alpha
      };
    }

    var rgbMatched = rgbRegex.exec(normalizedColor);

    if (rgbMatched) {
      return {
        red: parseInt("" + rgbMatched[1], 10),
        green: parseInt("" + rgbMatched[2], 10),
        blue: parseInt("" + rgbMatched[3], 10)
      };
    }

    var rgbaMatched = rgbaRegex.exec(normalizedColor.substring(0, 50));

    if (rgbaMatched) {
      return {
        red: parseInt("" + rgbaMatched[1], 10),
        green: parseInt("" + rgbaMatched[2], 10),
        blue: parseInt("" + rgbaMatched[3], 10),
        alpha: parseFloat("" + rgbaMatched[4]) > 1 ? parseFloat("" + rgbaMatched[4]) / 100 : parseFloat("" + rgbaMatched[4])
      };
    }

    var hslMatched = hslRegex.exec(normalizedColor);

    if (hslMatched) {
      var hue = parseInt("" + hslMatched[1], 10);
      var saturation = parseInt("" + hslMatched[2], 10) / 100;
      var lightness = parseInt("" + hslMatched[3], 10) / 100;
      var rgbColorString = "rgb(" + hslToRgb(hue, saturation, lightness) + ")";
      var hslRgbMatched = rgbRegex.exec(rgbColorString);

      if (!hslRgbMatched) {
        throw new PolishedError(4, normalizedColor, rgbColorString);
      }

      return {
        red: parseInt("" + hslRgbMatched[1], 10),
        green: parseInt("" + hslRgbMatched[2], 10),
        blue: parseInt("" + hslRgbMatched[3], 10)
      };
    }

    var hslaMatched = hslaRegex.exec(normalizedColor.substring(0, 50));

    if (hslaMatched) {
      var _hue = parseInt("" + hslaMatched[1], 10);

      var _saturation = parseInt("" + hslaMatched[2], 10) / 100;

      var _lightness = parseInt("" + hslaMatched[3], 10) / 100;

      var _rgbColorString = "rgb(" + hslToRgb(_hue, _saturation, _lightness) + ")";

      var _hslRgbMatched = rgbRegex.exec(_rgbColorString);

      if (!_hslRgbMatched) {
        throw new PolishedError(4, normalizedColor, _rgbColorString);
      }

      return {
        red: parseInt("" + _hslRgbMatched[1], 10),
        green: parseInt("" + _hslRgbMatched[2], 10),
        blue: parseInt("" + _hslRgbMatched[3], 10),
        alpha: parseFloat("" + hslaMatched[4]) > 1 ? parseFloat("" + hslaMatched[4]) / 100 : parseFloat("" + hslaMatched[4])
      };
    }

    throw new PolishedError(5);
  }

  /**
   * Reduces hex values if possible e.g. #ff8866 to #f86
   * @private
   */
  var reduceHexValue = function reduceHexValue(value) {
    if (value.length === 7 && value[1] === value[2] && value[3] === value[4] && value[5] === value[6]) {
      return "#" + value[1] + value[3] + value[5];
    }

    return value;
  };

  var reduceHexValue$1 = reduceHexValue;

  function numberToHex(value) {
    var hex = value.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  /**
   * Returns a string value for the color. The returned result is the smallest possible hex notation.
   *
   * @example
   * // Styles as object usage
   * const styles = {
   *   background: rgb(255, 205, 100),
   *   background: rgb({ red: 255, green: 205, blue: 100 }),
   * }
   *
   * // styled-components usage
   * const div = styled.div`
   *   background: ${rgb(255, 205, 100)};
   *   background: ${rgb({ red: 255, green: 205, blue: 100 })};
   * `
   *
   * // CSS in JS Output
   *
   * element {
   *   background: "#ffcd64";
   *   background: "#ffcd64";
   * }
   */
  function rgb(value, green, blue) {
    if (typeof value === 'number' && typeof green === 'number' && typeof blue === 'number') {
      return reduceHexValue$1("#" + numberToHex(value) + numberToHex(green) + numberToHex(blue));
    } else if (typeof value === 'object' && green === undefined && blue === undefined) {
      return reduceHexValue$1("#" + numberToHex(value.red) + numberToHex(value.green) + numberToHex(value.blue));
    }

    throw new PolishedError(6);
  }

  /**
   * Returns a string value for the color. The returned result is the smallest possible rgba or hex notation.
   *
   * Can also be used to fade a color by passing a hex value or named CSS color along with an alpha value.
   *
   * @example
   * // Styles as object usage
   * const styles = {
   *   background: rgba(255, 205, 100, 0.7),
   *   background: rgba({ red: 255, green: 205, blue: 100, alpha: 0.7 }),
   *   background: rgba(255, 205, 100, 1),
   *   background: rgba('#ffffff', 0.4),
   *   background: rgba('black', 0.7),
   * }
   *
   * // styled-components usage
   * const div = styled.div`
   *   background: ${rgba(255, 205, 100, 0.7)};
   *   background: ${rgba({ red: 255, green: 205, blue: 100, alpha: 0.7 })};
   *   background: ${rgba(255, 205, 100, 1)};
   *   background: ${rgba('#ffffff', 0.4)};
   *   background: ${rgba('black', 0.7)};
   * `
   *
   * // CSS in JS Output
   *
   * element {
   *   background: "rgba(255,205,100,0.7)";
   *   background: "rgba(255,205,100,0.7)";
   *   background: "#ffcd64";
   *   background: "rgba(255,255,255,0.4)";
   *   background: "rgba(0,0,0,0.7)";
   * }
   */
  function rgba(firstValue, secondValue, thirdValue, fourthValue) {
    if (typeof firstValue === 'string' && typeof secondValue === 'number') {
      var rgbValue = parseToRgb(firstValue);
      return "rgba(" + rgbValue.red + "," + rgbValue.green + "," + rgbValue.blue + "," + secondValue + ")";
    } else if (typeof firstValue === 'number' && typeof secondValue === 'number' && typeof thirdValue === 'number' && typeof fourthValue === 'number') {
      return fourthValue >= 1 ? rgb(firstValue, secondValue, thirdValue) : "rgba(" + firstValue + "," + secondValue + "," + thirdValue + "," + fourthValue + ")";
    } else if (typeof firstValue === 'object' && secondValue === undefined && thirdValue === undefined && fourthValue === undefined) {
      return firstValue.alpha >= 1 ? rgb(firstValue.red, firstValue.green, firstValue.blue) : "rgba(" + firstValue.red + "," + firstValue.green + "," + firstValue.blue + "," + firstValue.alpha + ")";
    }

    throw new PolishedError(7);
  }

  // Type definitions taken from https://github.com/gcanti/flow-static-land/blob/master/src/Fun.js
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-redeclare
  function curried(f, length, acc) {
    return function fn() {
      // eslint-disable-next-line prefer-rest-params
      var combined = acc.concat(Array.prototype.slice.call(arguments));
      return combined.length >= length ? f.apply(this, combined) : curried(f, length, combined);
    };
  } // eslint-disable-next-line no-redeclare


  function curry(f) {
    // eslint-disable-line no-redeclare
    return curried(f, f.length, []);
  }

  function guard(lowerBoundary, upperBoundary, value) {
    return Math.max(lowerBoundary, Math.min(upperBoundary, value));
  }

  /**
   * Increases the opacity of a color. Its range for the amount is between 0 to 1.
   *
   *
   * @example
   * // Styles as object usage
   * const styles = {
   *   background: opacify(0.1, 'rgba(255, 255, 255, 0.9)');
   *   background: opacify(0.2, 'hsla(0, 0%, 100%, 0.5)'),
   *   background: opacify('0.5', 'rgba(255, 0, 0, 0.2)'),
   * }
   *
   * // styled-components usage
   * const div = styled.div`
   *   background: ${opacify(0.1, 'rgba(255, 255, 255, 0.9)')};
   *   background: ${opacify(0.2, 'hsla(0, 0%, 100%, 0.5)')},
   *   background: ${opacify('0.5', 'rgba(255, 0, 0, 0.2)')},
   * `
   *
   * // CSS in JS Output
   *
   * element {
   *   background: "#fff";
   *   background: "rgba(255,255,255,0.7)";
   *   background: "rgba(255,0,0,0.7)";
   * }
   */

  function opacify(amount, color) {
    if (color === 'transparent') return color;
    var parsedColor = parseToRgb(color);
    var alpha = typeof parsedColor.alpha === 'number' ? parsedColor.alpha : 1;

    var colorWithAlpha = _extends({}, parsedColor, {
      alpha: guard(0, 1, (alpha * 100 + parseFloat(amount) * 100) / 100)
    });

    return rgba(colorWithAlpha);
  } // prettier-ignore


  var curriedOpacify = /*#__PURE__*/curry
  /* ::<number | string, string, string> */
  (opacify);
  var curriedOpacify$1 = curriedOpacify;

  /**
   * The Ease class provides a collection of easing functions for use with tween.js.
   */
  var Easing = {
      Linear: {
          None: function (amount) {
              return amount;
          },
      },
      Quadratic: {
          In: function (amount) {
              return amount * amount;
          },
          Out: function (amount) {
              return amount * (2 - amount);
          },
          InOut: function (amount) {
              if ((amount *= 2) < 1) {
                  return 0.5 * amount * amount;
              }
              return -0.5 * (--amount * (amount - 2) - 1);
          },
      },
      Cubic: {
          In: function (amount) {
              return amount * amount * amount;
          },
          Out: function (amount) {
              return --amount * amount * amount + 1;
          },
          InOut: function (amount) {
              if ((amount *= 2) < 1) {
                  return 0.5 * amount * amount * amount;
              }
              return 0.5 * ((amount -= 2) * amount * amount + 2);
          },
      },
      Quartic: {
          In: function (amount) {
              return amount * amount * amount * amount;
          },
          Out: function (amount) {
              return 1 - --amount * amount * amount * amount;
          },
          InOut: function (amount) {
              if ((amount *= 2) < 1) {
                  return 0.5 * amount * amount * amount * amount;
              }
              return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
          },
      },
      Quintic: {
          In: function (amount) {
              return amount * amount * amount * amount * amount;
          },
          Out: function (amount) {
              return --amount * amount * amount * amount * amount + 1;
          },
          InOut: function (amount) {
              if ((amount *= 2) < 1) {
                  return 0.5 * amount * amount * amount * amount * amount;
              }
              return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
          },
      },
      Sinusoidal: {
          In: function (amount) {
              return 1 - Math.cos((amount * Math.PI) / 2);
          },
          Out: function (amount) {
              return Math.sin((amount * Math.PI) / 2);
          },
          InOut: function (amount) {
              return 0.5 * (1 - Math.cos(Math.PI * amount));
          },
      },
      Exponential: {
          In: function (amount) {
              return amount === 0 ? 0 : Math.pow(1024, amount - 1);
          },
          Out: function (amount) {
              return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
          },
          InOut: function (amount) {
              if (amount === 0) {
                  return 0;
              }
              if (amount === 1) {
                  return 1;
              }
              if ((amount *= 2) < 1) {
                  return 0.5 * Math.pow(1024, amount - 1);
              }
              return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
          },
      },
      Circular: {
          In: function (amount) {
              return 1 - Math.sqrt(1 - amount * amount);
          },
          Out: function (amount) {
              return Math.sqrt(1 - --amount * amount);
          },
          InOut: function (amount) {
              if ((amount *= 2) < 1) {
                  return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
              }
              return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
          },
      },
      Elastic: {
          In: function (amount) {
              if (amount === 0) {
                  return 0;
              }
              if (amount === 1) {
                  return 1;
              }
              return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
          },
          Out: function (amount) {
              if (amount === 0) {
                  return 0;
              }
              if (amount === 1) {
                  return 1;
              }
              return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
          },
          InOut: function (amount) {
              if (amount === 0) {
                  return 0;
              }
              if (amount === 1) {
                  return 1;
              }
              amount *= 2;
              if (amount < 1) {
                  return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
              }
              return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
          },
      },
      Back: {
          In: function (amount) {
              var s = 1.70158;
              return amount * amount * ((s + 1) * amount - s);
          },
          Out: function (amount) {
              var s = 1.70158;
              return --amount * amount * ((s + 1) * amount + s) + 1;
          },
          InOut: function (amount) {
              var s = 1.70158 * 1.525;
              if ((amount *= 2) < 1) {
                  return 0.5 * (amount * amount * ((s + 1) * amount - s));
              }
              return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
          },
      },
      Bounce: {
          In: function (amount) {
              return 1 - Easing.Bounce.Out(1 - amount);
          },
          Out: function (amount) {
              if (amount < 1 / 2.75) {
                  return 7.5625 * amount * amount;
              }
              else if (amount < 2 / 2.75) {
                  return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
              }
              else if (amount < 2.5 / 2.75) {
                  return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
              }
              else {
                  return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
              }
          },
          InOut: function (amount) {
              if (amount < 0.5) {
                  return Easing.Bounce.In(amount * 2) * 0.5;
              }
              return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
          },
      },
  };

  var now;
  // Include a performance.now polyfill.
  // In node.js, use process.hrtime.
  // eslint-disable-next-line
  // @ts-ignore
  if (typeof self === 'undefined' && typeof process !== 'undefined' && process.hrtime) {
      now = function () {
          // eslint-disable-next-line
          // @ts-ignore
          var time = process.hrtime();
          // Convert [seconds, nanoseconds] to milliseconds.
          return time[0] * 1000 + time[1] / 1000000;
      };
  }
  // In a browser, use self.performance.now if it is available.
  else if (typeof self !== 'undefined' && self.performance !== undefined && self.performance.now !== undefined) {
      // This must be bound, because directly assigning this function
      // leads to an invocation exception in Chrome.
      now = self.performance.now.bind(self.performance);
  }
  // Use Date.now if it is available.
  else if (Date.now !== undefined) {
      now = Date.now;
  }
  // Otherwise, use 'new Date().getTime()'.
  else {
      now = function () {
          return new Date().getTime();
      };
  }
  var now$1 = now;

  /**
   * Controlling groups of tweens
   *
   * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
   * In these cases, you may want to create your own smaller groups of tween
   */
  var Group = /** @class */ (function () {
      function Group() {
          this._tweens = {};
          this._tweensAddedDuringUpdate = {};
      }
      Group.prototype.getAll = function () {
          var _this = this;
          return Object.keys(this._tweens).map(function (tweenId) {
              return _this._tweens[tweenId];
          });
      };
      Group.prototype.removeAll = function () {
          this._tweens = {};
      };
      Group.prototype.add = function (tween) {
          this._tweens[tween.getId()] = tween;
          this._tweensAddedDuringUpdate[tween.getId()] = tween;
      };
      Group.prototype.remove = function (tween) {
          delete this._tweens[tween.getId()];
          delete this._tweensAddedDuringUpdate[tween.getId()];
      };
      Group.prototype.update = function (time, preserve) {
          if (time === void 0) { time = now$1(); }
          if (preserve === void 0) { preserve = false; }
          var tweenIds = Object.keys(this._tweens);
          if (tweenIds.length === 0) {
              return false;
          }
          // Tweens are updated in "batches". If you add a new tween during an
          // update, then the new tween will be updated in the next batch.
          // If you remove a tween during an update, it may or may not be updated.
          // However, if the removed tween was added during the current batch,
          // then it will not be updated.
          while (tweenIds.length > 0) {
              this._tweensAddedDuringUpdate = {};
              for (var i = 0; i < tweenIds.length; i++) {
                  var tween = this._tweens[tweenIds[i]];
                  var autoStart = !preserve;
                  if (tween && tween.update(time, autoStart) === false && !preserve) {
                      delete this._tweens[tweenIds[i]];
                  }
              }
              tweenIds = Object.keys(this._tweensAddedDuringUpdate);
          }
          return true;
      };
      return Group;
  }());

  /**
   *
   */
  var Interpolation = {
      Linear: function (v, k) {
          var m = v.length - 1;
          var f = m * k;
          var i = Math.floor(f);
          var fn = Interpolation.Utils.Linear;
          if (k < 0) {
              return fn(v[0], v[1], f);
          }
          if (k > 1) {
              return fn(v[m], v[m - 1], m - f);
          }
          return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
      },
      Bezier: function (v, k) {
          var b = 0;
          var n = v.length - 1;
          var pw = Math.pow;
          var bn = Interpolation.Utils.Bernstein;
          for (var i = 0; i <= n; i++) {
              b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
          }
          return b;
      },
      CatmullRom: function (v, k) {
          var m = v.length - 1;
          var f = m * k;
          var i = Math.floor(f);
          var fn = Interpolation.Utils.CatmullRom;
          if (v[0] === v[m]) {
              if (k < 0) {
                  i = Math.floor((f = m * (1 + k)));
              }
              return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
          }
          else {
              if (k < 0) {
                  return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
              }
              if (k > 1) {
                  return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
              }
              return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
          }
      },
      Utils: {
          Linear: function (p0, p1, t) {
              return (p1 - p0) * t + p0;
          },
          Bernstein: function (n, i) {
              var fc = Interpolation.Utils.Factorial;
              return fc(n) / fc(i) / fc(n - i);
          },
          Factorial: (function () {
              var a = [1];
              return function (n) {
                  var s = 1;
                  if (a[n]) {
                      return a[n];
                  }
                  for (var i = n; i > 1; i--) {
                      s *= i;
                  }
                  a[n] = s;
                  return s;
              };
          })(),
          CatmullRom: function (p0, p1, p2, p3, t) {
              var v0 = (p2 - p0) * 0.5;
              var v1 = (p3 - p1) * 0.5;
              var t2 = t * t;
              var t3 = t * t2;
              return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
          },
      },
  };

  /**
   * Utils
   */
  var Sequence = /** @class */ (function () {
      function Sequence() {
      }
      Sequence.nextId = function () {
          return Sequence._nextId++;
      };
      Sequence._nextId = 0;
      return Sequence;
  }());

  var mainGroup = new Group();

  /**
   * Tween.js - Licensed under the MIT license
   * https://github.com/tweenjs/tween.js
   * ----------------------------------------------
   *
   * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
   * Thank you all, you're awesome!
   */
  var Tween = /** @class */ (function () {
      function Tween(_object, _group) {
          if (_group === void 0) { _group = mainGroup; }
          this._object = _object;
          this._group = _group;
          this._isPaused = false;
          this._pauseStart = 0;
          this._valuesStart = {};
          this._valuesEnd = {};
          this._valuesStartRepeat = {};
          this._duration = 1000;
          this._initialRepeat = 0;
          this._repeat = 0;
          this._yoyo = false;
          this._isPlaying = false;
          this._reversed = false;
          this._delayTime = 0;
          this._startTime = 0;
          this._easingFunction = Easing.Linear.None;
          this._interpolationFunction = Interpolation.Linear;
          this._chainedTweens = [];
          this._onStartCallbackFired = false;
          this._id = Sequence.nextId();
          this._isChainStopped = false;
          this._goToEnd = false;
      }
      Tween.prototype.getId = function () {
          return this._id;
      };
      Tween.prototype.isPlaying = function () {
          return this._isPlaying;
      };
      Tween.prototype.isPaused = function () {
          return this._isPaused;
      };
      Tween.prototype.to = function (properties, duration) {
          // TODO? restore this, then update the 07_dynamic_to example to set fox
          // tween's to on each update. That way the behavior is opt-in (there's
          // currently no opt-out).
          // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
          this._valuesEnd = Object.create(properties);
          if (duration !== undefined) {
              this._duration = duration;
          }
          return this;
      };
      Tween.prototype.duration = function (d) {
          this._duration = d;
          return this;
      };
      Tween.prototype.start = function (time) {
          if (this._isPlaying) {
              return this;
          }
          // eslint-disable-next-line
          this._group && this._group.add(this);
          this._repeat = this._initialRepeat;
          if (this._reversed) {
              // If we were reversed (f.e. using the yoyo feature) then we need to
              // flip the tween direction back to forward.
              this._reversed = false;
              for (var property in this._valuesStartRepeat) {
                  this._swapEndStartRepeatValues(property);
                  this._valuesStart[property] = this._valuesStartRepeat[property];
              }
          }
          this._isPlaying = true;
          this._isPaused = false;
          this._onStartCallbackFired = false;
          this._isChainStopped = false;
          this._startTime = time !== undefined ? (typeof time === 'string' ? now$1() + parseFloat(time) : time) : now$1();
          this._startTime += this._delayTime;
          this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
          return this;
      };
      Tween.prototype._setupProperties = function (_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
          for (var property in _valuesEnd) {
              var startValue = _object[property];
              var startValueIsArray = Array.isArray(startValue);
              var propType = startValueIsArray ? 'array' : typeof startValue;
              var isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
              // If `to()` specifies a property that doesn't exist in the source object,
              // we should not set that property in the object
              if (propType === 'undefined' || propType === 'function') {
                  continue;
              }
              // Check if an Array was provided as property value
              if (isInterpolationList) {
                  var endValues = _valuesEnd[property];
                  if (endValues.length === 0) {
                      continue;
                  }
                  // handle an array of relative values
                  endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
                  // Create a local copy of the Array with the start value at the front
                  _valuesEnd[property] = [startValue].concat(endValues);
              }
              // handle the deepness of the values
              if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                  _valuesStart[property] = startValueIsArray ? [] : {};
                  // eslint-disable-next-line
                  for (var prop in startValue) {
                      // eslint-disable-next-line
                      // @ts-ignore FIXME?
                      _valuesStart[property][prop] = startValue[prop];
                  }
                  _valuesStartRepeat[property] = startValueIsArray ? [] : {}; // TODO? repeat nested values? And yoyo? And array values?
                  // eslint-disable-next-line
                  // @ts-ignore FIXME?
                  this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
              }
              else {
                  // Save the starting value, but only once.
                  if (typeof _valuesStart[property] === 'undefined') {
                      _valuesStart[property] = startValue;
                  }
                  if (!startValueIsArray) {
                      // eslint-disable-next-line
                      // @ts-ignore FIXME?
                      _valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
                  }
                  if (isInterpolationList) {
                      // eslint-disable-next-line
                      // @ts-ignore FIXME?
                      _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
                  }
                  else {
                      _valuesStartRepeat[property] = _valuesStart[property] || 0;
                  }
              }
          }
      };
      Tween.prototype.stop = function () {
          if (!this._isChainStopped) {
              this._isChainStopped = true;
              this.stopChainedTweens();
          }
          if (!this._isPlaying) {
              return this;
          }
          // eslint-disable-next-line
          this._group && this._group.remove(this);
          this._isPlaying = false;
          this._isPaused = false;
          if (this._onStopCallback) {
              this._onStopCallback(this._object);
          }
          return this;
      };
      Tween.prototype.end = function () {
          this._goToEnd = true;
          this.update(Infinity);
          return this;
      };
      Tween.prototype.pause = function (time) {
          if (time === void 0) { time = now$1(); }
          if (this._isPaused || !this._isPlaying) {
              return this;
          }
          this._isPaused = true;
          this._pauseStart = time;
          // eslint-disable-next-line
          this._group && this._group.remove(this);
          return this;
      };
      Tween.prototype.resume = function (time) {
          if (time === void 0) { time = now$1(); }
          if (!this._isPaused || !this._isPlaying) {
              return this;
          }
          this._isPaused = false;
          this._startTime += time - this._pauseStart;
          this._pauseStart = 0;
          // eslint-disable-next-line
          this._group && this._group.add(this);
          return this;
      };
      Tween.prototype.stopChainedTweens = function () {
          for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
              this._chainedTweens[i].stop();
          }
          return this;
      };
      Tween.prototype.group = function (group) {
          this._group = group;
          return this;
      };
      Tween.prototype.delay = function (amount) {
          this._delayTime = amount;
          return this;
      };
      Tween.prototype.repeat = function (times) {
          this._initialRepeat = times;
          this._repeat = times;
          return this;
      };
      Tween.prototype.repeatDelay = function (amount) {
          this._repeatDelayTime = amount;
          return this;
      };
      Tween.prototype.yoyo = function (yoyo) {
          this._yoyo = yoyo;
          return this;
      };
      Tween.prototype.easing = function (easingFunction) {
          this._easingFunction = easingFunction;
          return this;
      };
      Tween.prototype.interpolation = function (interpolationFunction) {
          this._interpolationFunction = interpolationFunction;
          return this;
      };
      Tween.prototype.chain = function () {
          var tweens = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              tweens[_i] = arguments[_i];
          }
          this._chainedTweens = tweens;
          return this;
      };
      Tween.prototype.onStart = function (callback) {
          this._onStartCallback = callback;
          return this;
      };
      Tween.prototype.onUpdate = function (callback) {
          this._onUpdateCallback = callback;
          return this;
      };
      Tween.prototype.onRepeat = function (callback) {
          this._onRepeatCallback = callback;
          return this;
      };
      Tween.prototype.onComplete = function (callback) {
          this._onCompleteCallback = callback;
          return this;
      };
      Tween.prototype.onStop = function (callback) {
          this._onStopCallback = callback;
          return this;
      };
      /**
       * @returns true if the tween is still playing after the update, false
       * otherwise (calling update on a paused tween still returns true because
       * it is still playing, just paused).
       */
      Tween.prototype.update = function (time, autoStart) {
          if (time === void 0) { time = now$1(); }
          if (autoStart === void 0) { autoStart = true; }
          if (this._isPaused)
              return true;
          var property;
          var elapsed;
          var endTime = this._startTime + this._duration;
          if (!this._goToEnd && !this._isPlaying) {
              if (time > endTime)
                  return false;
              if (autoStart)
                  this.start(time);
          }
          this._goToEnd = false;
          if (time < this._startTime) {
              return true;
          }
          if (this._onStartCallbackFired === false) {
              if (this._onStartCallback) {
                  this._onStartCallback(this._object);
              }
              this._onStartCallbackFired = true;
          }
          elapsed = (time - this._startTime) / this._duration;
          elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
          var value = this._easingFunction(elapsed);
          // properties transformations
          this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
          if (this._onUpdateCallback) {
              this._onUpdateCallback(this._object, elapsed);
          }
          if (elapsed === 1) {
              if (this._repeat > 0) {
                  if (isFinite(this._repeat)) {
                      this._repeat--;
                  }
                  // Reassign starting values, restart by making startTime = now
                  for (property in this._valuesStartRepeat) {
                      if (!this._yoyo && typeof this._valuesEnd[property] === 'string') {
                          this._valuesStartRepeat[property] =
                              // eslint-disable-next-line
                              // @ts-ignore FIXME?
                              this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                      }
                      if (this._yoyo) {
                          this._swapEndStartRepeatValues(property);
                      }
                      this._valuesStart[property] = this._valuesStartRepeat[property];
                  }
                  if (this._yoyo) {
                      this._reversed = !this._reversed;
                  }
                  if (this._repeatDelayTime !== undefined) {
                      this._startTime = time + this._repeatDelayTime;
                  }
                  else {
                      this._startTime = time + this._delayTime;
                  }
                  if (this._onRepeatCallback) {
                      this._onRepeatCallback(this._object);
                  }
                  return true;
              }
              else {
                  if (this._onCompleteCallback) {
                      this._onCompleteCallback(this._object);
                  }
                  for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                      // Make the chained tweens start exactly at the time they should,
                      // even if the `update()` method was called way past the duration of the tween
                      this._chainedTweens[i].start(this._startTime + this._duration);
                  }
                  this._isPlaying = false;
                  return false;
              }
          }
          return true;
      };
      Tween.prototype._updateProperties = function (_object, _valuesStart, _valuesEnd, value) {
          for (var property in _valuesEnd) {
              // Don't update properties that do not exist in the source object
              if (_valuesStart[property] === undefined) {
                  continue;
              }
              var start = _valuesStart[property] || 0;
              var end = _valuesEnd[property];
              var startIsArray = Array.isArray(_object[property]);
              var endIsArray = Array.isArray(end);
              var isInterpolationList = !startIsArray && endIsArray;
              if (isInterpolationList) {
                  _object[property] = this._interpolationFunction(end, value);
              }
              else if (typeof end === 'object' && end) {
                  // eslint-disable-next-line
                  // @ts-ignore FIXME?
                  this._updateProperties(_object[property], start, end, value);
              }
              else {
                  // Parses relative end values with start as base (e.g.: +10, -3)
                  end = this._handleRelativeValue(start, end);
                  // Protect against non numeric properties.
                  if (typeof end === 'number') {
                      // eslint-disable-next-line
                      // @ts-ignore FIXME?
                      _object[property] = start + (end - start) * value;
                  }
              }
          }
      };
      Tween.prototype._handleRelativeValue = function (start, end) {
          if (typeof end !== 'string') {
              return end;
          }
          if (end.charAt(0) === '+' || end.charAt(0) === '-') {
              return start + parseFloat(end);
          }
          else {
              return parseFloat(end);
          }
      };
      Tween.prototype._swapEndStartRepeatValues = function (property) {
          var tmp = this._valuesStartRepeat[property];
          var endValue = this._valuesEnd[property];
          if (typeof endValue === 'string') {
              this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
          }
          else {
              this._valuesStartRepeat[property] = this._valuesEnd[property];
          }
          this._valuesEnd[property] = tmp;
      };
      return Tween;
  }());

  var VERSION = '18.6.4';

  /**
   * Tween.js - Licensed under the MIT license
   * https://github.com/tweenjs/tween.js
   * ----------------------------------------------
   *
   * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
   * Thank you all, you're awesome!
   */
  var nextId = Sequence.nextId;
  /**
   * Controlling groups of tweens
   *
   * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
   * In these cases, you may want to create your own smaller groups of tweens.
   */
  var TWEEN = mainGroup;
  // This is the best way to export things in a way that's compatible with both ES
  // Modules and CommonJS, without build hacks, and so as not to break the
  // existing API.
  // https://github.com/rollup/rollup/issues/1961#issuecomment-423037881
  var getAll = TWEEN.getAll.bind(TWEEN);
  var removeAll = TWEEN.removeAll.bind(TWEEN);
  var add = TWEEN.add.bind(TWEEN);
  var remove = TWEEN.remove.bind(TWEEN);
  var update = TWEEN.update.bind(TWEEN);
  var exports$1 = {
      Easing: Easing,
      Group: Group,
      Interpolation: Interpolation,
      now: now$1,
      Sequence: Sequence,
      nextId: nextId,
      Tween: Tween,
      VERSION: VERSION,
      getAll: getAll,
      removeAll: removeAll,
      add: add,
      remove: remove,
      update: update,
  };

  var index$1 = (function (p) {
    return p instanceof Function ? p // fn
    : typeof p === 'string' ? function (obj) {
      return obj[p];
    } // property name
    : function (obj) {
      return p;
    };
  }); // constant

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing. The function also has a property 'clear' 
   * that is a function which will clear the timer to prevent previously scheduled executions. 
   *
   * @source underscore.js
   * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
   * @param {Function} function to wrap
   * @param {Number} timeout in ms (`100`)
   * @param {Boolean} whether to execute at the beginning (`false`)
   * @api public
   */

  function debounce(func, wait, immediate){
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    }
    var debounced = function(){
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };

    debounced.clear = function() {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };
    
    debounced.flush = function() {
      if (timeout) {
        result = func.apply(context, args);
        context = args = null;
        
        clearTimeout(timeout);
        timeout = null;
      }
    };

    return debounced;
  }
  // Adds compatibility for ES modules
  debounce.debounce = debounce;

  var debounce_1 = debounce;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var Prop = /*#__PURE__*/_createClass(function Prop(name, _ref) {
    var _ref$default = _ref["default"],
        defaultVal = _ref$default === void 0 ? null : _ref$default,
        _ref$triggerUpdate = _ref.triggerUpdate,
        triggerUpdate = _ref$triggerUpdate === void 0 ? true : _ref$triggerUpdate,
        _ref$onChange = _ref.onChange,
        onChange = _ref$onChange === void 0 ? function (newVal, state) {} : _ref$onChange;

    _classCallCheck(this, Prop);

    this.name = name;
    this.defaultVal = defaultVal;
    this.triggerUpdate = triggerUpdate;
    this.onChange = onChange;
  });

  function index (_ref2) {
    var _ref2$stateInit = _ref2.stateInit,
        stateInit = _ref2$stateInit === void 0 ? function () {
      return {};
    } : _ref2$stateInit,
        _ref2$props = _ref2.props,
        rawProps = _ref2$props === void 0 ? {} : _ref2$props,
        _ref2$methods = _ref2.methods,
        methods = _ref2$methods === void 0 ? {} : _ref2$methods,
        _ref2$aliases = _ref2.aliases,
        aliases = _ref2$aliases === void 0 ? {} : _ref2$aliases,
        _ref2$init = _ref2.init,
        initFn = _ref2$init === void 0 ? function () {} : _ref2$init,
        _ref2$update = _ref2.update,
        updateFn = _ref2$update === void 0 ? function () {} : _ref2$update;
    // Parse props into Prop instances
    var props = Object.keys(rawProps).map(function (propName) {
      return new Prop(propName, rawProps[propName]);
    });
    return function () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // Holds component state
      var state = Object.assign({}, stateInit instanceof Function ? stateInit(options) : stateInit, // Support plain objects for backwards compatibility
      {
        initialised: false
      }); // keeps track of which props triggered an update

      var changedProps = {}; // Component constructor

      function comp(nodeElement) {
        initStatic(nodeElement, options);
        digest();
        return comp;
      }

      var initStatic = function initStatic(nodeElement, options) {
        initFn.call(comp, nodeElement, state, options);
        state.initialised = true;
      };

      var digest = debounce_1(function () {
        if (!state.initialised) {
          return;
        }

        updateFn.call(comp, state, changedProps);
        changedProps = {};
      }, 1); // Getter/setter methods

      props.forEach(function (prop) {
        comp[prop.name] = getSetProp(prop);

        function getSetProp(_ref3) {
          var prop = _ref3.name,
              _ref3$triggerUpdate = _ref3.triggerUpdate,
              redigest = _ref3$triggerUpdate === void 0 ? false : _ref3$triggerUpdate,
              _ref3$onChange = _ref3.onChange,
              onChange = _ref3$onChange === void 0 ? function (newVal, state) {} : _ref3$onChange,
              _ref3$defaultVal = _ref3.defaultVal,
              defaultVal = _ref3$defaultVal === void 0 ? null : _ref3$defaultVal;
          return function (_) {
            var curVal = state[prop];

            if (!arguments.length) {
              return curVal;
            } // Getter mode


            var val = _ === undefined ? defaultVal : _; // pick default if value passed is undefined

            state[prop] = val;
            onChange.call(comp, val, state, curVal); // track changed props

            !changedProps.hasOwnProperty(prop) && (changedProps[prop] = curVal);

            if (redigest) {
              digest();
            }

            return comp;
          };
        }
      }); // Other methods

      Object.keys(methods).forEach(function (methodName) {
        comp[methodName] = function () {
          var _methods$methodName;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_methods$methodName = methods[methodName]).call.apply(_methods$methodName, [comp, state].concat(args));
        };
      }); // Link aliases

      Object.entries(aliases).forEach(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            alias = _ref5[0],
            target = _ref5[1];

        return comp[alias] = comp[target];
      }); // Reset all component props to their default value

      comp.resetProps = function () {
        props.forEach(function (prop) {
          comp[prop.name](prop.defaultVal);
        });
        return comp;
      }; //


      comp.resetProps(); // Apply all prop defaults

      state._rerender = digest; // Expose digest method

      return comp;
    };
  }

  var three = window.THREE ? window.THREE // Prefer consumption from global THREE, if exists
  : {
    WebGLRenderer: three$1.WebGLRenderer,
    Scene: three$1.Scene,
    PerspectiveCamera: three$1.PerspectiveCamera,
    Raycaster: three$1.Raycaster,
    TextureLoader: three$1.TextureLoader,
    Vector2: three$1.Vector2,
    Vector3: three$1.Vector3,
    Box3: three$1.Box3,
    Color: three$1.Color,
    Mesh: three$1.Mesh,
    SphereGeometry: three$1.SphereGeometry,
    MeshBasicMaterial: three$1.MeshBasicMaterial,
    BackSide: three$1.BackSide,
    EventDispatcher: three$1.EventDispatcher,
    MOUSE: three$1.MOUSE,
    Quaternion: three$1.Quaternion,
    Spherical: three$1.Spherical,
    Clock: three$1.Clock
  };
  var threeRenderObjects = index({
    props: {
      width: {
        "default": window.innerWidth,
        onChange: function onChange(width, state, prevWidth) {
          isNaN(width) && (state.width = prevWidth);
        }
      },
      height: {
        "default": window.innerHeight,
        onChange: function onChange(height, state, prevHeight) {
          isNaN(height) && (state.height = prevHeight);
        }
      },
      backgroundColor: {
        "default": '#000011'
      },
      backgroundImageUrl: {},
      onBackgroundImageLoaded: {},
      showNavInfo: {
        "default": true
      },
      skyRadius: {
        "default": 50000
      },
      objects: {
        "default": []
      },
      enablePointerInteraction: {
        "default": true,
        onChange: function onChange(_, state) {
          // Reset hover state
          state.hoverObj = null;
          if (state.toolTipElem) state.toolTipElem.innerHTML = '';
        },
        triggerUpdate: false
      },
      lineHoverPrecision: {
        "default": 1,
        triggerUpdate: false
      },
      hoverOrderComparator: {
        "default": function _default() {
          return -1;
        },
        triggerUpdate: false
      },
      // keep existing order by default
      hoverFilter: {
        "default": function _default() {
          return true;
        },
        triggerUpdate: false
      },
      // exclude objects from interaction
      tooltipContent: {
        triggerUpdate: false
      },
      hoverDuringDrag: {
        "default": false,
        triggerUpdate: false
      },
      clickAfterDrag: {
        "default": false,
        triggerUpdate: false
      },
      onHover: {
        "default": function _default() {},
        triggerUpdate: false
      },
      onClick: {
        "default": function _default() {},
        triggerUpdate: false
      },
      onRightClick: {
        triggerUpdate: false
      }
    },
    methods: {
      tick: function tick(state) {
        if (state.initialised) {
          state.controls.update && state.controls.update(state.clock.getDelta()); // timedelta is required for fly controls

          state.extraRenderers.forEach(function (r) {
            return r.render(state.scene, state.camera);
          });
          state.postProcessingComposer ? state.postProcessingComposer.render() // if using postprocessing, switch the output to it
          : state.extraRenderers[0].render(state.scene, state.camera);

          if (state.enablePointerInteraction) {
            // Update tooltip and trigger onHover events
            var topObject = null;

            if (state.hoverDuringDrag || !state.isPointerDragging) {
              var intersects = this.intersectingObjects(state.pointerPos.x, state.pointerPos.y).filter(function (d) {
                return state.hoverFilter(d.object);
              }).sort(function (a, b) {
                return state.hoverOrderComparator(a.object, b.object);
              });
              var topIntersect = intersects.length ? intersects[0] : null;
              topObject = topIntersect ? topIntersect.object : null;
              state.intersectionPoint = topIntersect ? topIntersect.point : null;
            }

            if (topObject !== state.hoverObj) {
              state.onHover(topObject, state.hoverObj);
              state.toolTipElem.innerHTML = topObject ? index$1(state.tooltipContent)(topObject) || '' : '';
              state.hoverObj = topObject;
            }
          }

          exports$1.update(); // update camera animation tweens
        }

        return this;
      },
      getPointerPos: function getPointerPos(state) {
        var _state$pointerPos = state.pointerPos,
            x = _state$pointerPos.x,
            y = _state$pointerPos.y;
        return {
          x: x,
          y: y
        };
      },
      cameraPosition: function cameraPosition(state, position, lookAt, transitionDuration) {
        var camera = state.camera; // Setter

        if (position && state.initialised) {
          var finalPos = position;
          var finalLookAt = lookAt || {
            x: 0,
            y: 0,
            z: 0
          };

          if (!transitionDuration) {
            // no animation
            setCameraPos(finalPos);
            setLookAt(finalLookAt);
          } else {
            var camPos = Object.assign({}, camera.position);
            var camLookAt = getLookAt();
            new exports$1.Tween(camPos).to(finalPos, transitionDuration).easing(exports$1.Easing.Quadratic.Out).onUpdate(setCameraPos).start(); // Face direction in 1/3rd of time

            new exports$1.Tween(camLookAt).to(finalLookAt, transitionDuration / 3).easing(exports$1.Easing.Quadratic.Out).onUpdate(setLookAt).start();
          }

          return this;
        } // Getter


        return Object.assign({}, camera.position, {
          lookAt: getLookAt()
        }); //

        function setCameraPos(pos) {
          var x = pos.x,
              y = pos.y,
              z = pos.z;
          if (x !== undefined) camera.position.x = x;
          if (y !== undefined) camera.position.y = y;
          if (z !== undefined) camera.position.z = z;
        }

        function setLookAt(lookAt) {
          var lookAtVect = new three.Vector3(lookAt.x, lookAt.y, lookAt.z);

          if (state.controls.target) {
            state.controls.target = lookAtVect;
          } else {
            // Fly controls doesn't have target attribute
            camera.lookAt(lookAtVect); // note: lookAt may be overridden by other controls in some cases
          }
        }

        function getLookAt() {
          return Object.assign(new three.Vector3(0, 0, -1000).applyQuaternion(camera.quaternion).add(camera.position));
        }
      },
      zoomToFit: function zoomToFit(state) {
        var transitionDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var padding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

        for (var _len = arguments.length, bboxArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          bboxArgs[_key - 3] = arguments[_key];
        }

        return this.fitToBbox(this.getBbox.apply(this, bboxArgs), transitionDuration, padding);
      },
      fitToBbox: function fitToBbox(state, bbox) {
        var transitionDuration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var padding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
        // based on https://discourse.threejs.org/t/camera-zoom-to-fit-object/936/24
        var camera = state.camera;

        if (bbox) {
          var center = new three.Vector3(0, 0, 0); // reset camera aim to center

          var maxBoxSide = Math.max.apply(Math, _toConsumableArray(Object.entries(bbox).map(function (_ref) {
            var _ref2 = _slicedToArray$1(_ref, 2),
                coordType = _ref2[0],
                coords = _ref2[1];

            return Math.max.apply(Math, _toConsumableArray(coords.map(function (c) {
              return Math.abs(center[coordType] - c);
            })));
          }))) * 2; // find distance that fits whole bbox within padded fov

          var paddedFov = (1 - padding * 2 / state.height) * camera.fov;
          var fitHeightDistance = maxBoxSide / Math.atan(paddedFov * Math.PI / 180);
          var fitWidthDistance = fitHeightDistance / camera.aspect;
          var distance = Math.max(fitHeightDistance, fitWidthDistance);

          if (distance > 0) {
            var newCameraPosition = center.clone().sub(camera.position).normalize().multiplyScalar(-distance);
            this.cameraPosition(newCameraPosition, center, transitionDuration);
          }
        }

        return this;
      },
      getBbox: function getBbox(state) {
        var objFilter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
          return true;
        };
        var box = new three.Box3(new three.Vector3(0, 0, 0), new three.Vector3(0, 0, 0));
        var objs = state.objects.filter(objFilter);
        if (!objs.length) return null;
        objs.forEach(function (obj) {
          return box.expandByObject(obj);
        }); // extract global x,y,z min/max

        return Object.assign.apply(Object, _toConsumableArray(['x', 'y', 'z'].map(function (c) {
          return _defineProperty({}, c, [box.min[c], box.max[c]]);
        })));
      },
      getScreenCoords: function getScreenCoords(state, x, y, z) {
        var vec = new three.Vector3(x, y, z);
        vec.project(this.camera()); // project to the camera plane

        return {
          // align relative pos to canvas dimensions
          x: (vec.x + 1) * state.width / 2,
          y: -(vec.y - 1) * state.height / 2
        };
      },
      getSceneCoords: function getSceneCoords(state, screenX, screenY) {
        var distance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var relCoords = new three.Vector2(screenX / state.width * 2 - 1, -(screenY / state.height) * 2 + 1);
        var raycaster = new three.Raycaster();
        raycaster.setFromCamera(relCoords, state.camera);
        return Object.assign({}, raycaster.ray.at(distance, new three.Vector3()));
      },
      intersectingObjects: function intersectingObjects(state, x, y) {
        var relCoords = new three.Vector2(x / state.width * 2 - 1, -(y / state.height) * 2 + 1);
        var raycaster = new three.Raycaster();
        raycaster.params.Line.threshold = state.lineHoverPrecision; // set linePrecision

        raycaster.setFromCamera(relCoords, state.camera);
        return raycaster.intersectObjects(state.objects, true);
      },
      renderer: function renderer(state) {
        return state.renderer;
      },
      scene: function scene(state) {
        return state.scene;
      },
      camera: function camera(state) {
        return state.camera;
      },
      postProcessingComposer: function postProcessingComposer(state) {
        return state.postProcessingComposer;
      },
      controls: function controls(state) {
        return state.controls;
      },
      tbControls: function tbControls(state) {
        return state.controls;
      } // to be deprecated

    },
    stateInit: function stateInit() {
      return {
        scene: new three.Scene(),
        camera: new three.PerspectiveCamera(),
        clock: new three.Clock()
      };
    },
    init: function init(domNode, state) {
      var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref4$controlType = _ref4.controlType,
          controlType = _ref4$controlType === void 0 ? 'trackball' : _ref4$controlType,
          _ref4$rendererConfig = _ref4.rendererConfig,
          rendererConfig = _ref4$rendererConfig === void 0 ? {} : _ref4$rendererConfig,
          _ref4$extraRenderers = _ref4.extraRenderers,
          extraRenderers = _ref4$extraRenderers === void 0 ? [] : _ref4$extraRenderers,
          _ref4$waitForLoadComp = _ref4.waitForLoadComplete,
          waitForLoadComplete = _ref4$waitForLoadComp === void 0 ? true : _ref4$waitForLoadComp;

      // Wipe DOM
      domNode.innerHTML = ''; // Add relative container

      domNode.appendChild(state.container = document.createElement('div'));
      state.container.className = 'scene-container';
      state.container.style.position = 'relative'; // Add nav info section

      state.container.appendChild(state.navInfo = document.createElement('div'));
      state.navInfo.className = 'scene-nav-info';
      state.navInfo.textContent = {
        orbit: 'Left-click: rotate, Mouse-wheel/middle-click: zoom, Right-click: pan',
        trackball: 'Left-click: rotate, Mouse-wheel/middle-click: zoom, Right-click: pan',
        fly: 'WASD: move, R|F: up | down, Q|E: roll, up|down: pitch, left|right: yaw'
      }[controlType] || '';
      state.navInfo.style.display = state.showNavInfo ? null : 'none'; // Setup tooltip

      state.toolTipElem = document.createElement('div');
      state.toolTipElem.classList.add('scene-tooltip');
      state.container.appendChild(state.toolTipElem); // Capture pointer coords on move or touchstart

      state.pointerPos = new three.Vector2();
      state.pointerPos.x = -2; // Initialize off canvas

      state.pointerPos.y = -2;
      ['pointermove', 'pointerdown'].forEach(function (evType) {
        return state.container.addEventListener(evType, function (ev) {
          // track click state
          evType === 'pointerdown' && (state.isPointerPressed = true); // detect point drag

          !state.isPointerDragging && ev.type === 'pointermove' && (ev.pressure > 0 || state.isPointerPressed) // ev.pressure always 0 on Safari, so we used the isPointerPressed tracker
          && (ev.pointerType !== 'touch' || ev.movementX === undefined || [ev.movementX, ev.movementY].some(function (m) {
            return Math.abs(m) > 1;
          })) // relax drag trigger sensitivity on touch events
          && (state.isPointerDragging = true);

          if (state.enablePointerInteraction) {
            // update the pointer pos
            var offset = getOffset(state.container);
            state.pointerPos.x = ev.pageX - offset.left;
            state.pointerPos.y = ev.pageY - offset.top; // Move tooltip

            state.toolTipElem.style.top = "".concat(state.pointerPos.y, "px");
            state.toolTipElem.style.left = "".concat(state.pointerPos.x, "px"); // adjust horizontal position to not exceed canvas boundaries

            state.toolTipElem.style.transform = "translate(-".concat(state.pointerPos.x / state.width * 100, "%, ").concat( // flip to above if near bottom
            state.height - state.pointerPos.y < 100 ? 'calc(-100% - 8px)' : '21px', ")");
          }

          function getOffset(el) {
            var rect = el.getBoundingClientRect(),
                scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
                scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            return {
              top: rect.top + scrollTop,
              left: rect.left + scrollLeft
            };
          }
        }, {
          passive: true
        });
      }); // Handle click events on objs

      state.container.addEventListener('pointerup', function (ev) {
        state.isPointerPressed = false;

        if (state.isPointerDragging) {
          state.isPointerDragging = false;
          if (!state.clickAfterDrag) return; // don't trigger onClick after pointer drag (camera motion via controls)
        }

        requestAnimationFrame(function () {
          // trigger click events asynchronously, to allow hoverObj to be set (on frame)
          if (ev.button === 0) {
            // left-click
            state.onClick(state.hoverObj || null, ev, state.intersectionPoint); // trigger background clicks with null
          }

          if (ev.button === 2 && state.onRightClick) {
            // right-click
            state.onRightClick(state.hoverObj || null, ev, state.intersectionPoint);
          }
        });
      }, {
        passive: true,
        capture: true
      }); // use capture phase to prevent propagation blocking from controls (specifically for fly)

      state.container.addEventListener('contextmenu', function (ev) {
        if (state.onRightClick) ev.preventDefault(); // prevent default contextmenu behavior and allow pointerup to fire instead
      }); // Setup renderer, camera and controls

      state.renderer = new three.WebGLRenderer(Object.assign({
        antialias: true,
        alpha: true
      }, rendererConfig));
      state.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio)); // clamp device pixel ratio

      state.renderer.domElement.style.zIndex = 1;
      state.renderer.setClearColor(0x000000, 0);
      state.renderer.domElement.style.position = 'absolute';
      state.renderer.domElement.style.top = 0; // state.container.appendChild(state.renderer.domElement); // Setup extra renderers

      state.extraRenderers = extraRenderers;
      state.extraRenderers.forEach(function (r) {
        // overlay them on top of main renderer
        r.domElement.style.pointerEvents = 'none';
        r.domElement.appendChild(state.renderer.domElement);
        state.container.appendChild(r.domElement);
      }); // configure post-processing composer

      state.postProcessingComposer = new EffectComposer(state.extraRenderers[0]);
      state.postProcessingComposer.addPass(new RenderPass(state.scene, state.camera)); // render scene as first pass
      // configure controls

      state.controls = new {
        trackball: TrackballControls,
        orbit: OrbitControls,
        fly: FlyControls
      }[controlType](state.camera, state.extraRenderers[0].domElement);

      if (controlType === 'fly') {
        state.controls.movementSpeed = 300;
        state.controls.rollSpeed = Math.PI / 6;
        state.controls.dragToLook = true;
      }

      if (controlType === 'trackball' || controlType === 'orbit') {
        state.controls.minDistance = 0.1;
        state.controls.maxDistance = state.skyRadius;
        state.controls.addEventListener('start', function () {
          state.controlsEngaged = true;
        });
        state.controls.addEventListener('change', function () {
          if (state.controlsEngaged) {
            state.controlsDragging = true;
          }
        });
        state.controls.addEventListener('end', function () {
          state.controlsEngaged = false;
          state.controlsDragging = false;
        });
      }

      [state.renderer, state.postProcessingComposer].concat(_toConsumableArray(state.extraRenderers)).forEach(function (r) {
        return r.setSize(state.width, state.height);
      });
      state.camera.aspect = state.width / state.height;
      state.camera.updateProjectionMatrix();
      state.camera.position.z = 1000; // add sky

      state.scene.add(state.skysphere = new three.Mesh());
      state.skysphere.visible = false;
      state.loadComplete = state.scene.visible = !waitForLoadComplete;
      window.scene = state.scene;
    },
    update: function update(state, changedProps) {
      // resize canvas
      if (state.width && state.height && (changedProps.hasOwnProperty('width') || changedProps.hasOwnProperty('height'))) {
        state.container.style.width = "".concat(state.width, "px");
        state.container.style.height = "".concat(state.height, "px");
        [state.renderer, state.postProcessingComposer].concat(_toConsumableArray(state.extraRenderers)).forEach(function (r) {
          return r.setSize(state.width, state.height);
        });
        state.camera.aspect = state.width / state.height;
        state.camera.updateProjectionMatrix();
      }

      if (changedProps.hasOwnProperty('skyRadius') && state.skyRadius) {
        state.controls.hasOwnProperty('maxDistance') && changedProps.skyRadius && (state.controls.maxDistance = Math.min(state.controls.maxDistance, state.skyRadius));
        state.camera.far = state.skyRadius * 2.5;
        state.camera.updateProjectionMatrix();
        state.skysphere.geometry = new three.SphereGeometry(state.skyRadius);
      }

      if (changedProps.hasOwnProperty('backgroundColor')) {
        var alpha = parseToRgb(state.backgroundColor).alpha;
        if (alpha === undefined) alpha = 1;
        state.extraRenderers[0].setClearColor(new three.Color(curriedOpacify$1(1, state.backgroundColor)), alpha);
      }

      if (changedProps.hasOwnProperty('backgroundImageUrl')) {
        if (!state.backgroundImageUrl) {
          state.skysphere.visible = false;
          state.skysphere.material.map = null;
          !state.loadComplete && finishLoad();
        } else {
          new three.TextureLoader().load(state.backgroundImageUrl, function (texture) {
            state.skysphere.material = new three.MeshBasicMaterial({
              map: texture,
              side: three.BackSide
            });
            state.skysphere.visible = true; // triggered when background image finishes loading (asynchronously to allow 1 frame to load texture)

            state.onBackgroundImageLoaded && setTimeout(state.onBackgroundImageLoaded);
            !state.loadComplete && finishLoad();
          });
        }
      }

      changedProps.hasOwnProperty('showNavInfo') && (state.navInfo.style.display = state.showNavInfo ? null : 'none');

      if (changedProps.hasOwnProperty('objects')) {
        (changedProps.objects || []).forEach(function (obj) {
          return state.scene.remove(obj);
        }); // Clear the place

        state.objects.forEach(function (obj) {
          return state.scene.add(obj);
        }); // Add to scene
      } //


      function finishLoad() {
        state.loadComplete = state.scene.visible = true;
      }
    }
  });

  return threeRenderObjects;

}));
//# sourceMappingURL=three-render-objects.js.map
