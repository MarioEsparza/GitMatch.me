app.controller('HomeController', ['$scope', '$timeout', '$http', '$sce', '$location', 'locationService', function ($scope, $timeout, $http, $sce, $location, locationService) {
    //Variables
    var APIkey = "AIzaSyA6GIc9OKDoXKgSP0hK4hDWP5vYcf4Z2E8"
    var resultLength = null;
    var latitude, longitude = null;
    var searchRadius = "40234";
    var nearbyLocationList = {};
    var languangeToken = "";


    $scope.location;

    // Insert HTML
    $scope.renderHtml = function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };


    //Submit
    $scope.findNear = function () {
        if ($scope.userForm.$valid) {
            // Remove Spaces from input
            var locationToken = $scope.location
         
            //Google Maps Geocode
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + locationToken + '&key=' + APIkey)
              .then(function (result) {

                  console.log("GeoCode Address: ", result.data.results[0].formatted_address);
                  console.log("GeoCode LAT: ", result.data.results[0].geometry.location.lat, "\n LNG: ", result.data.results[0].geometry.location.lng);
                  //Lat and Lng variable will be passed to the Google places API to get nearby cities
                  latitude = result.data.results[0].geometry.location.lat;
                  longitude = result.data.results[0].geometry.location.lng;
                  //$scope.geodata = $scope.queryResults[0].geometry

              
              },
               function error(_error) {
                   $scope.Error = _error;
               })

            //Google Places API to get nearby cities (Within 25 Miles)
            var myLatlng = new google.maps.LatLng(latitude, longitude);
            var service = new google.maps.places.PlacesService($('#service-helper').get(0));

            service.nearbySearch({
                location: myLatlng,
                radius: searchRadius,
                types: ['locality']

            }, callback);
            function callback(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log("Nearby Search SUCCESS: ", results.length);
                    for (var i = 0; i < results.length; i++) {
                        nearbyLocationList[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
                    }
                    console.log("Nearby Places: ", nearbyLocationList);
  
                }
                else {
                    console.log("Nearby Search FAIL");
                }
            }
            //Calls gitAPI and passes locationToken formatted for the call
            $scope.gitAPI($scope.location.replace(/\s+/g, '-').toLowerCase());

            /*GitHub APi*
            // Remove Spaces from input
            var locationToken = $scope.location.replace(/\s+/g, '-').toLowerCase();
            //Hard coded language filter
            var languangeToken = "";
            //var languangeToken = "+language:python+language:javacscript";

            //Passes location to Factory. Determines whether return data is good.
            var getData = locationService.getUsers(locationToken, languangeToken);
            getData.then(function (response) {
                $scope.returnData = response;
                resultLength = $scope.returnData.total_count;
                console.log("GitHub # of Users: ",$scope.returnData.total_count);
                console.table($scope.returnData.items);

                if (resultLength < 5) {
                    //If GitHub API results are less than 5, then search nearby location
                    //Google Place Nearby  

                }
            })
            */
 

        }//End Valid Submit
    }

    $scope.gitAPI = function (locationT) {
        /*GitHub APi*/
        // Remove Spaces from input
        var locationToken = locationT;       

        //Passes location to Factory. Determines whether return data is good.
        var getData = locationService.getUsers(locationToken, languangeToken);
        getData.then(function (response) {
            $scope.returnData = response;
            resultLength = $scope.returnData.total_count;
            console.log("GitHub # of Users: ", $scope.returnData.total_count);
            console.table($scope.returnData.items);

            if (resultLength < 5) {
                //If GitHub API results are less than 5, then search nearby location
                //$scope.gitAPI(nearbyLocationList[0]);

            }
        })
    };


    //Dropdown Menu WIP
    var options = [];
    $('.dropdown-menu a').on('click', function (event) {
    //languangeToken is reset every click.
        languangeToken = "";
        var $target = $(event.currentTarget),
            val = $target.attr('data-value'),
            $inp = $target.find('input'),
            idx;

        if ((idx = options.indexOf(val)) > -1) {
            options.splice(idx, 1);
            setTimeout(function () { $inp.prop('checked', false) }, 0);
        } else {
            options.push(val);
            setTimeout(function () { $inp.prop('checked', true) }, 0);
        }

        $(event.target).blur();

        //When a checkbox is clicked thevariable "languageToken" is updated. A search should always have accut
        for (var i = 0; i < options.length; i++) {
            languangeToken += '+language:' + options[i];
        }
        console.log(options);
        console.log("Language Token: ", languangeToken);
        return false;
    });
}]);