
route.controller(function ($scope, $data, view) {
  window.$scope = $scope;

  DB.allDocs({
    include_docs: true
  }).then(function (results) {
    $data.workouts = results.rows;

  });

});
