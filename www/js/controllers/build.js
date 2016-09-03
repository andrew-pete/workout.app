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
  var funcs = {
    expandSearch: function (node, meta) {
      if ( !meta.searchPreviousSibling || $scope.filtered.self[0].previousSibling !== node) {
        node.parentNode.appendChild($scope.filtered.self[0]);
        meta.searchPreviousSibling = node;
      }
      return node;
    }
  }

  $('.date-picker').pickadate({
    format: "mmmm d, yyyy",
    formatSubmit:"yyyy-mm-dd",
    onSet: function(context) {
      $($scope.datePicker.self[0]).css({
        border: "1px solid rgba(255,255,255, 0)",
        opacity: 0.9
      });
    }
  });

  var $filtered = $scope.repeat("filtered");

  var $exercises = $scope.repeat("exercises");

  $exercises.push(exercise, modifySetHTML);

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

    $(this).animate({
      bottom: "-=48px",
    }, 250).fadeOut(300);
  };

  $scope.setData = function (e) {
    var repeatedInNode = this.parentNode.parentNode,
        repeatNode = repeatedInNode.parentNode;

    var prop = this.getAttribute("b-text"),
        id = this.parentNode.parentNode.getAttribute("data-b_id");

    var temp = {};

    temp[prop] = this.value;

    // repeatNode.repeat.sets.modify({dataset: {b_id: id}}, temp);
    findNodebyID(repeatNode.repeat.sets.get(), id)
      [prop] = this.value;

    console.log(findNodebyID(repeatNode.repeat.sets.get(), id));
  }

  var meta = {
    lastLength: 0,
    searchPreviousSibling: null,
    $el: {
      search: $($scope.filtered.self[0])
    }
  };

  $scope.event.add("addExercise", {
    input: {
      addExercise: function () {
        var val = this.value,
            node;
        this.value = "";

        $exercises.push(exercise, function (o) {
          modifySetHTML(o);
          node = o.querySelector("input.exercise");
        });

        funcs.expandSearch(node, meta).value = val;

        node.focus();
        // meta.$el.search.removeClass("hidden").slideDown();
      }
    }
  });

  keys.forEach(function (o) {
    $filtered.push({
      name: Object.keys(o)[0],
      // obj: o[Object.keys(o)]
    });
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
        }

        if (this.value.length < meta.lastLength) {
          keys.forEach(function (o) {
            var key = o;
            if ( (disjointSearch((val).split(" "), key) > 50) && !isDuplicate($filtered.get(), key) ) {
              $filtered.push({
                name: key,
                // obj: o[key]
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
          return (a.name.split(" ").length * a.percentMatch) > (b.name.split(" ").length * b.percentMatch);
        });


        for (var i = 0; i < sorted.length; i++) {
          $filtered.modify(i, sorted[i]);
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
        funcs.expandSearch(this, meta);
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

  // $scope.event.add("timerContainer", {
  //   click: {
  //     showClock: function (e) {
  //       var $timer = $(".timer");
  //       var hidden = $timer.hasClass("hide");
  //       $(".build-container").toggleClass("darken");
  //       $timer.fadeToggle(200);
  //     }
  //   }
  // });


  // var timer = new InteractiveTimer($scope, view, {
  //   target: '.timer',
  //   duration: 10,
  //   options: {
  //     width: 300,
  //     height: 300,
  //     colors: {
  //       center: "transparent",
  //       border: "rgba(255,255,255,0.1)",
  //       timer: "rgba(74, 218, 255, 0.6)"
  //     },
  //     callback: function () {
  //       alert ("Timer Up!");
  //     }
  //   }
  // });
});
