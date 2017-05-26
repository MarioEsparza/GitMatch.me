app.controller('HomeController', ['$scope', '$timeout', '$http', '$sce', '$location', '$anchorScroll', 'locationService', 'matchService', 'jsonService', '$q','topLocationService', function ($scope, $timeout, $http, $sce, $location, $anchorScroll, locationService, matchService, jsonService, $q,topLocationService) {
    //Variables
    $scope.topLanguagesList = [];
    const googleAPIkey = "AIzaSyA6GIc9OKDoXKgSP0hK4hDWP5vYcf4Z2E8"
    var OAuthUrl = "https://github.com/login/oauth/authorize?client_id=f9d85111ad2fea5dd1a9&redirect_uri=http://beta-gitnear.azurewebsites.net";
    var weightedLanguages = [];
    $scope.topFive = [];
    var matchScore = [];
    var matchesPercents = [];
    var GitMatchFactor = 14.843474908426657;
    $scope.matchPercent
    $scope.matchNearbyLocations = [];
    $scope.matchNearbyAttempts = 0;
    var lanaguageMultiplier = 1;
    var resultLength = null;
    var latitude, longitude = null;
    var searchRadius = "40234"; // 25 miles in meters
    var extendedSearchRadius = "80468"; //50 miles in meters
    var nearbyLocationList = [];
    var gitColors = [];
    var languangeToken = "";
    var googleMapStyle1 = "&style=element:labels|visibility:off|color:0xf49f53&style=feature:water|element:geometry|color:0x42a9ee|lightness:17&style=feature:landscape|element:geometry|color:0xf5f5f5|lightness:20&style=feature:road.highway|element:geometry.fill|color:0xffffff|lightness:17&style=feature:road.highway|element:geometry.stroke|color:0xffffff|lightness:29|weight:0.2&style=feature:road.arterial|element:geometry|color:0xffffff|lightness:18&style=feature:road.local|element:geometry|color:0xffffff|lightness:16&style=feature:poi|element:geometry|color:0xf5f5f5|lightness:21&style=feature:poi.park|element:geometry|color:0xdedede|lightness:21&style=element:labels.text.stroke|visibility:off|color:0xffffff|lightness:16&style=element:labels.text.fill|saturation:36|color:0x333333|lightness:40&style=element:labels.icon|visibility:off&style=feature:transit|element:geometry|color:0xf2f2f2|lightness:19&style=feature:administrative|element:geometry.fill|color:0xfefefe|lightness:20&style=feature:administrative|element:geometry.stroke|color:0xfefefe|lightness:17|weight:1.2";
    var myChart = null;
    var myChartMatch = null;
    var bestMatch_Language = [];
    var gotTop = false;
    $scope.currentTop = 0;
    $scope.showResults = false;
    $scope.getGitAttempts = 0;
    $scope.lastGetGitAttempts = -1;
    $scope.selected = "";
    $scope.searchRepo = "";
    $scope.selectedRepo = "";
    $scope.repoList = [];
    $scope.repoValue = {};
    $scope.emailAddress = null;
    $scope.topFiveOriginalIndex = [];
    var usernameSender = "";
    var usernameReceiver = "";
    $scope.users = [];
    $scope.topUserPerLanguage = [];
    // Send Email Function
    $scope.sendEmail = function () {
        if ($scope.userName.toLowerCase() == "bareinhard") {
            if ($scope.selectedRepo.value != "none") {
                var emailJSON = {
                    emailAddress: "brettreinhard@gmail.com",
                    repo: 'https://github.com/' + $scope.selectedRepo.value,
                    usernameSender: usernameSender,
                    usernameReceiver: $scope.emailAddress
                }
            } else {
                var emailJSON = {
                    emailAddress: "brettreinhard@gmail.com",
                    repo: $scope.selectedRepo.value,
                    usernameSender: usernameSender,
                    usernameReceiver: usernameReceiver
                }
            }
            $http.post('https://prod-18.southcentralus.logic.azure.com:443/workflows/c0ecbbfc0eba409281d256ff34c7a6c0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bzv-FvzJhnMFl8ocz3TrJi4mOZs4MciyMix4W2D3058', emailJSON).then(function (data) {
                //console.log(data);
            }, function (error) {
                //console.log(error);
            })
        }
        //window.location.replace("https://github.com/login/oauth/authorize?client_id=f9d85111ad2fea5dd1a9&redirect_uri=http://beta-gitnear.azurewebsites.net/#!/emailsent");
        //Email Sent Success Goes Here
    };



    $scope.getRepos = function (text) {

        text = text.toLowerCase();
        var ret = $scope.repoList.filter(function (d) {
            return d.display.toLowerCase().startsWith(text);
        });
        return ret;
    }

    // Disable Menu from closing after selecting a auto complete field
    $('.md-virtual-repeat-offsetter').bind('click', function (e) {
        e.stopPropagation();
        $('.md-virtual-repeat-offsetter').css({ marginTop: '=28px' });
    });
    // Stops click event from bubbling up to built in dropdown-menu click event function
    $('.dropdown-menu').bind('click', function (e) {
        e.stopPropagation();
    })



    // Locations to be used as Check Boxes
    $scope.languages = ["JavaScript", "Python", "C#"];

    var getData = jsonService.getColors();
    getData.then(function (response) {
        angular.forEach(response, function (value, key) {
            //console.log("ADDED: ", value);
            gitColors.push(value);
        });
        //console.log(gitColors);
    }, function error(_error) {
        //console.log("Failed to load GitColors JSON")
    });




    // Selected languages
    $scope.languagesSelected = [];

    $scope.addLang = function (searchText) {
        if (searchText != "" && !$scope.languages.includes(searchText)) {
            $scope.languages.push(searchText);
            $scope.toggleSelection(searchText);
            $scope.searchText = "";
            if ($scope.languages.length > 8) {
                $('.autocomplete').addClass('hidden');

            }
            //console.log($scope.languages.length);
        } else if ($scope.languages.includes(searchText)) {
            if ($scope.languagesSelected.indexOf(searchText) == -1) {
                $scope.toggleSelection(searchText);
                $scope.searchText = "";

            } else {

                $scope.toggleSelection(searchText);
                $scope.searchText = "";
            }


        }

    }
    // Toggle selection for a given language by name
    $scope.toggleSelection = function toggleSelection(langName) {
        var idx = $scope.languagesSelected.indexOf(langName);

        // Is currently selected
        if (idx > -1) {
            $scope.languagesSelected.splice(idx, 1);
        }

            // Is newly selected
        else {
            $scope.languagesSelected.push(langName);
        }
        //console.log($scope.languagesSelected);
    };



    // Insert HTML
    $scope.renderHtml = function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
    $('#searchbar').affix({
        offset: {
            top: $(window).height() * .50
        }
    });

    //Near Submit
    $scope.findNear = function () {
        var matchLanguagesArray = [];
        var matchLanguagesCount = [];
        if ($scope.userForm.$valid) {
            // Remove Spaces from input
            var locationToken = $scope.location

            //Google Maps Geocode
            $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + locationToken + '&key=' + googleAPIkey)
              .then(function (result) {

                  //console.log("GeoCode Address: ", result.data.results[0].formatted_address);
                  //console.log("GeoCode LAT: ", result.data.results[0].geometry.location.lat, "\n LNG: ", result.data.results[0].geometry.location.lng);
                  //Lat and Lng variable will be passed to the Google places API to get nearby cities
                  latitude = result.data.results[0].geometry.location.lat;
                  longitude = result.data.results[0].geometry.location.lng;
                  //$scope.geodata = $scope.queryResults[0].geometry

                  // Needs to wait for ajax for proper variables
                  //Google Places API to get nearby cities (Within 25 Miles)
                  var myLatlng = new google.maps.LatLng(latitude, longitude);
                  var service = new google.maps.places.PlacesService($('#service-helper').get(0));

                  // Search NearBy Locations
                  service.nearbySearch({
                      location: myLatlng,
                      radius: searchRadius,
                      types: ['locality']
                      // Call nearbySearchResults
                  }, nearbySearchResults);

              }, // End of Map Geocode Successful CallBack
               function error(_error) {
                   $scope.Error = _error;
               })// End of Map Geocode Error CallBack

            $scope.getTop();
            // Call Back Executed when Nearby Search returns its promise
            function nearbySearchResults(results, status) {
                $scope.usersReturned = [];
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    //console.log("Nearby Search SUCCESS: ", results.length);
                    for (var i = 0; i < results.length; i++) {
                        nearbyLocationList[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
                    }
                    //console.log("Nearby Places: ", nearbyLocationList);

                }
                else {
                    //console.log("Nearby Search FAIL");
                }

                // Called within call back

                $scope.gitAPI($scope.location.replace(/\s+/g, '-').toLowerCase());
            }
        }//End Valid Submit
    }
    // Create Token for GitHub Api Call
    $scope.createLanguageToken = function () {
        var languageT = "";
        for (var i = 0; i < $scope.languagesSelected.length; i++) {
            languageT += "+language:" + $scope.languagesSelected[i];
        }
        if ($scope.selectedItem != null) {
            languageT += "+language:" + $scope.selectedItem.display;
        }
        return languageT;
    }
    $scope.gitAPI = function (locationT) {
        $scope.topLanguagesList = [];
        matchLanguagesArray = [];
        matchLanguagesCount = [];
        
        /*GitHub APi*/
        languangeToken = "";
        var locationToken = locationT;
        languangeToken = $scope.createLanguageToken();
        //Passes location to Factory. Determines whether return data is good.
        var getData = locationService.getUsers(locationToken, languangeToken);
        getData.then(function (response) {
            //console.log(response);
            $scope.returnData = response;
            // Creates appended list of users returned
            if ($scope.getGitAttempts == 0) {
                $scope.usersReturned = response.items
                console.log("First set of users returned", $scope.usersReturned)
            } else {
                $scope.usersReturned.push.apply($scope.usersReturned, response.items);
                //console.log("Next set of users returned ", $scope.usersReturned)
            }
            resultLength = $scope.usersReturned.length;

            //console.log("GitHub # of Users returned from API Call", $scope.returnData.total_count);
            //console.log("GitHub # of Total Users: ", $scope.usersReturned.length);
            console.table($scope.usersReturned);
            if (resultLength < 10) {
                ;//If GitHub API results are less than 10, then search nearby location
                if ($scope.getGitAttempts < nearbyLocationList.length) {
                    //Increment $scope.getGitAttempts each call from nearbyLocationList, attempts the next location given the names aren't too similar
                    //console.log(locationT != nearbyLocationList[$scope.getGitAttempts].replace(/\s+/g, '-').toLowerCase())

                    

                    // Compares locationT , which was passed to  $scope.gitAPI and already formatted in a token format, and the formatted nearbyLocationList item
                    if (locationT == nearbyLocationList[$scope.getGitAttempts].replace(/\s+/g, '-').toLowerCase()) {
                        $scope.getGitAttempts++;
                        //console.log("Skipped, too similar of location");
                    }
                    //Starts search for next location in list
                    //console.log("Starting next location")
                    $scope.gitAPI(nearbyLocationList[$scope.getGitAttempts++]);


                } else if ($scope.getGitAttempts == nearbyLocationList.length) {
                    // Broaden Search Locations and remove previously searched locations
                    
                    console.log("Last", $scope.lastGetGitAttempts);
                    console.log("Previous", $scope.getGitAttempts);
                    var myLatlng = new google.maps.LatLng(latitude, longitude);
                    var service = new google.maps.places.PlacesService($('#service-helper').get(0));
                    // Extended Search NearBy Locations
                    service.nearbySearch({
                        location: myLatlng,
                        radius: extendedSearchRadius,
                        types: ['locality']
                        // Call nearbySearchResults
                    }, extendedNearbySearchResults);
                } 

            } else {
                getLanguages();
                
                        
                        
                        
                       
                            

                        
                       

                    
                    

                   
                    
                
                
                    
                

                
            }
            
        }, function (fail) {
            console.log(fail);
        })
    };

    // Extended Call Back executed when Extended Nearby Search returns its promise
    function extendedNearbySearchResults(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            //console.log("EXTENDED Nearby Search SUCCESS: ", results.length);
            //console.log(results);
            var currentResult = results[0].name;
            for (var i = 0; i < results.length; i++) {
                currentResult = results[i].name.replace(/\s+/g, '-').toLowerCase();
                if (nearbyLocationList.indexOf(currentResult) == -1) {
                    nearbyLocationList[nearbyLocationList.length] = currentResult;
                } else {
                    //console.log("Location already in list", currentResult);
                }

            }
            //console.log("Nearby Places: ", nearbyLocationList);

        }
        else {
            //console.log("Nearby Search FAIL");
        }

        // Called within call back
        if (nearbyLocationList.length > $scope.getGitAttempts) {
            $scope.gitAPI(nearbyLocationList[$scope.getGitAttempts++]);
        }
        else {
            if ($scope.topLanguagesList.length != 0) {
                // Get top Languages for the matching
                getLanguages();
            } else {
                //display modal error
            }
            
            //console.log("No new search locations were found, adding another extend may not yield much and whether or not to do so will come down to how much we value the GitHub API calls")
        }
    }
    function getLanguages() {
        // Helper Function to get Top Languages
        function findLocationRepos(username) {
            var repoPromises = []
            var getRepos = matchService;
            repoPromises.push(getRepos.getRepos(username.login, null).then(function (response) {
                $scope.currentMatchRepo = response;
                angular.forEach($scope.currentMatchRepo, function (value, key) {

                    console.log("start the promise");

                    //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                    if ($scope.currentMatchRepo.length) {
                        //Then checks to se if it's not already in array
                        var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                        if (matchItemIndex < 0) {

                            matchLanguagesArray.push(value.language);
                            matchLanguagesCount.push(1)

                        } else {
                            matchLanguagesCount[matchItemIndex]++;
                        }


                    }




                });


            }, function (error) {
                console.log(error);
            }));
            return $q.all(repoPromises)

        }



        var promises = []
        angular.forEach($scope.usersReturned, function (username, index) {

            promises.push(findLocationRepos(username))
        });
        $q.all(promises).then(function () {


            for (var i = 0; i < matchLanguagesCount.length; i++) {
                if (matchLanguagesArray[i] != null) {

                    $scope.topLanguagesList.push({ language: matchLanguagesArray[i], count: matchLanguagesCount[i] });
                }
            }
            var swapped;
            do {
                swapped = false;
                for (var z = 0; z < $scope.topLanguagesList.length - 1; z++) {
                    if (parseInt($scope.topLanguagesList[z].count) < parseInt($scope.topLanguagesList[z + 1].count)) {
                        var temp = { language: $scope.topLanguagesList[z].language, count: $scope.topLanguagesList[z].count };
                        $scope.topLanguagesList[z] = $scope.topLanguagesList[z + 1]
                        $scope.topLanguagesList[z + 1] = temp
                        swapped = true

                    }
                }

            } while (swapped)


            // Display Languages in Console
            for (var i = 0; i < $scope.topLanguagesList.length; i++) {
                console.log("Top Language", $scope.topLanguagesList[i].language, "Top Count", $scope.topLanguagesList[i].count);
            }
        })


    }


    // Proof of Concept for Git-Awards CORS-ByPass for Top-Location
    //console.log("Dont mind this, the site still works, but I need to test on mobile")
    //$http.get("https://crossorigin.me/http://git-awards.com/api/v0/users?city=los+angeles&language=shell").then(function (data) {
    //    //console.log(data);
    //    Use this one if you wanna see a familiar face :P
    //    //console.log(data.data[13]);
    //}, function (error) {

    //})


    // No works!
    $scope.gitTopAPI = function (locationT) {

        // Remove Spaces from input
        var locationToken = locationT;
        languageToken = $scope.languagesSelected[0];
        languageToken = languageToken.replace(/\s+/g, '+').toLowerCase()
        //Passes location to Factory. Determines whether return data is good.
        // Requires different token format
        // replace : with =
        // EG https://crossorigin.me/http://git-awards.com/api/v0/users?city=los+angeles&language=shell
        var getData = topLocationService.getUsers(locationToken, languageToken);
        getData.then(function (response) {
            console.log(response);
            //console.log(response);
            $scope.returnData = response;
            resultLength = $scope.returnData.total_count;
            //console.log("GitHub # of Users: ", $scope.returnData.total_count);
            console.log("These are the Top users");
            console.table($scope.returnData.users);

            if (resultLength < 5) {
                //If GitHub API results are less than 5, then search nearby location
                //$scope.gitAPI(nearbyLocationList[0]);

            }
        })
    };

    // Function to Call gitTopApi when button pressed 
    $scope.getTop = function () {
        $scope.gitTopAPI($scope.location.replace(/\s+/g, '+').toLowerCase());
    }

    // Match Algorithm Details
    // ------ Search Based on Location and Language
    // ------ Return First User
    // ------ Show Details of User, list projects
    var promises = [];
    //Match Submit
    $scope.findMatch = function (location) {
        $scope.Matchee = [];
        bestMatchArrayLocation = [];
        bestMatchArrayCount = [];
        weightedLanguages = [];
        $scope.currentTop = 0;
        gotTop = false;
        var matchLocationToken = null;
        var matchLanguageToken = "";
        var userFound = false;
        var matchLanguagesArray = [];
        var matchLanguagesCount = [];
        var userData = null;
        var userRepoData = null;
        var matchesData = [];
        promises = [];

        if ($scope.userForm.$valid) {
            // Remove Spaces from input
            var usernameToken = $scope.userName
            
            //Match first finds the user LOCATION
            //Calls gitAPI and passes usernameToken formatted for the call
            var getData = matchService.getLocation(usernameToken);
            getData.then(function (response) {
                $scope.returnMatchData = userData = response;

                //console.log($scope.returnMatchData.login, "'s Location: ", $scope.returnMatchData.location);
                if (location != "formSubmit") {
                    $scope.returnMatchData.location = location;
                }
                //Checks to see if location is not empty
                if ($scope.returnMatchData.location) {
                    $("#match-input").removeClass('alert-danger');
                    //If true, then it assigns it to a variable that will be passed to GitHub API
                    matchLocationToken = $scope.returnMatchData.location.replace(/\s+/g, '-').toLowerCase();
                    googleLocationToken = $scope.returnMatchData.location.replace(/\s+/g, '+').toLowerCase();

                    //Dynamically the background for the match sectio based on user location
                    $scope.googleBG(googleLocationToken);

                    //Calls service to get the repos to determine laguages
                    var getData = matchService.getRepos(usernameToken);
                    getData.then(function (response) {
                        //Stores the language for every repo found
                        $scope.returnMatchData = userRepoData = response;


                        angular.forEach($scope.returnMatchData, function (value, key) {
                            //Checks to see if language is not null
                            if (value.language) {
                                // Add Repos to Angular Auto Complete
                                $scope.repoValue = {
                                    value: value.full_name,
                                    display: value.name
                                }
                                $scope.repoList.push($scope.repoValue);
                                //Then checks to se if it's not already in array
                                var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                if (matchItemIndex < 0) {
                                    //console.log("ADDED: ", value.language);
                                    matchLanguagesArray.push(value.language);
                                    matchLanguagesCount.push(1)

                                } else {
                                    //console.log("Count: ", matchLanguagesCount[matchItemIndex]);
                                    matchLanguagesCount[matchItemIndex]++;
                                    //console.log("Increased: ", matchLanguagesCount[matchItemIndex]);
                                }
                            }
                        });

                        for (var i = 0; i < matchLanguagesArray.length; i++) {
                            matchLanguageToken += '+language:' + matchLanguagesArray[i].toLowerCase();
                        }


                        //console.log("Match Tokens: ", matchLocationToken, " ", matchLanguageToken);

                        //Calls GitAPI Service to get matching users
                        var getData = locationService.getUsers(matchLocationToken, matchLanguageToken);
                        getData.then(function (response) {
                            $scope.showResults = true;  //On Success, show result section

                            //console.log(response);
                            $scope.returnData = response;
                            // Creates appended list of users returned

                            resultLength = $scope.returnData.total_count;

                            //console.log("GitHub # of Users returned from API Call", $scope.returnData.total_count);

                            console.table($scope.returnData.items);
                            matchesData = $scope.returnData.items;

                            if ($scope.returnData.total_count == 0) {
                                // Get lat and long from geo code location or
                                var myLatlng = new google.maps.LatLng(latitude, longitude);
                                var service = new google.maps.places.PlacesService($('#service-helper').get(0));

                                // Search NearBy Locations
                                service.nearbySearch({
                                    location: myLatlng,
                                    radius: extendedSearchRadius,
                                    types: ['locality']
                                    // Call nearbySearchResults
                                }, matchNearbyResults);
                                //Call Google NearyBy Locations API using $scope.returnMatchData.location
                                // Get next location
                                // then recall findMatch("Next Location"), it now takes a parameter to reuse this
                                // Limit this use


                            } else {

                                for (var i = 0; i < matchLanguagesArray.length; i++) {
                                    weightedLanguages[matchLanguagesCount[i]] = matchLanguagesArray[i];
                                }


                                $scope.displayResults(matchLanguagesArray, matchLanguagesCount, userData, userRepoData, matchesData);
                            }
                            


                        })



                    }, function error(error) {
                        //console.log("ERROR: NO REPOS FOUND")

                    })

                }
                else {
                    //Error State: display input field
                    //Ask the user to input a location
                }
                //console.table($scope.returnData.items);
            }, function error(error) {
                //console.log("ERROR: USERNOT FOUND")
                $("#match-input").addClass('alert-danger');
                $scope.userName = "User Not Found. Try Again";
            })

            //Scroll to results
            /*
            $timeout(function () {
                $('#loading-modal').modal('toggle');
                $('html, body').animate({
                    scrollTop: $("#match-section").offset().top
                }, 2000);
            }, 2000);
            */
        }//End Valid Submit
    };

    function matchNearbyResults(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            //console.log("Nearby Search SUCCESS: ", results.length);
            for (var i = 0; i < results.length; i++) {
                $scope.matchNearbyLocations[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
            }
            //console.log("Nearby Places: ", $scope.matchNearbyLocations);

        }
        else {
            //console.log("Nearby Search FAIL");
        }

        // Called within call back
        if ($scope.matchNearbyAttempts < $scope.matchNearbyLocations.length) {

            $scope.findMatch($scope.matchNearbyLocations[$scope.matchNearbyAttempts]);
        } else {
            //Tell user there are no Nearby Developers in your area.
        }
    }


    // Google Geocode & Nearby Function
    $scope.googleGeoCode = function (locationToken) {
        //Google Maps Geocode
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + locationToken + '&key=' + googleAPIkey)
          .then(function (result) {
              //console.log("GeoCode Address: ", result.data.results[0].formatted_address);
              //console.log("GeoCode LAT: ", result.data.results[0].geometry.location.lat, "\n LNG: ", result.data.results[0].geometry.location.lng);
              //Lat and Lng variable will be passed to the Google places API to get nearby cities
              latitude = result.data.results[0].geometry.location.lat;
              longitude = result.data.results[0].geometry.location.lng;
              //$scope.geodata = $scope.queryResults[0].geometry

              // Needs to wait for ajax for proper variables
              //Google Places API to get nearby cities (Within 25 Miles)
              var myLatlng = new google.maps.LatLng(latitude, longitude);
              var service = new google.maps.places.PlacesService($('#service-helper').get(0));

              // Search NearBy Locations
              service.nearbySearch({
                  location: myLatlng,
                  radius: searchRadius,
                  types: ['locality']
                  // Call nearbySearchResults
              }, nearbySearchResults);

          }, // End of Map Geocode Successful CallBack
           function error(_error) {
               $scope.Error = _error;
           })// End of Map Geocode Error CallBack


        // Call Back Executed when Nearby Search returns its promise
        function nearbySearchResults(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                //console.log("Nearby Search SUCCESS: ", results.length);
                for (var i = 0; i < results.length; i++) {
                    nearbyLocationList[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
                }
                //console.log("Nearby Places: ", nearbyLocationList);

            }
            else {
                //console.log("Nearby Search FAIL");
            }
        }
    };

    //Unused Function WIP
    $scope.gitUserInfo = function (usernameToken) {
        var ret = [];
        var getData = matchService.getLocation(usernameToken);
        getData.then(function (response) {
            //console.log("Git Info: ", response);
            return response;
        })

    };
    //Unused Function WIP
    $scope.gitRepoDetails = function () {
        //Calls service to get the repos to determine laguages
        var getData = matchService.getRepos(usernameToken);
        getData.then(function (response) {
            //Stores the language for every repo found
            $scope.returnMatchData = response;

        }, function error(error) {
            //console.log("ERROR: NO REPOS FOUND")

        })
    }

    //Unused Function WIP
    $scope.collectRepoLanguages = function (data) {
        //console.log("WHEN IS THIS RUN?");
        angular.forEach(data, function (value, key) {
            //Checks to see if language is not null
            if (value.language) {
                //Then checks to se if it's not already in array
                var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                if (matchItemIndex < 0) {
                    //console.log("ADDED: ", value.language);
                    matchLanguagesArray.push(value.language);
                    matchLanguagesCount.push(1)

                } else {
                    //console.log("Count: ", matchLanguagesCount[matchItemIndex]);
                    matchLanguagesCount[matchItemIndex]++;
                    //console.log("Increased: ", matchLanguagesCount[matchItemIndex]);
                }
            }
        });
        for (var i = 0; i < matchLanguagesArray.length; i++) {
            weightedLanguages[matchLanguagesCount[i]] = matchLanguagesArray[i];
        }

        //console.log("matchLanguagesArray", matchLanguagesArray);
        //console.log("matchLanguagesCount", matchLanguagesCount);
    }

    //Background Image Function
    $scope.googleBG = function (location) {
        //Determines the zoom for the background image of the match section
        var mapZoom = $scope.getLocationType(location);
        //console.log("Google Static Map Function. Token: ", location);
        //console.log("GOOGLE API TEST: Location Type:", mapZoom);
        switch (mapZoom) {
            case 'country':
                mapZoom = 7;
                break;
            case 'administrative_area_level_1':
                mapZoom = 9;
                break;
            case 'locality':
                mapZoom = 11;
                break;
            case 'route':
                mapZoom = 12;
                break;
            case 'neighborhood':
                mapZoom = 13;
                break;
            default:
                mapZoom = 11;
        }
        //Sets the zoom for the background image of the next section
        var googleStaticMapUrl = "https://maps.googleapis.com/maps/api/staticmap?center=" + location + googleMapStyle1 + '&zoom=' + mapZoom + '&size=640x640&key=' + googleAPIkey;

        $('.result-section').css({ 'background-image': '  linear-gradient( 0deg, rgba(255,255,255, 0.9),  rgba(174,223,242, 0.3)), url(' + googleStaticMapUrl + ')' });
    };

    //Helps determine the map zoom
    $scope.getLocationType = function (location) {
        //Google Maps Geocode
        $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=' + googleAPIkey)
          .then(function (result) {
              //console.log("Match Location Type: ", result.data.results[0].types[0]);
              return result.data.results[0].types[0];

          }, // End of Map Geocode Successful CallBack
           function error(_error) {
               $scope.Error = _error;
               //console.log("Get Location Type Fail")
           })// End of Map Geocode Error CallBack

    };

    $scope.displayResults = function (language, languageCount, userData, userRepoData, matchesData) {
        var matchLanguagesArray = [];
        var matchLanguagesCount = [];
        var bestMatchArrayLocation = [];
        var bestMatchArrayCount = [];
        matchScore = [];
        matchesPercents = [];

        //Hard coded random number currently determines the match i.e matchesData[randomNumber]
        var randomNumber = getRandomInt(0, matchesData.length - 1);
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        //console.log("Display Function: Languages: ", language.length, "Count: ", languageCount.length);
        //$scope.usersMatchesData = matchesData
        //console.log("Display Function User Repo Data", userRepoData);

        //Temp Fix: Function GitUserInfo returning an undefined
        // This function seaches through the users matchesData obj (Only 30 users at the moment) and will determine the best match based on number of languages matches
        findBestMatch();

        function findBestMatch() {
            var bestMatchNumber = 0;
            var matchingLanguagesCounter = 0;
            // Wait for fetchEachRepo to complete
            fetchEachRepo().then(function () {
                displayMatches($scope.currentTop);
            });



            function fetchEachRepo() {
                
                var deffered;
                var angularDeferred;
                var foreachRepoCallback;
                usernameSender = $scope.userName;
                for (var j = 0; j < matchesData.length; j++) {
                    //console.log(matchesData[j]);
                    //console.log("J: ", j);
                    //console.log("matchesData[j].login", matchesData[j].login);
                    //console.log("$scope.returnMatchData.login", $scope.userName);
                   if (matchesData[j].login.toLowerCase() != $scope.userName.toLowerCase()) {


                        deferred = $q.defer();
                        var getData = matchService.getRepos(matchesData[j].login, j);
                        promises.push(getData.then(function (response) {
                            matchingLanguagesCounter = 0;
                            //Stores the language for every repo found
                            $scope.currentMatchRepo = response;
                            promises.push(forEachRepo($scope.currentMatchRepo, response.newIndex));
                            //console.log("match array2:  ", bestMatchArrayLocation);
                        }, function error(error) {
                            //console.log("ERROR: NO REPOS FOUND")

                        }));
                    }
                    //console.log("Matching Languages Counter",matchingLanguagesCounter);
                    //console.log("Best Match Number",bestMatchNumber);
                    //if (matchingLanguagesCounter > bestMatchNumber) {
                    //    bestMatchNumber = matchingLanguagesCounter;
                    //    //console.log("New Best Match: ", j, bestMatchNumber);
                    //    if (bestMatchArrayLocation.length == 0) {
                    //        bestMatchArrayLocation.push(j);
                    //    } else {
                    //        bestMatchArrayLocation.unshift(j);
                    //    }
                    //    //console.log("Best Match Array: ", bestMatchArrayLocation);
                    //}

                }
                //console.log("Fetching Repo Done");
                return $q.all(promises);
            }

            function forEachRepo(currentMatchRepo, index) {
                var newPromises = [];
                var newAngularDeferred = $q.defer();
                matchLanguagesArray = [];
                matchingLanguagesCounter = 1;
                newPromises.push(newAngularDeferred.promise);
                //console.log("Counter In: ", matchingLanguagesCounter);
                //console.log(weightedLanguages);
                angular.forEach(currentMatchRepo, function (value, key) {
                    //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                    if (currentMatchRepo.length) {
                        for (var i = 0; i < language.length; i++) {
                            if (value.language == language[i]) {
                                lanaguageMultiplier = weightedLanguages.indexOf(value.language);
                                if (lanaguageMultiplier == -1) {
                                    lanaguageMultiplier = 1;
                                }
                                //Then checks to se if it's not already in array
                                var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                if (matchItemIndex < 0) {
                                    if ($scope.userData.public_repos >= 30) {

                                        matchingLanguagesCounter = matchingLanguagesCounter + 30;
                                    } else {

                                        matchingLanguagesCounter = matchingLanguagesCounter + $scope.userData.public_repos;
                                    }
                                    //console.log("Counter++", value.language);
                                    //bestMatch_Language.push({ lang: value.language, count: matchingLanguagesCounter });
                                    matchLanguagesArray.push(value.language);
                                    // matchLanguagesCount.push(1)


                                } else {
                                    matchingLanguagesCounter = matchingLanguagesCounter + (1* lanaguageMultiplier);
                                }
                            }
                        }
                    }
                    
                });
                bestMatchArrayLocation.push(index);
                bestMatchArrayCount.push(Math.log(matchingLanguagesCounter)*GitMatchFactor);
                console.log("Index: ", index, "matchingLanguagesCounter", matchingLanguagesCounter, "matchingLanguages arry", matchLanguagesArray);
                newAngularDeferred.resolve();
                //console.log("Counter Out: ", matchingLanguagesCounter);
                

                //console.log("Best Match Array: ", bestMatchArrayLocation);
                //if (matchingLanguagesCounter > bestMatchNumber) {
                //    bestMatchNumber = matchingLanguagesCounter;
                //    //console.log("New Best Match: ", index, bestMatchNumber);

                //    bestMatchArrayLocation.push(index);
                //    bestMatchArrayCount.push(matchingLanguagesCounter);

                //    //console.log("Best Match Array: ", bestMatchArrayLocation);
                //}
                return $q.all(newPromises)
            }

        }
        $scope.nextDisplay = function (index) {

            ++index;
            ++$scope.currentTop;
            //console.log(index);
            displayMatches(index);
        }
        $scope.previousDisplay = function (index) {

            --index;
            --$scope.currentTop;
            //console.log(index);
            displayMatches(index);
        }
        function displayMatches(index) {
            /* The following portion is to get the top user per language in a given location */

            // Get UserNames and Star Counts for Top Language and Location
            var getData = topLocationService.getUsers(googleLocationToken, matchLanguagesArray[0]);
            getData.then(function (response) {
                // this gives me the initial list of users
                // the response has the objects, which include the stars_count member
                $scope.returnData = response.users;
                var starsArray = [];
                for (var i = 0; i < $scope.returnData.length; i++) {
                    starsArray.push({ username: $scope.returnData[i].login, stars: $scope.returnData[i].stars_count });
                }
                console.log(starsArray);
            })
            

            matchLanguagesArray = [];
            matchLanguagesCount = [];
            //console.log(bestMatch_Language);
            bestMatchNum = bestMatchArrayLocation;
            //console.log("match array: ", bestMatchArrayLocation);
            //console.log("match array count: ", bestMatchArrayCount);
            var load = [];
            if (index == 0 && !gotTop) {

                var maxCount = 0;
                var maxIndex = 0;
                $scope.topFive = [];
                for (var p = 0; p < 5; p++) {
                    maxIndex = 0;
                    maxCount = 0;
                    for (var o = 0; o < bestMatchArrayLocation.length; o++) {
                        if (bestMatchArrayCount[o] > maxCount) {
                            maxCount = bestMatchArrayCount[o];
                            maxIndex = bestMatchArrayLocation[o];
                        }
                    }
                    if (maxIndex == 0 && maxCount == 0) {
                        //console.log("No more Matches found");
                    } else {
                        matchScore.push(maxCount);
                        console.log(maxCount);
                        console.log(maxIndex);
                        matchesPercents.push(maxCount);
                        $scope.topFiveOriginalIndex.push(maxIndex);
                        $scope.topFive.push(bestMatchArrayLocation[bestMatchArrayLocation.indexOf(maxIndex)]);
                        bestMatchArrayCount.splice(bestMatchArrayLocation.indexOf(maxIndex), 1);
                        bestMatchArrayLocation.splice(bestMatchArrayLocation.indexOf(maxIndex), 1);
                    }
                }
                // GET TOP STARS FOR MATCHES
                var getMatchDataSearcher = topLocationService.getUserRepos($scope.userName);
                load.push(getMatchDataSearcher.then(function (data) {
                    var starCounter = 0;
                    for (var i = 0; i < data.user.rankings.length;i++){
                        starCounter = starCounter + data.user.rankings[i].stars_count;
                    }
                    console.log("Username: ", data.user.login, " Star Count: ", starCounter);
                    $scope.Searcher = { username: data.user.login, stars: starCounter };
                }, function (error) {
                    // ERROR GOES HERE
                }));
                for (var b = 0; b < $scope.topFive.length; b++) {
                    var getMatchDataMatchee = topLocationService.getUserRepos(matchesData[$scope.topFive[b]].login);
                    load.push(getMatchDataMatchee.then(function (data) {
                        var starCounter = 0;
                        for (var i = 0; i < data.user.rankings.length; i++) {
                            starCounter = starCounter + data.user.rankings[i].stars_count;
                        }
                        console.log("Username: ", data.user.login, " Star Count: ", starCounter);
                        $scope.Matchee.push({ username: data.user.login, stars: starCounter });
                    }, function (error) {
                    }))
                }
            }
            

            for (var x = 0; x < $scope.topFive.length; x++) {
                console.log("TOP FIVE", matchesData[$scope.topFive[x]].login);
                console.log("Match Score", matchScore[x]);
            }
            $scope.matchPercent = parseInt(matchesPercents[index]);

            usernameReceiver = matchesData[$scope.topFive[index]].login;
            var getData = matchService.getLocation(matchesData[$scope.topFive[index]].login);
            getData.then(function (response) {
                $scope.currentMatch = response;
                $scope.emailAddress = response.email;
                console.log("Found Matches Email:", $scope.emailAddress);
            })

            //Displays the bestMatch's repos. 
            var getData = matchService.getRepos(matchesData[$scope.topFive[index]].login);
            getData.then(function (response) {
                //console.log("JASKJDHKLAJSHDLKJASHDAS",response);
                //Stores the language for every repo found
                $scope.currentMatchRepo = response;


                // Can be used for most popular language by location
                angular.forEach($scope.currentMatchRepo, function (value, key) {

                    //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                    if ($scope.currentMatchRepo.length) {
                        for (var i = 0; i < language.length; i++) {
                            if (value.language == language[i]) {
                                //Then checks to se if it's not already in array
                                var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                if (matchItemIndex < 0) {

                                    matchLanguagesArray.push(value.language);
                                    matchLanguagesCount.push(1)

                                } else {
                                    matchLanguagesCount[matchItemIndex]++;
                                }
                            }
                        }
                    }

                });

                if (myChartMatch != null) {
                    myChartMatch.destroy();
                }

                var totalItems = matchLanguagesArray.length;
                var pieDatasets = [];
                var pieBackgroundColors = [];
                //console.log(matchLanguagesArray);
                for (var i = 0; i < matchLanguagesArray.length; i++) {
                    pieBackgroundColors.push(getColor(matchLanguagesArray[i]))
                    pieDatasets.push(totalItems - (totalItems - matchLanguagesCount[i]))
                }



                var ctx = document.getElementById('myChartMatch').getContext('2d');

                myChartMatch = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: matchLanguagesArray,
                        datasets: [{
                            data: pieDatasets,
                            backgroundColor: pieBackgroundColors
                        }]
                    },
                    options: {
                        scales: {
                            responsive: true,

                        }
                    }
                });

            }, function error(error) {
                //console.log("ERROR: NO REPOS FOUND")

            })
            //Output Results
            if (index == 0 && !gotTop) {
                gotTop = true;
                $q.all(load).then(function () {
                    $timeout(function () {
                        $scope.repoList.push({ value: "none", display: "No specific repo" });
                        $('#loading-modal').modal('toggle');
                        $('html, body').animate({
                            scrollTop: $("#match-section").offset().top
                        }, 2000);
                    }, 3000);
                })
                
            }
        };

        //console.log("Display Function Current Match Detail", currentMatchDetails );

        $scope.userData = userData;
        $scope.userRepos = "https://github.com/" + userData.login + "?tab=repositories";
        // Pie Chart
        //Fixed Bug where old pie data showed on hover
        if (myChart != null) {
            myChart.destroy();
        }

        var totalItems = language.length;
        var pieDatasets = [];
        var pieBackgroundColors = [];

        for (var i = 0; i < language.length; i++) {
            pieBackgroundColors.push(getColor(language[i]))
            pieDatasets.push(totalItems - (totalItems - languageCount[i]))
        }


        function getColor(language) {
            for (var z = 0; z < gitColors.length; z++) {
                if (gitColors[z].name == language) {
                    //console.log("Color Found in JSON:", gitColors[z].color);
                    return gitColors[z].color
                }
            }
        }

        var ctx = document.getElementById('myChart2').getContext('2d');

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: language,
                datasets: [{
                    data: pieDatasets,
                    backgroundColor: pieBackgroundColors
                }]
            },
            options: {
                scales: {
                    responsive: true,

                }
            }
        });
    };




    //Dropdown Menu WIP
    var options = [];

    // Other Programming Languages Not Included as Check Boxes
    $scope.otherLanguages = [{
        value: "JavaScript",
        display: "JavaScript"
    }, {
        value: "Java",
        display: "Java"
    }, {
        value: "Ruby",
        display: "Ruby"
    }, {
        value: "Python",
        display: "Python"
    }, {
        value: "PHP",
        display: "PHP"
    }, {
        value: "CSS",
        display: "CSS"
    }, {
        value: "C++",
        display: "C++"
    }, {
        value: "C",
        display: "C"
    }, {
        value: "C#",
        display: "C#"
    }, {
        value: "Objective-C",
        display: "Objective-C"
    }, {
        value: "Shell",
        display: "Shell"
    }, {
        value: "R",
        display: "R"
    }, {
        value: "Perl",
        display: "Perl"
    }, {
        value: "Go",
        display: "Go"
    }, {
        value: "VimL",
        display: "VimL"
    }, {
        value: "CoffeeScript",
        display: "CoffeeScript"
    }, {
        value: "Scala",
        display: "Scala"
    }, {
        value: "Haskell",
        display: "Haskell"
    }, {
        value: "Clojure",
        display: "Clojure"
    }, {
        value: "TeX",
        display: "TeX"
    }, {
        value: "Emacs Lisp",
        display: "Emacs Lisp"
    }, {
        value: "Lua",
        display: "Lua"
    }, {
        value: "Puppet",
        display: "Puppet"
    }, {
        value: "Groovy",
        display: "Groovy"
    }, {
        value: "Arduino",
        display: "Arduino"
    }, {
        value: "Swift",
        display: "Swift"
    }, {
        value: "Matlab",
        display: "Matlab"
    }, {
        value: "Erlang",
        display: "Erlang"
    }, {
        value: "ActionScript",
        display: "ActionScript"
    }, {
        value: "Visual Basic",
        display: "Visual Basic"
    }, {
        value: "Processing",
        display: "Processing"
    }, {
        value: "PowerShell",
        display: "PowerShell"
    }, {
        value: "TypeScript",
        display: "TypeScript"
    }, {
        value: "Rust",
        display: "Rust"
    }, {
        value: "Assembly",
        display: "Assembly"
    }, {
        value: "Common Lisp",
        display: "Common Lisp"
    }, {
        value: "D",
        display: "D"
    }, {
        value: "ASP",
        display: "ASP"
    }, {
        value: "Dart",
        display: "Dart"
    }, {
        value: "OCaml",
        display: "OCaml"
    }, {
        value: "Scheme",
        display: "Scheme"
    }, {
        value: "XSLT",
        display: "XSLT"
    }, {
        value: "Makefile",
        display: "Makefile"
    }, {
        value: "FORTRAN",
        display: "FORTRAN"
    }, {
        value: "F#",
        display: "F#"
    }, {
        value: "Julia",
        display: "Julia"
    }, {
        value: "Elixir",
        display: "Elixir"
    }, {
        value: "Haxe",
        display: "Haxe"
    }, {
        value: "Pascal",
        display: "Pascal"
    }, {
        value: "Racket",
        display: "Racket"
    }, {
        value: "VHDL",
        display: "VHDL"
    }, {
        value: "Prolog",
        display: "Prolog"
    }, {
        value: "Verilog",
        display: "Verilog"
    }, {
        value: "Logos",
        display: "Logos"
    }, {
        value: "ColdFusion",
        display: "ColdFusion"
    }, {
        value: "Tcl",
        display: "Tcl"
    }, {
        value: "Apex",
        display: "Apex"
    }, {
        value: "Delphi",
        display: "Delphi"
    }, {
        value: "AutoHotkey",
        display: "AutoHotkey"
    }, {
        value: "IDL",
        display: "IDL"
    }, {
        value: "AppleScript",
        display: "AppleScript"
    }, {
        value: "Vala",
        display: "Vala"
    }, {
        value: "Objective-C++",
        display: "Objective-C++"
    }, {
        value: "Standard ML",
        display: "Standard ML"
    }, {
        value: "LiveScript",
        display: "LiveScript"
    }, {
        value: "OpenEdge ABL",
        display: "OpenEdge ABL"
    }, {
        value: "M",
        display: "M"
    }, {
        value: "Pure Data",
        display: "Pure Data"
    }, {
        value: "Cuda",
        display: "Cuda"
    }, {
        value: "SQL",
        display: "SQL"
    }, {
        value: "DM",
        display: "DM"
    }, {
        value: "Coq",
        display: "Coq"
    }, {
        value: "Kotlin",
        display: "Kotlin"
    }, {
        value: "Mathematica",
        display: "Mathematica"
    }, {
        value: "XML",
        display: "XML"
    }, {
        value: "OpenSCAD",
        display: "OpenSCAD"
    }, {
        value: "SuperCollider",
        display: "SuperCollider"
    }, {
        value: "HaXe",
        display: "HaXe"
    }, {
        value: "Smalltalk",
        display: "Smalltalk"
    }, {
        value: "Ada",
        display: "Ada"
    }, {
        value: "Max",
        display: "Max"
    }, {
        value: "Gosu",
        display: "Gosu"
    }, {
        value: "BlitzBasic",
        display: "BlitzBasic"
    }, {
        value: "XQuery",
        display: "XQuery"
    }, {
        value: "SQF",
        display: "SQF"
    }, {
        value: "Objective-J",
        display: "Objective-J"
    }, {
        value: "DOT",
        display: "DOT"
    }, {
        value: "AGS Script",
        display: "AGS Script"
    }, {
        value: "Game Maker Language",
        display: "Game Maker Language"
    }, {
        value: "Lasso",
        display: "Lasso"
    }, {
        value: "AutoIt",
        display: "AutoIt"
    }, {
        value: "Elm",
        display: "Elm"
    }, {
        value: "nesC",
        display: "nesC"
    }, {
        value: "Awk",
        display: "Awk"
    }, {
        value: "SourcePawn",
        display: "SourcePawn"
    }, {
        value: "Nix",
        display: "Nix"
    }, {
        value: "Nimrod",
        display: "Nimrod"
    }, {
        value: "Eiffel",
        display: "Eiffel"
    }, {
        value: "Perl6",
        display: "Perl6"
    }, {
        value: "PureScript",
        display: "PureScript"
    }, {
        value: "Io",
        display: "Io"
    }, {
        value: "Scilab",
        display: "Scilab"
    }, {
        value: "Stata",
        display: "Stata"
    }, {
        value: "Agda",
        display: "Agda"
    }, {
        value: "Xtend",
        display: "Xtend"
    }, {
        value: "Rebol",
        display: "Rebol"
    }, {
        value: "Nemerle",
        display: "Nemerle"
    }, {
        value: "LabVIEW",
        display: "LabVIEW"
    }, {
        value: "Squirrel",
        display: "Squirrel"
    }, {
        value: "Mercury",
        display: "Mercury"
    }, {
        value: "NetLogo",
        display: "NetLogo"
    }, {
        value: "ooc",
        display: "ooc"
    }, {
        value: "XC",
        display: "XC"
    }, {
        value: "Idris",
        display: "Idris"
    }, {
        value: "GAP",
        display: "GAP"
    }, {
        value: "UnrealScript",
        display: "UnrealScript"
    }, {
        value: "Dylan",
        display: "Dylan"
    }, {
        value: "SystemVerilog",
        display: "SystemVerilog"
    }, {
        value: "Gnuplot",
        display: "Gnuplot"
    }, {
        value: "SAS",
        display: "SAS"
    }, {
        value: "Ceylon",
        display: "Ceylon"
    }, {
        value: "HTML",
        display: "HTML"
    }, {
        value: "ANTLR",
        display: "ANTLR"
    }, {
        value: "Boo",
        display: "Boo"
    }, {
        value: "MoonScript",
        display: "MoonScript"
    }, {
        value: "Augeas",
        display: "Augeas"
    }, {
        value: "CLIPS",
        display: "CLIPS"
    }, {
        value: "Factor",
        display: "Factor"
    }, {
        value: "VCL",
        display: "VCL"
    }, {
        value: "xBase",
        display: "xBase"
    }, {
        value: "AspectJ",
        display: "AspectJ"
    }, {
        value: "PAWN",
        display: "PAWN"
    }, {
        value: "Bro",
        display: "Bro"
    }, {
        value: "DCPU-16 ASM",
        display: "DCPU-16 ASM"
    }, {
        value: "Slash",
        display: "Slash"
    }, {
        value: "Monkey",
        display: "Monkey"
    }, {
        value: "COBOL",
        display: "COBOL"
    }, {
        value: "Bison",
        display: "Bison"
    }, {
        value: "Brightscript",
        display: "Brightscript"
    }, {
        value: "Arc",
        display: "Arc"
    }, {
        value: "Inform 7",
        display: "Inform 7"
    }, {
        value: "Forth",
        display: "Forth"
    }, {
        value: "PigLatin",
        display: "PigLatin"
    }, {
        value: "Oxygene",
        display: "Oxygene"
    }, {
        value: "Propeller Spin",
        display: "Propeller Spin"
    }, {
        value: "Opa",
        display: "Opa"
    }, {
        value: "KRL",
        display: "KRL"
    }, {
        value: "Ragel in Ruby Host",
        display: "Ragel in Ruby Host"
    }, {
        value: "FLUX",
        display: "FLUX"
    }, {
        value: "Nu",
        display: "Nu"
    }, {
        value: "Crystal",
        display: "Crystal"
    }, {
        value: "ABAP",
        display: "ABAP"
    }, {
        value: "Parrot",
        display: "Parrot"
    }, {
        value: "Mirah",
        display: "Mirah"
    }, {
        value: "J",
        display: "J"
    }, {
        value: "Pike",
        display: "Pike"
    }, {
        value: "REALbasic",
        display: "REALbasic"
    }, {
        value: "BitBake",
        display: "BitBake"
    }, {
        value: "Ecl",
        display: "Ecl"
    }, {
        value: "Bluespec",
        display: "Bluespec"
    }, {
        value: "Hy",
        display: "Hy"
    }, {
        value: "Frege",
        display: "Frege"
    }, {
        value: "Turing",
        display: "Turing"
    }, {
        value: "LSL",
        display: "LSL"
    }, {
        value: "Hack",
        display: "Hack"
    }, {
        value: "Component Pascal",
        display: "Component Pascal"
    }, {
        value: "PogoScript",
        display: "PogoScript"
    }, {
        value: "Glyph",
        display: "Glyph"
    }, {
        value: "Fantom",
        display: "Fantom"
    }, {
        value: "Xojo",
        display: "Xojo"
    }, {
        value: "Alloy",
        display: "Alloy"
    }, {
        value: "Self",
        display: "Self"
    }, {
        value: "RobotFramework",
        display: "RobotFramework"
    }, {
        value: "Isabelle",
        display: "Isabelle"
    }, {
        value: "BlitzMax",
        display: "BlitzMax"
    }, {
        value: "Pan",
        display: "Pan"
    }, {
        value: "wisp",
        display: "wisp"
    }, {
        value: "XProc",
        display: "XProc"
    }, {
        value: "ATS",
        display: "ATS"
    }, {
        value: "Zephir",
        display: "Zephir"
    }, {
        value: "GAMS",
        display: "GAMS"
    }, {
        value: "Red",
        display: "Red"
    }, {
        value: "Ioke",
        display: "Ioke"
    }, {
        value: "eC",
        display: "eC"
    }, {
        value: "Chapel",
        display: "Chapel"
    }, {
        value: "GDScript",
        display: "GDScript"
    }, {
        value: "Fancy",
        display: "Fancy"
    }, {
        value: "Volt",
        display: "Volt"
    }, {
        value: "Clean",
        display: "Clean"
    }, {
        value: "Papyrus",
        display: "Papyrus"
    }, {
        value: "LookML",
        display: "LookML"
    }, {
        value: "Powershell",
        display: "Powershell"
    }, {
        value: "Logtalk",
        display: "Logtalk"
    }, {
        value: "Grammatical Framework",
        display: "Grammatical Framework"
    }, {
        value: "IGOR Pro",
        display: "IGOR Pro"
    }, {
        value: "EmberScript",
        display: "EmberScript"
    }, {
        value: "Oz",
        display: "Oz"
    }, {
        value: "Thrift",
        display: "Thrift"
    }, {
        value: "Rouge",
        display: "Rouge"
    }, {
        value: "JSONiq",
        display: "JSONiq"
    }, {
        value: "LoomScript",
        display: "LoomScript"
    }, {
        value: "Shen",
        display: "Shen"
    }, {
        value: "Harbour",
        display: "Harbour"
    }, {
        value: "PureBasic",
        display: "PureBasic"
    }, {
        value: "Dogescript",
        display: "Dogescript"
    }, {
        value: "APL",
        display: "APL"
    }, {
        value: "Golo",
        display: "Golo"
    }, {
        value: "Zimpl",
        display: "Zimpl"
    }, {
        value: "Cirru",
        display: "Cirru"
    }, {
        value: "Cycript",
        display: "Cycript"
    }, {
        value: "Jasmin",
        display: "Jasmin"
    }, {
        value: "TXL",
        display: "TXL"
    }, {
        value: "Ox",
        display: "Ox"
    }, {
        value: "LOLCODE",
        display: "LOLCODE"
    }, {
        value: "Cool",
        display: "Cool"
    }, {
        value: "Omgrofl",
        display: "Omgrofl"
    }, {
        value: "Grace",
        display: "Grace"
    }, {
        value: "Batchfile",
        display: "Batchfile"
    }, {
        value: "Nit",
        display: "Nit"
    }, {
        value: "E",
        display: "E"
    }, {
        value: "Opal",
        display: "Opal"
    }, {
        value: "Moocode",
        display: "Moocode"
    }, {
        value: "CMake",
        display: "CMake"
    }, {
        value: "Protocol Buffer",
        display: "Protocol Buffer"
    }, {
        value: "WebIDL",
        display: "WebIDL"
    }, {
        value: "ApacheConf",
        display: "ApacheConf"
    }, {
        value: "Brainfuck",
        display: "Brainfuck"
    }, {
        value: "PLSQL",
        display: "PLSQL"
    }
    ];
    $scope.getMatches = function (text) {
        text = text.toLowerCase();
        var ret = $scope.otherLanguages.filter(function (d) {
            return d.display.toLowerCase().startsWith(text);
        });
        return ret;
    }
    // Function to save username and email to database for future Collab Requests

    // No longer needed, with the Authorization Header in the Services
    $scope.addEmailToDB = function () {
        $http.get('users/email').then(function (response) {
            var addEmailJSON = {
                emailAddress: response.data.email.toLowerCase(),
                username: $scope.username.toLowerCase()
            }
              //console.log("Thank you your email has been saved");
            })
       
    }

}]);
