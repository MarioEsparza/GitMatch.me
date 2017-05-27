app.factory('locationService', ['$http', function ($http) {
    return {
        getUsers: function (location, language) {
            //console.log("Service Location: ", location, "FilterBy: ", language)
            var options = {

                method: 'GET',
                url: 'https://api.github.com/search/users?q=location%3A' + location + language,
                headers:
                    {
                        'Authorization': "token 349ba6fbff6665eaed468f30e6b2877a8afacc32"
                    }


            }
        
        
        return $http(options)
                      .then(function (result) {
                          return result.data;
                      });
        }
    }
}]);
