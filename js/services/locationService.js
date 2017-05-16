app.factory('locationService', ['$http', function ($http) {
    return {
        getUsers: function (location, language) {
        console.log("Service Location: ", location, "FilterBy: ", language)
        return $http.get('https://api.github.com/search/users?q=location%3A' + location + language)
                      .then(function (result) {
                          return result.data;
                      });
        }
    }
}]);
