'use strict';
var Timer = (function (args) {

  var meta = {
    isRunning: false,
    options: {
      height: 200,
      width: 200,
      strokeradius: 20,
      colors: {
        center: "transparent",
        timer: '#fafafa',
        border: "#333"
      },
    },
    duration: args.duration || 0,
    milisecondsRemaining: args.duration * 1000,
    target: args.target || 'body',
    nodes:{}
  };

  if (args.options) {
    for (var o in args.options) {
      if (args.options.hasOwnProperty(o) && o !== 'isRunning') {
        meta.options[o] = args.options[o];
      }
    }
  }

  meta.container = document.querySelectorAll(meta.target)[0];
  meta.timer = meta.duration;
  meta.options.radius = meta.options.width/2 - meta.options.strokeradius;

  var draw = {
    getNode: function (node, attributes) {
      node = document.createElementNS("http://www.w3.org/2000/svg", node);

      for (var prop in attributes) {
        node.setAttributeNS(
          null,
          prop.replace(/[A-Z]/g,
            function(m, prop, o, s) {
              return "-" + m.toLowerCase();
            }),
          attributes[prop]
        );
      }
      return node;
    },
    drawTime: function (time, node) {
      if (!node) throw ": no node given!";
      var formatted = Math.round(time);
      node.innerHTML = formatted;
    },
    resetProgressBar: function () {
      meta.nodes.integer.innerHTML = Math.floor(meta.duration);
      meta.nodes.decimal.innerHTML = (String)(meta.duration - Math.floor(meta.duration))
        .replace(/^[0]+/g, "")
        .slice(0,2) || ".0";
      meta.progressBar.setAttribute("stroke-dashoffset", meta.options.radius * 2 * Math.PI);
    },
    drawProgressBar: function () {
      meta.progressBar.setAttribute("stroke-dashoffset", meta.options.radius * 2 * Math.PI * (meta.milisecondsRemaining/(1000*meta.duration)));
    },
    drawFullTime: function () {
      meta.nodes.integer.innerHTML = Math.floor(meta.milisecondsRemaining/1000);
      meta.nodes.decimal.innerHTML = '.' + Math.floor(meta.milisecondsRemaining%1000/100);
    }
  };

  var funcs = {
    style: function (node, styles) {
      for (var op in styles) {
        if (styles.hasOwnProperty(op)) {
          node.style[op] = styles[op];
        }
      }
      return node;
    },
    drawTimer: function (container, options, duration) {
      var circumference = options.radius * 2 * Math.PI;

      meta.svg = draw.getNode("svg", {
        width: options.width + "px",
        height: options.height + "px"
      });

      meta.innercircle = draw.getNode("circle", {
        cx: options.width/2 + "px",
        cy: options.height/2 + "px",
        r: options.radius + "px",
        stroke: options.colors.border,
        "stroke-width": options.strokeradius + "px",
        "stroke-dasharray": circumference + "px",
        fill: options.colors.center
      });

      meta.progressBar = draw.getNode("circle", {
        cx: options.width/2 + "px",
        cy: options.height/2 + "px",
        r: options.radius + "px",
        stroke: options.colors.timer,
        "stroke-width": options.strokeradius - 10 + "px",
        "stroke-dasharray": circumference + "px",
        "stroke-dashoffset": circumference + "px",
        fill: 'transparent'
      });

      var textDiv = document.querySelector(".time-remaining") || document.createElement("div");

      funcs.style(textDiv, {
        position: "absolute",
        outline: "none",
        width: "100%",
        lineHeight: "1 em",
        top: "calc(" + options.height/2 + "px - 2.6rem)",
        fontWeight: 300,
        fontSize: "4em",
        textAlign: "center",
        opacity: 0.45,
      });

      meta.nodes = {
        integer: document.createElement('span'),
        decimal: document.createElement('span'),
        time: textDiv
      }

      funcs.style(meta.nodes.decimal, {
        fontWeight: 100,
      });

      meta.nodes.integer.style.outline = "none";



      meta.nodes.decimal.className = "decimal";
      meta.nodes.integer.className = "integer";

      var integerText = document.createTextNode(Math.floor(duration)),
          decimalText = document.createTextNode('.' + (duration - Math.floor(duration)));

      meta.nodes.integer.appendChild(integerText);
      meta.nodes.decimal.appendChild(decimalText);

      meta.nodes.time.appendChild(meta.nodes.integer);
      meta.nodes.time.appendChild(meta.nodes.decimal);

      meta.nodes.time.setAttribute('b-name','timerText');

      container.appendChild(textDiv);
      container.appendChild(meta.svg);

      meta.svg.appendChild(meta.innercircle);
      meta.svg.appendChild(meta.progressBar);
    },
    startInterval: function () {
      var offset, now,
          circumference = meta.options.radius * 2 * Math.PI;

      meta.interval = setInterval(function () {
        now = new Date();

        if (now > meta.endTime) {
          clearInterval(meta.interval);

          meta.isRunning = false;
          meta.isFinished = true;
          draw.drawFullTime();
          meta.progressBar.setAttribute("stroke-dashoffset", "2px");

          if (meta.options.callback) {
            meta.options.callback();
          }
          return;
        }
        if (meta.isRunning) {
          meta.milisecondsRemaining = (meta.endTime - now);

          offset = meta.milisecondsRemaining / (meta.duration * 1000);

          draw.drawFullTime();
          meta.progressBar.setAttribute("stroke-dashoffset", circumference * offset);
        }
        }, Math.min(35, 5 * meta.duration));
    }
  };

  /* INIT */
  funcs.drawTimer(meta.container, meta.options, meta.duration);

  return {
    funcs: {
      setContentEditable: function () {
        meta.nodes.integer.contentEditable = true;
        meta.nodes.integer.innerHTML = "";
        meta.nodes.decimal.innerHTML = ".0";

        meta.nodes.integer.focus();
        return meta.nodes.integer;
      },
      empty: function () {
        meta.nodes.integer.innerHTML = "";
        meta.nodes.decimal.innerHTML = ".0";
      },
      endHold: function () {
        meta.nodes.integer.contentEditable = false;
      }
    },
    addTime: function (added) {
      meta.milisecondsRemaining = Math.max(meta.milisecondsRemaining + added, 0);
      // If time added becomes greater than the duration, the new duration is that time.
      meta.duration = Math.max(meta.duration, meta.milisecondsRemaining/1000);
      meta.timer = meta.duration;
      meta.isFinished =false;

      draw.drawFullTime();
      draw.drawProgressBar();

      return this;
    },
    setTimer: function (duration, unit) {
      meta.duration = (duration);
      meta.milisecondsRemaining = duration * 1000;
      meta.timer = duration;

      draw.drawFullTime();
      draw.resetProgressBar();

      return this;
    },
    resetTimer: function (toTime) {
      meta.timer = toTime || meta.duration;
      meta.milisecondsRemaining = meta.timer * 1000;
      meta.duration = meta.timer;
      meta.isFinished = false;

      draw.resetProgressBar();

      return this;
    },
    pauseTimer: function (callback) {
      meta.isRunning = false;
      clearInterval(meta.interval);
    },
    resumeTimer: function () {
      meta.isRunning = true;
      var now = new Date();
      meta.endTime = new Date(now.getTime() + meta.milisecondsRemaining);
      funcs.startInterval();
    },
    startTimer: function (callback) {
      meta.isRunning = true;
      var now = new Date();
      meta.endTime = new Date(now.getTime() + meta.duration * 1000);

      if (callback) {
        meta.callback = callback;
      }

      funcs.startInterval();
    },
    setOptions: function(options) {
      for (var op in options) {
        if (options.hasOwnProperty(op)) {
          meta.options[op] = options[op];
        }
      }
      console.log(meta.options);
      return this;
    },
    //n is innercircle, progressBar, svg
    changeAttribute: function (n, options) {
      var node = meta[n];
      for (var attr in options) {
        if (options.hasOwnProperty(attr) && node){
          node.setAttribute(attr, options[attr]);
        }
      }
      return this;
    },
    isRunning: function () {
      return meta.isRunning;
    },
    isFinished: function () {
      return meta.isFinished;
    }
  }

});
