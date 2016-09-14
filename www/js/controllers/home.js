
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

  $scope.showExercises = function () {
    if (!this.nextElementSibling.style.display || this.nextElementSibling.style.display === "none") {
      $(this.nextElementSibling).slideDown();
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

  $scope.toBuild = function () {
    document.body.querySelector('div[page="home"]').classList.remove("active");
    document.body.querySelector('div[page="build"]').classList.add("active");
    route.deploy("build");
    $data.transfer("settings", "build");

  };

});
