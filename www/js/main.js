var domReady = function(callback) {
    document.readyState === "interactive" || document.readyState === "complete"
      ? callback()
      : document.addEventListener("DOMContentLoaded", callback);
};

var today = function () {
  var d = new Date();
  return d.format("yyyy-mm-dd");
};
var route = new RouteConfig("#view");

domReady(function () {

  window.DB = new PouchDB('workout-server');


  //document.body.oncontextmenu = function () {return false;};

  document.querySelectorAll(".ind-tab").forEach(function (d) {
    d.addEventListener("click", function () {
      document.querySelector(".active").classList.remove("active");
      d.classList.add("active");
      route.deploy(d.getAttribute("page"));
    });
  });
  route.config({
    cache: true
  });

  route
    .add("home", "views/home.html", "js/controllers/home.js")
    .add("build", "views/build.html", "js/controllers/build.js");

  var transition = new Transition()
    .addView("home", 0)
    .addView("build", 1)
    .transition(800);

  var view = document.getElementById("view");

  var hash = route.hash.get();

  document.body.querySelector("div[page='"+ (hash.view || "home") + "']").classList.add("active");

  STATES = new StateSaver();

  STATES
    .add("home")
    .add("build");

  (function(){
    document.querySelector(".clock").addEventListener("click", function (e) {
      var $timer = $(".timer");

      var hidden = $timer.hasClass("hide");
      $(".build-container").toggleClass("darken");
      $timer.fadeToggle(200);
    });


  })();

  var containers = {
    timer: document.querySelector(".timer"),
    text: document.querySelector(".time-remaining"),
    view: document.querySelector("#view")
  };

  var timer = new InteractiveTimer(containers, {
    target: '.timer',
    duration: 10,
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



  if (hash) {
    route.deploy(hash.view);
  } else {
    route.deploy("build");
  }
});
