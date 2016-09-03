// containers is an object that MUST contain the nodes: {timer:... , text: ... , view: ...}

var InteractiveTimer = (function (containers, timer_ops) {

  var meta = {
    timeClickFlag: false,
    hold: {
      threshold: 500,
      maxDistance: 5
    },
    disabled: false
  };

  var utils = {
    // {touchmove: function..., touchstart: funciton}]
    addEvents: function (container, args) {
      for (var event in args) {
        container.addEventListener(event, args[event]);
      }
      return container;
    }
  };

  var funcs = {
    changeTime: function () {
      if (meta.timer.isRunning()) {
        meta.timer.pauseTimer();
      } else if (meta.timer.isFinished()) {
        meta.timer.resetTimer();
      } else {
          meta.timer.resumeTimer();
      }
    },
    inputTime: function (e) {
      var time = parseInt(this.innerText) % 10000 || null;
      if (time) {
        meta.lastTime = time;
        meta.timer.setTimer(time);
      } else {
        if (meta.lastTime && this.innerText != '.0') {
          meta.timer.setTimer(meta.lastTime);
        }
        else{
          meta.timer.funcs.empty();
        }
      }
    },
    prevent: function (e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        meta.timer.funcs.endHold();

        if (meta.disabled) {
          containers.timer.addEventListener("click", funcs.changeTime);
          meta.disabled = false;
        }
      }
      if (e.keyCode == 7) {
        e.preventDefault();
        this.innerText = this.innerText.slice(0,-1);
      }
    },
    // Tracking functions for touch
    initTrack: function (e) {
      meta.firstTouch = e.touches[0];

      meta.lastTouch = meta.firstTouch;
      meta.lastTouch.time = new Date() * 1;

      meta.distance = 0;

      if (!meta.timer.isRunning()) {
        meta.hold.timer = setTimeout(function () {
          if (meta.distance < meta.hold.maxDistance) {
            containers.timer.removeEventListener("click", funcs.changeTime);
            meta.disabled = true;

            meta.focus = meta.timer.funcs.setContentEditable();
          }
          clearTimeout(meta.hold.timer);
        }, meta.hold.threshold);
      }
    },

    logTouch: function (e) {
      // console.log('here');
      if (!meta.timer.isRunning()) {
        var touch = e.touches[0];
        var deltaY = (touch.pageY-meta.lastTouch.pageY),
            deltaX = (touch.pageX-meta.lastTouch.pageX);

        meta.distance += Math.sqrt(deltaY*deltaY + deltaX*deltaX);

        meta.timer.addTime(-deltaY*100);

        meta.deltaY = deltaY;
        meta.velocityY = deltaY/(new Date * 1 - meta.lastTouch.time);

        meta.lastTouch = touch;
        meta.lastTouch.time = new Date() * 1;
      }
    },
    finishTrack: function (e) {
      if (meta.hold.timer) {
        clearTimeout(meta.hold.timer);
      }

      if (!meta.timer.isRunning()) {
        var t= 0,
            v0 = meta.velocityY;

        if (Math.abs(v0) > 0.075) {
          var momentumInterval = setInterval(function () {
            meta.velocityY = v0*(Math.exp(-0.075*t));

            if (Math.abs(meta.velocityY) < 0.050 || meta.timer.isRunning()) {
              clearTimeout(momentumInterval);
            }

            meta.timer.addTime(-meta.velocityY*200);
            t++;
          }, 25);
        }
      }
    }
  }

  meta.timer = new Timer(timer_ops);

  containers.view.addEventListener("click", function (e) {
    if (e.target !== containers.timer && !containers.timer.contains(e.target)) {
      //view.container.focus();
      meta.timer.funcs.endHold();
      if (meta.disabled) {
        containers.timer.addEventListener("click", funcs.changeTime);
        meta.disabled = false;
      }
    }
  });

  utils.addEvents(containers.timer, {
    touchstart: funcs.initTrack,
    touchmove: funcs.logTouch,
    touchend: funcs.finishTrack,
    click: funcs.changeTime
  });

  utils.addEvents(containers.text, {
    input: funcs.inputTime,
    keydown: funcs.prevent
  });

  return {
    getTimer: function () {
      return meta.timer;
    }
  };
});
