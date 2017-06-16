(function(){
  'use strict';

  // Functions
  function removeSpaces() {
    return function (input) {
        if (input) {
            return input.replace(/\s+/g, '-').toLowerCase();
        }
    };
  }
  function whiteList($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
  // Allow same origin resource loads.
      'self',
  // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://git-awards.com/api/v0/**'
  ]);
  }

  // Module and Config
  angular
  .module('GitMatchApp', [
                          'ngRoute',
                          'ngAnimate',
                          'ui.bootstrap',
                          'ngMaterial'
                        ])
  .config(whiteList)

  .filter('spaceless', removeSpaces);
})();
