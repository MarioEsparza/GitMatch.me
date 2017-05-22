app.factory('repoService', ['$http', function($http) {
    return {
        getRepos: function(username) {
            return $http.get('https://api.github.com/users/' + username + '/repos')
                .then(function(result) {
                    return result.data;
                });
        }
    }
}]);

