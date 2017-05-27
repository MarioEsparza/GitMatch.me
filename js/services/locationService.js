app.factory('locationService', ['$http', function ($http) {
    return {
        getUsers: function (location, language) {
            //console.log("Service Location: ", location, "FilterBy: ", language)
            var options = {

                method: 'GET',
                url: 'https://api.github.com/search/users?q=location%3A' + location + language,
                headers:
                    {
                        'Authorization': "token c2369dd9c97838ae4c98fd6595ef70f07541f3b1"
                    }


            }
        
        
        return $http(options)
                      .then(function (result) {
                          return result.data;
                      });
        }
    }
}]);
