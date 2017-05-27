app.factory('locationService', ['$http', function ($http) {
    return {
        getUsers: function (location, language) {
            //console.log("Service Location: ", location, "FilterBy: ", language)
            var options = {

                method: 'GET',
                url: 'https://api.github.com/search/users?q=location%3A' + location + language,
                headers:
                    {
                        'Authorization': "token ab0d3e2a402a9b6e98a9bd2fad311329f4923c9b"
                    }


            }
        
        
        return $http(options)
                      .then(function (result) {
                          return result.data;
                      });
        }
    }
}]);
