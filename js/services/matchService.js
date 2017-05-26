app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
    matchService.getLocation = function (username) {
        var options = {
            
                method: 'GET',
            url: 'https://api.github.com/users/' + username,
            headers: 
                {
                    'Authorization': "token 8cc6fd72bdc734e8dd63e8700c29833d8ffe4340"
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
                    'Authorization': "token 8cc6fd72bdc734e8dd63e8700c29833d8ffe4340"
                }


        }
               return $http(options)
                             .then(function (result) {
                                 //console.log(result.data);
                                 
                                 result.data.newIndex = j;
                                 return result.data;
                             });
    };
    matchService.getLocationUsers = function (location) {
        console.log("getLocationUser!");
        var options = {

            method: 'GET',
            url: 'https://api.github.com/search/users?q=location%3A' + location,
            headers:
                {
                    'Authorization': "token 8cc6fd72bdc734e8dd63e8700c29833d8ffe4340"
                }


        }
        return $http(options)
                .then(function (result) {
                    return result.data;
                });
    };

        return matchService;

}]);
