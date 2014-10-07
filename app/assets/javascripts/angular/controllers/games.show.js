APP.controller('GamesShowController', ['$scope', 'Restangular', '$stateParams',
  function($scope, Restangular, $stateParams) {
    Restangular.one("games", $stateParams.id).get().then(function(game) {
      $scope.game = game;
    });
}]);
