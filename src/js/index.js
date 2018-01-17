/* jshint esversion: 6 */
/* global $, _, tinycolor, L, moment, Snap, mina */
(() => {
  'use strict';
  
  /**
 
s = Snap(svg); 
  **/
 
  $.widget("custom.viksu", {
    
    options: {
      animated: {/**
        "eyeleft": {
          "selector": "#eyeleft",
          "versions": {
            "v2": {
              selector: "#eyeleft2"
            }
          }
        },
        "eyeright": {
          "selector": "#eyeright",
          "versions": {
            "v2": {
              selector: "#eyeright2"
            }
          }
        },**/
        "handright": {
          "selector": "#handright",
          "versions": {
            "v2": {
              "rotate": 45,
              "rotateAround": "#handjointright",
              "moveTo": "#handjointright2"
            },
            "v3": {
              "rotate": 0,
              "rotateAround": "#handjointright"
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
        console.log(options);
        
        const v1Element = Snap.select(options.selector);
        const versionDatas = {};
        versionDatas['v1'] = {
          path: this.getPath(v1Element)
        };
          
        _.forEach(options.versions, (versionOptions, version) => {
          if (versionOptions.selector) {
            const versionElement = Snap.select(versionOptions.selector);
            versionDatas[version] = {
              path: this.getPath(versionElement)
            };
          }
        });
        
        this.animated[name] = {
          selector: options.selector,
          versionDatas: versionDatas
        };
      });
      
      console.log(this.animated);
      
      /**
      this.animations = {};
      
      this.registerAnimated({
        "name": "eyeleft",
        "selector": "#eyeleft",
        "versions": {
          "v2": {
            selector: "#eyeleft2"
          }
        }
      });
      **/
    },
    
    animate: function (names, version) {
      (_.isArray(names) ? names : [names]).forEach((name) => {
        const options = this.animated[name];
        const duration = 500;
        const easing = mina.easeout;
        const element = Snap.select(options.selector);
        const versionData = options.versionDatas[version];
        const versionOptions = this.options.animated[name].versions[version];
          
        if (versionData) {
          element.animate({ d: versionData.path }, duration, easing);
        }
        
        let transforms = [];
        
        console.log(versionOptions.transform);
        
        if (versionOptions.rotate !== undefined) {
          const bbox = (versionOptions.rotateAround ? Snap.select(versionOptions.rotateAround) : element).getBBox();
          transforms.push(`R ${versionOptions.rotate},${bbox.cx}, ${bbox.cy}`);
        }
        
        if (versionOptions.moveTo !== undefined) {
          const bbox = Snap.select(versionOptions.moveTo).getBBox();
          transforms.push(`T ${bbox.cx}, ${bbox.cy}`);
        }
        
        if (transforms.length) {
          console.log(transforms.join(' '));
          
          element.stop().animate({ transform: transforms.join(' ') }, 1000);
        }
      });
    },
    /**
    absolutePath: function (element) {
      const d = Snap.parsePathString(element.attr('d'));
      const transform = Snap.parseTransformString(element.attr('transform'));
      const x = element.transform().globalMatrix.x(0, 0);
      const y = element.transform().globalMatrix.y(0, 0);
      
      const absoluteD = d.map((segment) => {
        if (segment.indexOf('m') === 0) {
          segment[1] += x;
          segment[2] += y;
          return segment;
        }
        
        return segment;
      });
      
      element.attr('d', absoluteD);
    },
    **/
    getPath: function (element) {
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
    }
    /**
    registerAnimated: function (options) {
      this.animations[]
      
      const base = Snap.select(options.selector);
      const test = Snap.select(options.test);
      base.animate({ d: test.attr('d') }, 500, mina.easeout);
      
      // options.base
      // options.v1
    }
    **/
  });
  
  $(document).ready(() => {
    $(document).viksu();
    
    setTimeout(() => {
      $(document).viksu('animate', ['handright'], 'v2'); 
    }, 1000);
    
    setTimeout(() => {
      $(document).viksu('animate', ['handright'], 'v3'); 
      // $(document).viksu('animate', ['eyeleft', 'eyeright', 'handright'], 'v1'); 
    }, 2000);
  });
  
})();