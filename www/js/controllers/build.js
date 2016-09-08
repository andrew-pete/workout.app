var isDuplicate = function (data, name) {
  for (var x=0; x < data.length; x++) {
    if (data[x].name === name) {
      return true;
    }
  }
  return false;
};

var emptyRepeat = function (repeat) {
  for (var x in repeat) {
    repeat
  }
};

// search = ["bench", "press"] <-- Array exploded
var disjointSearch = function (search, filter) {
  var regex,
    points = 0;
  search.forEach(function (str) {
    str = str.replace(/[^A-Za-z-/]/g, "");
    regex = new RegExp(str, 'ig');
    if (regex.test(filter)) {
      points++;
    }
  });

  return points/search.length * 100; // return the percentage match
};


var romanNumerals = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X"
};


var exercise = [
  {
    exerciseName: "",
    sets: [
      {
        set: "",
        weight: "",
        reps: ""
      }
    ]
  }
];

var findNodebyID = function (nodes, id) {
  for (var x = 0; x < nodes.length; x++) {
    if (nodes[x].__meta.id === id) return nodes[x];
  }
  return null;
};

var modifySetHTML = function (repeatNode) {
  repeatNode.repeat.sets.modifyEach(function (prop, i) {
    prop.set = "Set " + (romanNumerals[i+1] || i+1);
  });
};

route.controller(function ($scope, $data, view) {

  var workout = new WorkoutSaver();

  var $filtered = $scope.repeat("filtered");

  window.$exercises = $scope.repeat("exercises");

  if (STATES.apply("build")) {
    console.log(STATES.apply("build"));
    var state = STATES.apply("build");
  //  $scope = STATES.apply("build", $data);
  $exercises.push(state.exercises);
 }
 else {
   $exercises.push(JSON.parse(JSON.stringify(exercise)), modifySetHTML);
 }

  var funcs = {
    appendSearch: function (node, meta) {
      if ( !meta.searchPreviousSibling || $scope.filtered.self[0].previousSibling !== node) {
        node.parentNode.appendChild($scope.filtered.self[0]);
        meta.searchPreviousSibling = node;
      }
      return node;
    }
  }

  var $input = $('.date-picker').pickadate({
    format: "mmmm d, yyyy",
    formatSubmit:"yyyy-mm-dd",
    onSet: function(context) {
      $($scope.datePicker.self[0]).css({
        border: "1px solid rgba(255,255,255, 0)",
        opacity: 0.9
      });
    }
  });

  $scope.saveWorkout = function () {
    workout.update().save($input);
    route.deploy("home");
  };

  $scope.addSet = function (e) {
    var repeatNode = this.parentNode.parentNode,
        i = repeatNode.querySelectorAll(".set").length;

    var lastNode = repeatNode.repeat.sets.get()[i-1];

    repeatNode.repeat.sets
      .push({weight: lastNode.weight, reps: lastNode.reps}, function (o) {
        o.querySelector(".weight-input").value = lastNode.weight;
        o.querySelector(".rep-input").value = lastNode.reps;
      });

    repeatNode.repeat.sets
      .modify(i, {set: "Set " + (romanNumerals[i+1] || i+1)});


    console.log($exercises.get());
    STATES.set("build", {"exercises": $exercises.get()});



    $(this).animate({
      bottom: "-=48px",
    }, 250).fadeOut(300);
  };

  $scope.setData = function (e) {
    var repeatedInNode = this.parentNode.parentNode,
        repeatNode = repeatedInNode.parentNode;

    var prop = this.getAttribute("b-text"),
        id = this.parentNode.parentNode.getAttribute("data-b_id");

    var temp = {},
        node;

    temp[prop] = this.value;

    node = findNodebyID(repeatNode.repeat.sets.get(), id);

    node[prop] = this.value;

  }

  var meta = {
    lastLength: 0,
    searchPreviousSibling: null,
    $el: {
      search: $($scope.filtered.self[0])
    }
  };

  $scope.event.add("addExercise", {
    focus: {
      addExercise: function () {
        var val = this.value,
            node;
        this.value = "";

        $exercises.push(exercise, function (o) {
          modifySetHTML(o);
          node = o.querySelector("input.exercise");
        });

        funcs.appendSearch(node, meta).value = val;

        STATES.set("build", {"exercises": $exercises.get()});

        node.focus();
        // meta.$el.search.removeClass("hidden").slideDown();
      }
    }
  });

  keys.forEach(function (o) {
    $filtered.push({
      name: o,
      // obj: o[Object.keys(o)]
    });
  });

  console.log($filtered.get());

  var filtered = [];
  $scope.event.add("exerciseSearch", {
    input: {
      searchJSON: function (e) {

        var val = this.value,
            sorted = [];

        if ( val.length < 3 ) {
          $scope.filtered.self[0].classList.add("hidden");
        }
        else {
          meta.$el.search.slideDown();
          $scope.filtered.self[0].classList.remove("hidden");

          if (this.value.length < meta.lastLength) {
            keys.forEach(function (o) {
              var key = o;
              if ( (disjointSearch((val).split(" "), key) > 50) && !isDuplicate($filtered.get(), key) ) {
                $filtered.push({
                  name: key,
                });
              }
            });
          }
          else {

            $filtered.filter(function(o, i) {
              o.percentMatch = disjointSearch((val || "").split(" "), o.name);
              return o.percentMatch > 50;
            }, this);

          }
          sorted = $filtered.get();

          sorted.sort(function (a,b) {
            // Ratio of percent matched to total possible of word matches...
            // 100% match of 2 word phrase should appear before 100% match of 5 word phrase
            return (b.name.split(" ").length * a.percentMatch) < (a.name.split(" ").length * b.percentMatch);
          });

          for (var i = 0; i < sorted.length; i++) {
            $filtered.modify(i, sorted[i]);
          }

        }
        meta.lastLength = this.value.length;
      }
    },
    blur: {
      hideSearch: function () {
        meta.$el.search.slideUp().addClass("hidden");
      }
    },
    focus: {
      expand: function () {
        this.select();
        funcs.appendSearch(this, meta);
      }
    }
  });

  $scope.event.add("result", {
    click: {
      chooseExercise: function (e) {
        this.parentNode.previousSibling.value = this.innerText;
      }
    }
  });

  // STATES.set("build", );
});

var WorkoutSaver = (function () {


  var init = function () {
    data.workout = {
      name: document.querySelector("input.title").value,
      exerciseList: []
    };
    DB.info().then(function (info) {
      console.log(info);
      meta.count = info.doc_count;
    });
  };

  var data = {},
      meta = {};

  init();

  return {
    update: function () {
      var exercise, sets, setNodes;
      document.body.querySelectorAll('.exercise-container[data-b_id]').forEach(function (o) {
        exercise = o.querySelector("input.exercise").value;
        sets = o.repeat.sets.get();

        setNodes = o.querySelectorAll("div.set").forEach(function (set, i) {
          sets[i].repType = set.querySelector(".rep-type").value;
          sets[i].weightType = set.querySelector(".weight-type").value;
        });

        data.workout.exerciseList.push({
          exercise: exercise,
          sets: sets
        });
      });

      return this;
    },
    save: function (date) {
      data.workout._id = "workout_" + meta.count;
      meta.count ++;
      console.log(data.workout);

      DB.put(data.workout);

      return this;
    }
  }
});
