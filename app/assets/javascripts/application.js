/*
 ==== Standard ====
 = require jquery

 ==== Angular ====
 = require angular

 ==== Angular Plugins ====
 = require lodash
 = require restangular
 = require angular-ui-router

 = require_self
 = require_tree .
 */

var APP = angular.module('Games', [
  'ui.router',
  'templates',
  'restangular'
  ]);

APP.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider){
    RestangularProvider.setBaseUrl("/api");
    RestangularProvider.setDefaultRequestParams({format: "json"});

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise("/games");

    $stateProvider
      .state('games', {
        url: "/games",
        abstract: true,
        template: "<div ui-view></div>"
      })
      .state('games.list', {
        url: "",
        templateUrl: "games/index.html",
        controller: "GamesListController"
      })
      .state('games.show', {
        url: "/:id",
        templateUrl: "games/show.html",
        controller: "GamesShowController"
      });
  }]);
