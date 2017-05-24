app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
    matchService.getLocation = function (username) {
        var options = {
            
                method: 'GET',
            url: 'https://api.github.com/users/' + username,
            headers: 
                {
                    'Authorization': "token {enter your token here}"
                }


        }


        
               return $http(options)
                       .then(function (result) {
                           return result.data;
                       });
         };

    matchService.getRepos = function (username, j) {
        var options = {

            method: 'GET',
            url: 'https://api.github.com/users/' + username + '/repos?sort=updated',
            headers:
                {
                    'Authorization': "token {enter your token here}"
                }


        }
               return $http(options)
                             .then(function (result) {
                                 console.log(result.data);
                                 
                                 result.data.newIndex = j;
                                 return result.data;
                             });
        };

        return matchService;

}]);
