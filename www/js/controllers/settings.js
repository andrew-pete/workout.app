//settings-key
var settingsNameDictionary = {
  duration: "timeInput",
  system: "systemSelect"
};

var setSettingHTML = function ($scope, settings) {
  for (var x in settings) {
    if ($scope[settingsNameDictionary[x]]) {
      $scope[settingsNameDictionary[x]].self[0].value = settings[x];
    }
  }
};



var pushSettings = function (settings) {

  DB.get("settings").then(function (doc) {
    var temp = {
      _rev: doc._rev,
      _id: "settings",
      settings: settings
    };
    return DB.put(temp);
  }).then(function (response) {
    console.log(response);
  }).catch(function (err) {
    console.log(err);
  });

};

route.controller(function ($scope, $data, view) {
  DB.get("settings").then(function(doc) {
    $data.settings = doc.settings || {_id: doc._id};
    console.log($data.settings);
    setSettingHTML($scope, $data.settings);
  }).catch(function (err) {
    DB.put({
      _id: "settings",
      settings: {}
    });
    $data.settings = {};
  });

  $scope.setTime = function () {
    this.value = this.value.replace(/[^0-9]/ig, "").slice(0,3);
    $data.settings.duration = this.value;
  };

  $scope.event.add("systemSelect", {
    change: {
      changeData: function () {
        console.log(this.value);
        $data.settings.system = this.value;
      }
    }
  });

  $scope.goBack = function () {
    pushSettings($data.settings);
    var last = document.body.querySelector(".ind-tab.active").getAttribute("page") || "home";
    route.deploy(last);
  };
});
