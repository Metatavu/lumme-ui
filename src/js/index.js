/* jshint esversion: 6 */
/* global $, _, tinycolor, L, moment, Snap, mina, Promise */
(() => {
  'use strict';
  
  const WOBBLE_SPEED = 500;
  const WOBBLE_ROTATE = 3;
  const WOBBLE_LIFT = 5;
  const WOBBLE_HAND_DELTA_X = 4;
  const WOBBLE_HAND_X = 0;
  const WOBBLE_HAND_Y = 0;
  const WOBBLE_HAND_ROTATE = 0;
  
  $.widget("custom.viksu", {
    
    options: {
      derived: {
        "#armright": [
          {
            "command": "M",
            "elements": ["#shoulderright"]
          },
          {
            "command": "C",
            "elements": ["#elbowright", "#elbowright", "#wristjointright"]
          }
        ],
        "#legright": [
          {
            "command": "M",
            "elements": ["#hipjointright"]
          },
          {
            "command": "C",
            "elements": ["#kneeright", "#kneeright", "#footrightjoint"]
          }
        ],
        "#legleft": [
          {
            "command": "M",
            "elements": ["#hipjointleft"]
          },
          {
            "command": "C",
            "elements": ["#kneeleft", "#kneeleft", "#footleftjoint"]
          }
        ]
      },
      
      animated: {
        "head": {
          "selector": "#head",
          "versions": {
            "default": {
              "rotate": "0",
              "move": {
                "x": 0,
                "y": 0
              }
            },
            "idleleft": {
              "rotate": -WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            },
            "idleright": {
              "rotate": WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            }
          }
        },
        "face": {
          "selector": "#face",
          "versions": {
            "default": {
              "rotate": "0",
              "move": {
                "x": 0,
                "y": 0
              }
            },
            "idleleft": {
              "rotate": -WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            },
            "idleright": {
              "rotate": WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            }
          }
        },
        "body": {
          "selector": "#body",
          "derived": ["#armright", "#legright", "#legleft"],
          "versions": {
            "default": {
              "move": {
                "x": 0,
                "y": 0
              }
            },
            "idleleft": {
              "rotate": -WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            },
            "idleright": {
              "rotate": WOBBLE_ROTATE,
              "move": {
                "x": 0,
                "y": -WOBBLE_LIFT
              }
            }
          }
        },
        "eyeleft": {
          "selector": "#eyeleft",
          "versions": {
            "lookright": {
              "moveTo": "#eyeleft-lookright"
            },
            "lookup": {
              "moveTo": "#eyeleft-up"
            }
          }
        },
        "eyeright": {
          "selector": "#eyeright",
          "versions": {
            "lookright": {
              "moveTo": "#eyeright-lookright"
            },
            "lookup": {
              "moveTo": "#eyeright-up"
            }
          }
        },
        "eyebrowleft": {
          "selector": "#eyebrowleft",
          "versions": {
            "lookright": {
              "moveTo": "#eyebrowleft-lookright"
            },
            "lookup": {
              "moveTo": "#eyebrowleft-up"
            }
          }
        },
        "eyebrowright": {
          "selector": "#eyebrowright",
          "absolutePath": false,
          "strokeOpacity": 0,
          "versions": {
            "lookup": {
              "strokeOpacity": 1
            }
          }
        },
        "handright": {
          "selector": "#handright",
          "derived": ["#armright"],
          "versions": {
            "handonwaist": {
              "rotate": 180,
              "rotateAround": "#wristjointright",
              "moveTo": "#wristjointright-handonwaist"
            },
            "handonside": {
              "rotate": 70,
              "rotateAround": "#wristjointright",
              "moveTo": "#wristjointright-handonside"
            },
            "waveleft": {
              "rotate": "-20",
              "rotateAround": "#wristjointright"
            },
            "waveright": {
              "rotate": "0",
              "rotateAround": "#wristjointright"
            }/**
            "default": {
              "rotate": WOBBLE_HAND_ROTATE,
              "moveAbs": {
                "x": WOBBLE_HAND_X,
                "y": WOBBLE_HAND_Y
              }
            },
            "idleright": {
              "rotate": WOBBLE_HAND_ROTATE - 2,
              "moveAbs": {
                "x": WOBBLE_HAND_X - WOBBLE_HAND_DELTA_X,
                "y": WOBBLE_HAND_Y
              }
            },
            "idleleft": {
              "rotate": WOBBLE_HAND_ROTATE + 2,
              "moveAbs": {
                "x": WOBBLE_HAND_X + WOBBLE_HAND_DELTA_X,
                "y": WOBBLE_HAND_Y
              }
            }**/
          }
        }
      }
    },
    
    _create : function() {
      this.svg = document.getElementById("Layer_1");
      this.animated = { };
      
      _.forEach(this.options.animated, (options, name) => {
        const defaultElement = Snap.select(options.selector);
        if (!defaultElement) {
          console.log(options.selector);
          return;
        }
        
        const versionDatas = {};
        versionDatas['default'] = {
          path: options.absolutePath ? this.getAbsolutePath(defaultElement) : this.getPath(defaultElement)
        };
          
        _.forEach(options.versions, (versionOptions, version) => {
          if (versionOptions.selector) {
            const versionElement = Snap.select(versionOptions.selector);
            versionDatas[version] = {
              path: options.absolutePath ? this.getAbsolutePath(versionElement) : this.getPath(versionElement)
            };
          }
        });
        
        this.animated[name] = {
          selector: options.selector,
          versionDatas: versionDatas
        };
      });
    },
    
    hands: function (where, duration) {
      switch (where) {
        case 'sides':
          return this.animate(['handright'], 'handonside', duration || 400);
        break;
        case 'waist':
          return this.animate(['handright'], 'handonwaist', duration || 400);
        break;
      }
    },
    
    look: function (where, duration) {
      switch (where) {
        case 'right':
          return this.animate(['eyeleft', 'eyeright', 'eyebrowleft', 'eyebrowright'], 'lookright', duration || 400);        
        break;
        case 'up':
          return this.animate(['eyeleft', 'eyeright', 'eyebrowleft', 'eyebrowright'], 'lookup', duration || 400);        
        break;
        default:
          return this.animate(['eyeleft', 'eyeright', 'eyebrowleft', 'eyebrowright'], 'default', duration || 400);
        break;
      }
    },
    
    waveHand: function (times, duration) {
      let resultPromise = this.waveHandOnce(duration);
      
      for (let i = 1; i < times; i++) {
        resultPromise = resultPromise.then(() => {
          return this.waveHandOnce(duration);
        });
      }
      
      return Promise.resolve(resultPromise);
    },
    
    waveHandOnce: function (duration) {
      return this.animate(['handright'], 'waveleft', duration || 400)
        .then(() => {
          return this.animate(['handright'], 'waveright', duration || 400);
        });
    },
    
    wobble: function () {
      const parts = ['head', 'face', 'body', 'handright'];
      
      this.animate(parts, 'idleright', WOBBLE_SPEED)
        .then(() => {
          this.animate(parts, 'default', WOBBLE_SPEED)
            .then(() => {
              this.animate(parts, 'idleleft', WOBBLE_SPEED)
                .then(() => {
                  this.animate(parts, 'default', WOBBLE_SPEED)
                    .then(() => {
                      this.wobble();
                    });
                });
            });
        });
    },
    
    animateConnections: function (derivedSelectors, duration) {
      if (derivedSelectors && derivedSelectors.length) {
        const derived = {};    
        derivedSelectors.forEach((derivedSelector) => {
          derived[derivedSelector] = this.options.derived[derivedSelector];
        });
            
        Snap.animate(0, 100, (progress) => { 
          if (progress % 2 == 1) {
            this.updateConnections(derived);
          }
        }, duration);
      }
    },
    
    animate: function (names, version, animationDuration) {
      return new Promise((resolve) => {
        (_.isArray(names) ? names : [names]).forEach((name) => {
          const options = this.animated[name];
          const duration = animationDuration || 500;
          const easing = mina.easeout;
          const element = Snap.select(options.selector);
          const versionData = options.versionDatas[version];
          const versionOptions = this.options.animated[name].versions[version] || {};
          const strokeOpacity = versionOptions.strokeOpacity !== undefined ? versionOptions.strokeOpacity : this.options.animated[name].strokeOpacity;

          let transforms = [];

          if (versionOptions.rotate !== undefined) {
            const bbox = (versionOptions.rotateAround ? Snap.select(versionOptions.rotateAround) : element).getBBox();
            transforms.push(`R ${versionOptions.rotate},${bbox.cx}, ${bbox.cy}`);
          }

          if (versionOptions.moveTo !== undefined) {
            const moveToElement = Snap.select(versionOptions.moveTo);
            const moveToBBox = moveToElement.getBBox();
            const elementBBox = element.getBBox();
            transforms.push(`T ${moveToBBox.cx - elementBBox.cx}, ${moveToBBox.cy - elementBBox.cy}`);
          } else if (versionOptions.move !== undefined) {  
            transforms.push(`t ${versionOptions.move.x}, ${versionOptions.move.y}`);
          }
          
          if (transforms.length || versionData || strokeOpacity) {
            const animateOptions = {};

            if (versionData && versionData.path) {
              animateOptions.d = versionData.path;
            }

            if (transforms.length) {
              animateOptions.transform = transforms.join(' ');
            }
            
            if (strokeOpacity !== undefined) {
              animateOptions['stroke-opacity'] = strokeOpacity;
            }

            element.animate(animateOptions, duration, () => {
              resolve();
            });
            
            this.animateConnections(this.options.animated[name].derived, duration);
          }
        });        
      });
    },
    
    getAbsolutePath: function (element) {
      const d = element.attr('d');
      if (!d) {
        return null;
      }
      
      const path = Snap.parsePathString(d);
      const transform = Snap.parseTransformString(element.attr('transform'));
      const x = element.transform().globalMatrix.x(0, 0);
      const y = element.transform().globalMatrix.y(0, 0);
      const layerOffset = this.getLayerOffset();
      
      return path.map((segment) => {
        if (segment.indexOf('m') === 0) {
          segment[1] += x - layerOffset.x;
          segment[2] += y - layerOffset.y;
          return segment;
        }
        
        return segment;
      }).join(' ');
    },
    
    getPath: function (element) {
      const d = element.attr('d');
      if (!d) {
        return null;
      }
      
      return d;
    },
    
    updateConnections: function (derived) {
      _.forEach(derived, (parts, selector) => {

        const segments = parts.map((part) => {
          const params = part.elements.map((elementSelector) => {
            const element = Snap.select(elementSelector);
            if (!element) {
              console.log(`Could not find ${elementSelector}`);
            }
            
            const center = this.getAbsoluteCenter(element);
            return [center.x, center.y].join(',');
          });
          
          return `${part.command} ${params.join(' ')}`;
        });
        
        const d = segments.join(' ');
        Snap.select(selector).attr('d', d);
      });
    },
    
    getAbsoluteCenter: function (element) {
      const transform = element.transform();
      const bbox = element.getBBox();
      const layerOffset = this.getLayerOffset();
      
      return {
        x: element.transform().globalMatrix.x(bbox.cx, bbox.cy) - layerOffset.x,
        y: element.transform().globalMatrix.y(bbox.cx, bbox.cy) - layerOffset.y
      };
    },
    
    getLayerOffset: function () {
      const layer = Snap.select('#layer1');
      
      return {
        x: layer.transform().globalMatrix.x(0, 0),
        y: layer.transform().globalMatrix.y(0, 0)
      };
    }
    
  });
  
  $(document).ready(() => {
    $(document).viksu();
    $(document).viksu('hands', 'waist', 0);
    $(document).viksu('look', 'right', 0); 
    $(document).viksu('wobble');
  });
  
})();