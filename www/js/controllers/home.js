route.controller(function ($scope, $data, view) {
  var $workouts = $scope.repeat("workouts");

  DB.allDocs({
    include_docs: true
  }).then(function (results) {
    console.log(results);
    $data.workouts = results.rows.reverse();
    $data.workouts.forEach(function (o) {

      if (o.id.match(/workout/ig)) {
        $workouts.push(o.doc, function (workout) {
          workout.setAttribute("data-doc_id", o.id);
          workout.querySelectorAll(".set-container").forEach(function (set){
            if (!set.querySelector(".weight").innerText) {
              set.querySelector(".weight-type").style.display = "none";
              set.querySelector(".times").style.display = "none";
            }
            if (!set.querySelector(".reps").innerText) {
              set.querySelector(".rep-type").style.display = "none";
              set.querySelector(".times").style.display = "none";
            }
          });
        });
      }
      else if (o.id == "settings") {
        $data.settings = o.doc.settings;
      }

    });

  });

  $scope.showExercises = function (e) {
    console.log();
    if (e.path.indexOf( this.childNodes[1] ) === -1 && (!this.nextElementSibling.style.display || this.nextElementSibling.style.display === "none" )) {
      $(this.nextElementSibling).slideDown();
      $(this.childNodes[1]).fadeOut();
      $(this.childNodes[3]).removeClass("sticky").animate({marginLeft: 0}, 300);
      this.querySelector(".caret-down").className += " animate";
    }
    else {
      $(this.nextElementSibling).slideUp();
      this.querySelector(".caret-down").classList.remove("animate");
    }
  };

  $scope.toSettings = function () {
    route.deploy("settings");
  };

  $scope.repeatWorkout = function () {
    var id = this.parentNode.parentNode.getAttribute("data-doc_id");
    var confirm = window.confirm("Do this workout again?");
    if (confirm) {
      DB.get(id).then(function (response) {
        $data.transferData = response;
        console.log($data);
        $data.transfer("build", "transferData");
        $scope.toBuild();
      });
    }
  };

  $scope.toBuild = function () {
    document.body.querySelector('div[page="home"]').classList.remove("active");
    document.body.querySelector('div[page="build"]').classList.add("active");
    route.deploy("build");
    // $data.transfer("build", "settings");
  };

  $scope.deleteWorkout = function () {
    var confirm = window.confirm("Are you sure you want to delete this workout?");

    if (confirm) {
      // Hide absolute positioned nodes
      this.parentNode.style.opacity = 0;
      $(this.parentNode).slideUp();

      DB.get(this.parentNode.parentNode.getAttribute("data-doc_id")).then(function (doc) {
        return DB.remove(doc);
      });
    }

    else {
      $(this).fadeOut(300);
      $(this.nextElementSibling).css("margin-left", 0).removeClass("sticky");
    }
  };

  var touch_data = {};

  $scope.event.add("workoutHeader", {
    touchstart: {
      newSlide: function (e) {
        touch_data.movingNode = this.querySelector(".workout-name");
        touch_data.firstTouch = e.touches[0];
      }
    },
    touchmove: {
      trackSlide: function (e) {
        var deltaX = e.touches[0].pageX - touch_data.firstTouch.pageX;

        if (deltaX > 0 && (!touch_data.movingNode.style.marginLeft || parseInt(touch_data.movingNode.style.marginLeft) < 24)) {
          touch_data.movingNode.style.marginLeft = "24px";
        }
        else if (deltaX < 0) {
          if (touch_data.movingNode.classList.contains("sticky")) {
            touch_data.movingNode.style.marginLeft = 0;
            touch_data.movingNode.classList.remove("sticky");
            $(touch_data.movingNode.previousSibling.previousSibling).fadeOut(200);
          }
        }
        else {
          $(touch_data.movingNode).addClass("sticky");
          $(touch_data.movingNode.previousSibling.previousSibling).fadeIn(300);
        }
      }
    },
    touchend: {
      slideBack: function (e) {
        if (! touch_data.movingNode.classList.contains("sticky")) {
          touch_data.movingNode.style.marginLeft = 0;
        }
      }
    }
  });

});
