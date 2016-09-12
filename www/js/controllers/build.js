var isDuplicate = function (data, name) {
  for (var x = 0; x < data.length; x++) {
    if (data[x].name === name) {
      return true;
    }
  }
  return false;
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
  var $filtered = $scope.repeat("filtered"),
      $exercises = $scope.repeat("exercises");

  var workout = new WorkoutSaver(),
      cache;

  workout.getCache(function (response) {
    cache = response;
    cache.forEach(function (exercise) {
      $filtered.push({name: exercise});
    });
  });

  if (STATES.apply("build")) {
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
        console.log(node.parentNode);
        node.parentNode.appendChild($scope.filtered.self[0]);
        meta.searchPreviousSibling = node;
      }
      return node;
    }
  };

  var meta = {
    lastLength: 0,
    searchPreviousSibling: null,
    $el: {
      search: $($scope.filtered.self[0])
    }
  };

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

  $scope.addSelected = function () {
    console.log(this);
    $(this).toggleClass("selected");
  };

  $scope.saveWorkout = function () {
    var confirm = window.confirm("Are you sure you want to save?");

    if (confirm) {
      workout.update().save($input);

      document.body.querySelector("div[page='home']").classList.add("active");
      document.body.querySelector("div[page='build']").classList.remove("active");

      route.deploy("home");
    }
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

    STATES.set("build", {"exercises": $exercises.get()});

    $(this).animate({
      bottom: "-=48px",
    }, 250).fadeOut(300);
  };


/* not functional... in exercise appending, it replicates __meta.id */

  $scope.deleteExercise = function () {
    var repeat = this.parentNode.parentNode,
        _id = repeat.getAttribute("data-b_id");

    $exercises.filter(function (o) {
      console.log(o.__meta.id);
      return o.__meta.id !== _id;
    });
  };

  $scope.deleteSet = function () {
    var set = this.parentNode,
        repeatNode = set.parentNode,
        _id = set.getAttribute("data-b_id"),
        length = repeatNode.repeat.sets.get().length;


    var isLast = set.querySelector(".plus").style.display !== "none";

    if (length > 1) {
      repeatNode.repeat.sets.filter(function (o) {
        return o.__meta.id !== _id;
      });

      repeatNode.repeat.sets.modifyEach(function (o,i) {
        o.set = "Set " + romanNumerals[i+1] || i+1;
      });
      if (isLast) {
        var lastNode = repeatNode.querySelectorAll(".set")[length-2];
        $(lastNode.querySelector(".plus"))
          .css("display","")
          .animate({"bottom":"+=48px"}, 100);
      }
    }
    else {
      alert("You cannot delete this set");
    }

  };

  $scope.showSelector = function () {
    $(this.nextElementSibling).fadeToggle(200);
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

  };

  $scope.event.add("addExercise", {
    focus: {
      addExercise: function () {
        var val = this.value,
            node;
        this.value = "";

        $exercises.push(JSON.parse(JSON.stringify(exercise)), function (o) {
          modifySetHTML(o);
          node = o.querySelector("input.exercise");
        });

        // window.newnode = node;
        var top = node.getBoundingClientRect().top + window.scrollY;

        funcs.appendSearch(node, meta).value = val;

        // STATES.set("build", {"exercises": $exercises.get()});

        node.focus();

        $filtered.filter(function (o) {
          return 0;
        });

        cache.forEach(function (o) {
          $filtered.push({
            name: o,
          });
        });

      }
    }
  });

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
            cache.forEach(function (o) {
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
        this.parentNode.parentNode.querySelector("input.exercise").value = this.innerText;
      }
    }
  });

  // STATES.set("build", );
});

var WorkoutSaver = (function () {

  var funcs = {
    setCache: function ( args ) {
      var temp = {
        _id: args._id,
        exercise_cache: args.data
      };

      args.database.get(args._id).then(function (doc){
        temp._rev = doc._rev;
        return args.database.put(temp);
      }).then(function (response) {
        console.log(response);
      }).catch(function (err) {
        console.log("No cache, creating...");
        args.database.put(temp);
      });
    }

  };

  var init = function () {
    data.workout = {
      name: document.querySelector("input.title").value,
      exerciseList: []
    };
    DB.info().then(function (info) {
      meta.count = info.doc_count;
    });
  };

  var data = {},
      meta = {};

  init();

  return {
    update: function () {
      var exercise, sets, setNodes;

      data.workout.name = document.body.querySelector(".title").value.trim();
      data.workout.date = document.body.querySelector(".date-picker").value;
      data.workout.muscle_groups = [];
      document.body.querySelectorAll("td.selected").forEach(function (node) {
        data.workout.muscle_groups.push(node.innerText);
      });

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

      DB.put(data.workout);

      data.workout.exerciseList.forEach(function (o) {
        var flag_match = false,
            regex;

        for (var x = 0; x < data.exercise_cache.length; x++) {
          regex = new RegExp(o.exercise,"ig");
          if (data.exercise_cache[x].match(regex)) {
            flag_match = true;
            break;
          }
        }

        if (!flag_match) data.exercise_cache.push(o.exercise);

      });

      funcs.setCache({
        database: DB,
        _id: "exercise_cache",
        data: data.exercise_cache
      });

      return this;
    },
    getCache: function (callback) {
      if (!data.exercise_cache || data.exercise_cache.length === 0) {
        DB.get("exercise_cache").then(function (doc) {
          data.exercise_cache = doc.exercise_cache;
          callback(doc.exercise_cache);
        })
        .catch(function (err) {
          data.exercise_cache = [];
          callback([]);
        });
      }
      return this;
    }
  };
});
