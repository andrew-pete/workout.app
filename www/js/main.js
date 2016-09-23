var domReady = function(callback) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      callback();
    }
    else {
      document.addEventListener("DOMContentLoaded", callback);
    }
};

var today = function () {
  var d = new Date();
  return d.format("yyyy-mm-dd");
};

var createTimer = function (obj) {
  return new InteractiveTimer(obj.containers, {
    target: '.timer',
    duration: obj.duration,
    options: {
      width: 300,
      height: 300,
      colors: {
        center: "transparent",
        border: "rgba(255,255,255,0.1)",
        timer: "rgba(74, 218, 255, 0.6)"
      },
      callback: function () {
        alert ("Timer Up!");
      }
    }
  });
};

var route = new RouteConfig("#view");

domReady(function () {
  window.DB = new PouchDB('workout-server');

  var containers = {
    timer: document.querySelector(".timer"),
    text: document.querySelector(".time-remaining"),
    view: document.querySelector("#view")
  };

  var settings;

  DB.get("settings").then(function (response) {
    settings = response.settings || {};
    var timer = createTimer({
      containers: containers,
      duration: settings.duration || 30
    });
  });

  document.querySelectorAll(".ind-tab").forEach(function (d) {
    d.addEventListener("click", function () {
      document.querySelector(".active").classList.remove("active");
      d.classList.add("active");
      if (d.getAttribute("page") === "info") {
        $(".clock").fadeOut();
      }
      else {
        $(".clock").fadeIn();
      }
      route.deploy(d.getAttribute("page"));
    });
  });
  route.config({
    cache: true
  });

  route
    .add("home", "views/home.html", "js/controllers/home.js")
    .add("build", "views/build.html", "js/controllers/build.js")
    .add("dashboard", "views/dashboard.html", "js/controllers/dashboard.js")
    .add("info", "views/info.html", "js/controllers/info.js")
    .add("settings", "views/settings.html", "js/controllers/settings.js");

  var transition = new Transition()
    .addView("home", 0)
    .addView("build", 1)
    .addView("dashboard", 2)
    .addView("info", 3)
    .addView("settings", -1)
    .transition(800);

  var view = document.getElementById("view");

  var hash = route.hash.get();

  (document.body.querySelector("div[page='"+ (hash.view) + "']") || document.body.querySelector("div[page='home']")).classList.add("active");

  (function(){
    document.querySelector(".clock").addEventListener("click", function (e) {
      var view = route.hash.get().view;

      var $timer = $(".timer");
      var hidden = $timer.hasClass("hide");

      $("." + view + "-container").toggleClass("darken");

      $timer.fadeToggle(200);
    });


  })();


  if (hash) {
    route.deploy(hash.view);
  } else {
    route.deploy("home");
  }
});
