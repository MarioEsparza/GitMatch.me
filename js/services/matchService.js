app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
        matchService.getLocation = function (username) {
               return $http.get('https://api.github.com/users/' + username)
                       .then(function (result) {
                           return result.data;
                       });
         };

        matchService.getRepos = function (username) {
               return $http.get('https://api.github.com/users/' + username + '/repos')
                             .then(function (result) {
                                 return result.data;
                             });
        };

        return matchService;

}]);
