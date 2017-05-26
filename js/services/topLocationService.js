app.factory('topLocationService', ['$http','$q', function ($http,$q) {
    return {
        getUsers: function (location, language) {
            console.log("Service Location: ", location, "FilterBy: ", language)
            var apiPath = 'https://crossorigin.me/http://git-awards.com/api/v0/users?city=' + location + '&language=' + language;
            //apiPath = apiPath.replace(/:/g, '+');
       
            return $http.get(apiPath)
                      .then(function (result) {
                          return result.data;
                      }, function (error) {
                          return error;
                      });
        }
    }
}]);
