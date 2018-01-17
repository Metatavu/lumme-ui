/* jshint esversion: 6 */
/* global $, _, tinycolor, L, moment, Snap, mina, Promise */
(() => {
  'use strict';
  
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
        ]
      },
      animated: {
        "eyeleft": {
          "selector": "#eyeleft",
          "versions": {
            "lookright": {
              selector: "#eyeleft-lookright"
            }
          }
        },
        "eyeright": {
          "selector": "#eyeright",
          "versions": {
            "lookright": {
              selector: "#eyeright-lookright"
            }
          }
        },
        "handright": {
          "selector": "#handright",
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
            }
          }
        }
      }
    },
    
    _create : function() {
      this.svg = document.getElementById("Layer_1");
      this.animated = {
        
      };
      
      _.forEach(this.options.animated, (options, name) => {
        const defaultElement = Snap.select(options.selector);
        const versionDatas = {};
        versionDatas['default'] = {
          path: this.getAbsolutePath(defaultElement)
        };
          
        _.forEach(options.versions, (versionOptions, version) => {
          if (versionOptions.selector) {
            const versionElement = Snap.select(versionOptions.selector);
            versionDatas[version] = {
              path: this.getAbsolutePath(versionElement)
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
          this.animate(['handright'], 'handonside', duration || 400);
        break;
        case 'waist':
          this.animate(['handright'], 'handonwaist', duration || 400);
        break;
      }
    },
    
    look: function (where, duration) {
      switch (where) {
        case 'right':
          this.animate(['eyeleft', 'eyeright'], 'lookright', duration || 400);        
        break;
        default:
          this.animate(['eyeleft', 'eyeright'], 'default', duration || 400);
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
    
    animateConnections: function (duration) {
      Snap.animate(0, 1, () => { this.updateConnections(); }, duration);
    },
    
    animate: function (names, version, animationDuration) {
      return new Promise((resolve) => {
        (_.isArray(names) ? names : [names]).forEach((name) => {
          const options = this.animated[name];
          const duration = animationDuration || 500;
          const easing = mina.easeout;
          const element = Snap.select(options.selector);
          const versionData = options.versionDatas[version];
          const versionOptions = this.options.animated[name].versions[version];

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
          }

          if (transforms.length || versionData) {
            const animateOptions = {};

            if (versionData && versionData.path) {
              animateOptions.d = versionData.path;
            }

            if (transforms.length) {
              animateOptions.transform = transforms.join(' ');
            }

            element.stop().animate(animateOptions, duration, () => {
              resolve();
            });
            this.animateConnections(duration);
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
      
      return path.map((segment) => {
        if (segment.indexOf('m') === 0) {
          segment[1] += x;
          segment[2] += y;
          return segment;
        }
        
        return segment;
      }).join(' ');
    },
    
    updateConnections: function () {
      _.forEach(this.options.derived, (parts, selector) => {

        const segments = parts.map((part) => {
          const params = part.elements.map((element) => {
            const center = this.getAbsoluteCenter(Snap.select(element));
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
      const transformX = element.transform().globalMatrix.x(0, 0);
      const transformY = element.transform().globalMatrix.y(0, 0);
      
      return {
        x: element.transform().globalMatrix.x(bbox.cx, bbox.cy),
        y: element.transform().globalMatrix.y(bbox.cx, bbox.cy)
      };
    }
  });
  
  $(document).ready(() => {
    $(document).viksu();
    
    $(document).viksu('hands', 'sides', 0); 
    
    setTimeout(() => {
       $(document).viksu('waveHand', 3, 300)
         .then(() => {
           $(document).viksu('look', 'right', 1000); 
           $(document).viksu('hands', 'waist', 1000); 
         });
    }, 1000);
  });
  
})();