var app = angular.module('GitMatchApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);

app.filter('spaceless', function () {
    return function (input) {
        if (input) {
            return input.replace(/\s+/g, '-').toLowerCase();;
        }
    }
});