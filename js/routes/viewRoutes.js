// Routes
app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        })
           .when('/location', {
               templateUrl: 'views/location.html',
               controller: 'HomeController'
           })
        .when('/emailsent', {
            templateUrl: 'views/emails.html',
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
