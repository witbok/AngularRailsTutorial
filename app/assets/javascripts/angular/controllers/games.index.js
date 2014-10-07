APP.controller('GamesListController', ['$scope', 'Restangular', function($scope, Restangular) {
  Restangular.all("games").getList().then(function(games) {
    $scope.games = games;
  });
}]);
