$(".clock").fadeOut();

var toList = function (o) {
  if (!o.Listified) {
    var temp = o.Guide.split(/\n/),
        html;

    for (var x=0; x < temp.length; x++) {
      temp[x] = "<li>" + temp[x] + "</li>";
    }

    o.Guide = "<ul class='guide'>" + temp.join("") + "</ul>";
    o.Listified = true;
  }
};

route.controller(function ($scope, $data, view) {
  var data = json;

  var $repeat = $scope.repeat("exercises"),
      $search = $scope.repeat("search");

  // $repeat.push(data[302]);

  // $search.push(data.slice(0,5), function (node) {
  //   console.log(node);
  // });


  $scope.searchData = function () {
    var val = this.value;
    $search.filter(function () {
      return 0;
    });
    var i = 0;
    $search.push(json.filter(function (o) {
      var regex = new RegExp(val, "ig");
      return o.Name.match(regex);
    }).sort(function (a,b) {
      // return a.Name.split(" ").length > b.Name.split(" ").length;
      return (1+a.popularity || 0) < (1 + b.popularity || 0);
    }), function (node) {
      if (i > 20) node.style.display = "none";
      i++;
    });
  };

  $scope.event.add("search", {
    blur: {
      hide: function () {
        $scope.searchContainer.self[0].classList.add("closed");
      }
    },
    focus: {
      expand: function () {
        if ($search.get().length) {
          $scope.searchContainer.self[0].classList.remove("closed");
        }
      }
    },
  });

  $scope.event.add("searchContainer", {
    click: {
      select: function (e) {
        $(".empty-search").hide();

        var row;
        try {
          for (var x=0; x < e.path.length; x++) {
            if (e.path[x].getAttribute("data-b_id")){
              row = e.path[x];
              break;
            }
          }
        }
        catch(err) {

        }
        console.log(row.querySelector(".search-name").innerText);

        var node = json.filter(function (o) {
          return o.Name.toLowerCase() === row.querySelector(".search-name").innerText.toLowerCase();
        });

        $repeat.filter(function () {
          return 0;
        });
        $repeat.push(node);

        $repeat.modifyEach(toList);
      }
    }
  });


});
