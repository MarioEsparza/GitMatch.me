app.factory('locationService', ['$http', function ($http) {
    return {
        getUsers: function (location, language) {
        //console.log("Service Location: ", location, "FilterBy: ", language)
        var APIurl = 'https://api.github.com/search/users?q=location%3A' + location + language;
        console.log("Location Service: ", APIurl)
        return $http.get(APIurl)
                      .then(function (result) {
                          return result.data;
                      });
        }
    }
}]);
