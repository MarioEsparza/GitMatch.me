app.factory('matchService', ['$http', '$q', function ($http, $q) {

    var matchService = function () {
    };
    matchService.getLocation = function (username) {
        var options = {
            
                method: 'GET',
            url: 'https://api.github.com/users/' + username,
            headers: 
                {
                    'Authorization': "token c2369dd9c97838ae4c98fd6595ef70f07541f3b1"
                }


        }


        
               return $http(options)
                       .then(function (result) {
                           return result.data;
                       });
    };
    matchService.getUser = function (username,index) {
        var options = {

            method: 'GET',
            url: 'https://api.github.com/users/' + username,
            headers:
                {
                    'Authorization': "token c2369dd9c97838ae4c98fd6595ef70f07541f3b1"
                }


        }



        return $http(options)
                .then(function (result) {
                    result.data.index = index
                    return result.data;
                });
    };

    matchService.getRepos = function (username, j) {
        var options = {

            method: 'GET',
            url: 'https://api.github.com/users/' + username + '/repos?sort=updated',
            headers:
                {
                    'Authorization': "token c2369dd9c97838ae4c98fd6595ef70f07541f3b1"
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
                    'Authorization': "token c2369dd9c97838ae4c98fd6595ef70f07541f3b1"
                }


        }
        return $http(options)
                .then(function (result) {
                    return result.data;
                });
    };

        return matchService;

}]);
