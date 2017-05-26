app.factory('topLocationService', ['$http','$q', function ($http,$q) {
    return {
        getUsers: function (location, language) {
            console.log("Service Location: ", location, "FilterBy: ", language)
            // the location needs to say just the city, not the state or anything else
            var tokens = location.split(',');
            location = tokens[0];
            console.log(location);
            var apiPath = 'https://crossorigin.me/http://git-awards.com/api/v0/users?city=' + location + '&language=' + language;
            // modified the regex so the ':' is only changed if it's at a word boundary
            // which avoids cases like 'https://'
            // origin: header is required?
            apiPath = apiPath.replace(/:\b/g, '=');
            console.log(apiPath);
            return $http.get(apiPath)
                      .then(function (result) {
                          console.log(result.data);
                          return result.data;
                      }, function (error) {
                          return error;
                      });
        },
        getUserRepos: function(username) {
            var userApiPath = 'https://crossorigin.me/http://git-awards.com/api/v0/users/' + username;
            return $http.get(userApiPath)
                      .then(function(result) {
                          console.log(result.data);
                          return result.data;
                      }, function (error) {
                          return error;
                      });
        }
    }
}]);

