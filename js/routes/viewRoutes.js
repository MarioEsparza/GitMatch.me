// Routes
(function(){
  'use strict';
  angular
  .module('GitMatchApp')
  .config(function ($routeProvider) {
      $routeProvider

          .when('/', {
              templateUrl: 'views/home.html',
              controller: 'HomeController'
          })
             .when('/location', {
                 templateUrl: 'views/location.html',
                 controller: 'HomeController'
             })
          .when('/about', {
              templateUrl: 'views/about.html',
              controller: 'HomeController'
          })
          /*
          .when('/checkout', {
              templateUrl: 'views/checkout.html',
              controller: 'CheckOutController'
          })
       */
        .otherwise({ redirectTo: '/' });

  });
})();
