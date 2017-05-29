app.factory('jsonService', ['$http', '$q', function ($http, $q) {

    var jsonService = function () {
    };
        jsonService.getColors = function () {
            return $http.get('https://raw.githubusercontent.com/BaReinhard/github-colors/master/colors.json')
                       .then(function (result) {
                           return result.data;
                       }, function (error) {
                           console.log(error);
                           return error;
                       });
         };
        return jsonService;

}]);
