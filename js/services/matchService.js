app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
        matchService.getLocation = function (username) {
               return $http.get('https://api.github.com/users/' + username)
                       .then(function (result) {
                           return result.data;
                       });
         };

        matchService.getRepos = function (username,j) {
               return $http.get('https://api.github.com/users/' + username + '/repos?sort=updated')
                             .then(function (result) {
                                 console.log(result);
                                 result.data.newIndex = j;
                                 return result.data;
                             });
        };

        return matchService;

}]);
