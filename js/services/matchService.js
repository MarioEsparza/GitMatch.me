app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
    matchService.getLocation = function (username) {
        var options = {
            
                method: 'GET',
            url: 'https://api.github.com/users/' + username,
            headers: 
                {
                    'Authorization': "token dc1c918f5c68496e8f46c8c6810c97371c20b408"
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
                    'Authorization': "token dc1c918f5c68496e8f46c8c6810c97371c20b408"
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
