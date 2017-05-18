var app = angular.module('GitMatchApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap','ngMaterial']);

app.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
        'http://git-awards.com/api/v0/**'
    ]);
})

app.filter('spaceless', function () {
    return function (input) {
        if (input) {
            return input.replace(/\s+/g, '-').toLowerCase();;
        }
    }
});
