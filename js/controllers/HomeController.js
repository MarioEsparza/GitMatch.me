(function(){
  'use strict';
  angular
  .module('GitMatchApp')
  .controller('HomeController', ['$scope', '$timeout', '$http', '$sce', '$location', '$anchorScroll', 'locationService', 'matchService', 'jsonService', '$q', 'topLocationService', function ($scope, $timeout, $http, $sce, $location, $anchorScroll, locationService, matchService, jsonService, $q, topLocationService) {
      // Absolutely Global Variables
      const googleAPIkey = "AIzaSyA6GIc9OKDoXKgSP0hK4hDWP5vYcf4Z2E8";
      var matchNearbyAttempts = 0;// FindMatch gets Called Multiple Times as it has recursive properties so this must remain global, unless it is passed
      var getGitAttempts = 0;// FindMatch gets Called Multiple Times as it has recursive properties so this must remain global, unless it is passed
      var lastGetGitAttempts = -1;// FindMatch gets Called Multiple Times as it has recursive properties so this must remain global, unless it is passed
      var nearbyLocationList = []; // FindMatch gets Called Multiple Times as it has recursive properties so this must remain global, unless it is passed
      let usernameSender = ""; //Collab Request
      let usernameReceiver = ""; //Collab Request
      var displayLocationGlobal = "";
      var googleLocationToken = null;
      var promises = [];
      var gitColors = [];







      jsonService.getColors()
        .then(function (response) {
            angular.forEach(response, function (value, key) {
                //console.log("ADDED: ", value);
                gitColors.push(value);
            });
            //console.log(gitColors);
        }, function error(_error) {
            console.log("Failed to load GitColors JSON");
        });











      // $scope Variables, needed to interact with View Model
      $scope.loadingResults = false;
      $scope.emailFound = false;
      $scope.currentTop = 0;
      $scope.topFive = [];
      $scope.firstFive = [];
      $scope.matchPercent = '';
      $scope.Matchee = [];
      $scope.showResults = false;
      $scope.showLocationResults = false;
      $scope.searchRepo = ""; //autocomplete
      $scope.selectedRepo = ""; //autocomplete
      $scope.repoList = []; // Collab Request
      $scope.repoValue = {}; //Collab Request
      $scope.emailAddress = null; //Collab Request

      //Match Submit
      $scope.findMatch = function (location) {
          $scope.currentTop = 0;
          var matchNearbyLocations = [];
          var matchLocationToken = null;
          var matchLanguageToken = "";
          var userFound = false;
          var bestMatchArrayLocation = [];
          var bestMatchArrayCount = [];
          var weightedLanguages = [];
          var userData = null;
          var userRepoData = null;
          var matchesData = [];
          let gotTop = false;
          let extendedSearchRadius = "80468"; //50 miles in meters
          let matchLanguagesArray = [];
          let matchLanguagesCount = [];
          let resultLength;







          if ($scope.userForm.$valid) {
              // Remove Spaces from input
              var usernameToken = $scope.userName;

              //Match first finds the user LOCATION
              //Calls gitAPI and passes usernameToken formatted for the call
              var getData = matchService.getLocation(usernameToken);
              getData.then(function (response) {
                  $scope.returnMatchData = userData = response;

                  console.log($scope.returnMatchData.login, "'s Location: ", $scope.returnMatchData.location);
                  if (location != "formSubmit") {
                      $scope.returnMatchData.location = location;
                  }
                  //Checks to see if location is not empty
                  if ($scope.returnMatchData.location) {
                      //NEW- Mario
                      $('#loading-modal').modal('toggle');
                      $(".match-input").removeClass('alert-danger');
                      //If true, then it assigns it to a variable that will be passed to GitHub API
                      matchLocationToken = $scope.returnMatchData.location.replace(/\s+/g, '-').toLowerCase();
                      googleLocationToken = $scope.returnMatchData.location.replace(/\s+/g, '+').toLowerCase();

                      //Dynamically the background for the match sectio based on user location
                      $scope.googleBG(googleLocationToken, 'match');

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
                                  };
                                  $scope.repoList.push($scope.repoValue);
                                  //Then checks to se if it's not already in array
                                  var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                  if (matchItemIndex < 0) {
                                      //console.log("ADDED: ", value.language);
                                      matchLanguagesArray.push(value.language);
                                      matchLanguagesCount.push(1);

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

                              console.log("GitHub # of Users returned from API Call", $scope.returnData.total_count);

                              console.table($scope.returnData.items);
                              matchesData = $scope.returnData.items;

                              if ($scope.returnData.total_count === 0) {
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
                                  $scope.displayResults(matchLanguagesArray, matchLanguagesCount, userData, userRepoData, matchesData,weightedLanguages,gotTop);
                              }
                          });
                      }, function error(error) {
                          //console.log("ERROR: NO REPOS FOUND")
                          $('#error-modal').modal('toggle');
                          $scope.errorMessage = '<div class=""> <h2><strong> <span class="glyphicon glyphicon-exclamation-sign alert-danger"></span>  No Valid Parsable (Repos) Data Detected</strong></h2> Please try again with a different username.</div>';
                          $timeout(function () {
                              $('#error-modal').modal('toggle');
                          }, 3000);
                      });

                  }
                  else {
                      //Error State: display input field
                      //Ask the user to input a location
                      //NEW - Mario
                      //console.log("ERROR: A USER LOCATION WAS NOT FOUND")
                      $('#error-modal').modal('toggle');
                      $scope.errorMessage = '<div class=""> <h2><strong> <span class="glyphicon glyphicon-exclamation-sign alert-danger"></span>  No Valid User Location Detected</strong></h2> Please try again with a different username or use our location search.</div>';
                      $timeout(function () {
                          $('#error-modal').modal('toggle');
                      }, 3000);
                  }
                  //console.table($scope.returnData.items);
              }, function error(error) {
                  //NEW - Mario
                  //console.log("ERROR: USERNOT FOUND")
                  $(".match-input").addClass('alert-danger');
                  $('#error-modal').modal('toggle');
                  $scope.errorMessage = '<div class=""> <h2><strong> <span class="glyphicon glyphicon-exclamation-sign alert-danger"></span> Username Not Found</strong></h2> Please try again.</div>';
                  $timeout(function () {
                      $('#error-modal').modal('toggle');
                  }, 3000);

              });

          }//End Valid Submit
      };
      function matchNearbyResults(results, status) {
        let matchNearbyLocations = [];
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              console.log("Nearby Search SUCCESS: ", results.length);
              for (var i = 0; i < results.length; i++) {
                  matchNearbyLocations[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
              }
              console.log("Nearby Places: ", matchNearbyLocations);

          }
          else {
              console.log("Nearby Search FAIL");
          }

          // Called within call back
          if (matchNearbyAttempts < matchNearbyLocations.length) {

              $scope.findMatch(matchNearbyLocations[matchNearbyAttempts]);
          } else {
              //Tell user there are no Nearby Developers in your area.
              console.log("No Nearby Users Alert Them HERE!");
          }
      }
      function nearbySearchResults(results, status) {
          $scope.usersReturned = [];
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              //console.log("Nearby Search SUCCESS: ", results.length);
              for (var i = 0; i < results.length; i++) {
                  nearbyLocationList[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
              }
              console.log("Nearby Places: ", nearbyLocationList);

          }
          else {
              //console.log("Nearby Search FAIL");
          }

          // Called within call back

          $scope.gitAPI($scope.location.replace(/\s+/g, '-').toLowerCase());
      }

      $scope.gitAPI = function (locationT) {
        let extendedSearchRadius = "80468"; //50 miles in meters
        let resultLength;
        let matchesData;

          /*GitHub APi*/
          var topLanguagesList = [];


          let languageToken = "";
          var locationToken = locationT;
          languageToken = $scope.createLanguageToken();
          console.log("Created User Token: ", languageToken);
          //Passes location to Factory. Determines whether return data is good.
          var getData = locationService.getUsers(locationToken, languageToken);
          getData.then(function (response) {
              // console.log(response);
              $scope.returnData = response;
              matchesData = null;

              // Creates appended list of users returned
              if (getGitAttempts === 0) {

                  $scope.usersReturned = response.items;
                  console.log("First set of users returned", $scope.usersReturned);
                  $scope.showLocationResults = true;  //On Success, show result section
              } else {
                  $scope.usersReturned.push.apply($scope.usersReturned, response.items);
                  console.log("Next set of users returned ", $scope.usersReturned);
              }
              resultLength = $scope.returnData.total_count;

              if (resultLength >= 5) {
                  matchesData = response;
              }

              console.log("GitHub # of Users returned from API Call", $scope.returnData.total_count);
              console.log("GitHub # of Total Users: ", $scope.usersReturned.length);
              console.table($scope.usersReturned);
              if (resultLength < 5) {                //If GitHub API results are less than 10, then search nearby location
                  if (getGitAttempts < nearbyLocationList.length) {
                      //Increment getGitAttempts each call from nearbyLocationList, attempts the next location given the names aren't too similar
                      console.log(locationT != nearbyLocationList[getGitAttempts].replace(/\s+/g, '-').toLowerCase());

                      // Could think about using fuzzyset.js
                      //http://glench.github.io/fuzzyset.js/

                      // Compares locationT , which was passed to  $scope.gitAPI and already formatted in a token format, and the formatted nearbyLocationList item
                      if (locationT == nearbyLocationList[getGitAttempts].replace(/\s+/g, '-').toLowerCase()) {
                          getGitAttempts++;
                          //console.log("Skipped, too similar of location");
                      }
                      //Starts search for next location in list
                      //console.log("Starting next location")
                      $scope.gitAPI(nearbyLocationList[getGitAttempts++]);


                  } else if (getGitAttempts == nearbyLocationList.length) {
                      // Broaden Search Locations and remove previously searched locations
                      console.log("Last", lastGetGitAttempts);
                      console.log("Previous", getGitAttempts);

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
                  console.log($scope.usersReturned);
                  getLanguages(matchesData);
                  console.log('getting languages');


              }
          }, function (fail) {
              console.log(fail);
          });
      };


      function getLanguages(matchesData) {
        let topUserUsersStoredLanguages = [];
        let topUserUsersArray = [];
        var language = [];
        var numberOfLanguagestoDisplay = 6;
        var pieDatasets = [];
        var pieBackgroundColors = [];
        let topLanguagesList = [];
        let myLocationChart = null;
        let myChartLocationMatch = null;
        let matchLanguagesArray = [];
        let matchLanguagesCount = [];



          // Helper Function to get Top Languages
          function findLocationRepos(username) {
              var repoPromises = [];
              repoPromises.push(matchService.getRepos(username.login, null).then(function (response) {
                  $scope.currentMatchRepo = response;
                  angular.forEach($scope.currentMatchRepo, function (value, key) {

                      console.log("start the promise");

                      //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                      if ($scope.currentMatchRepo.length) {
                          //Then checks to se if it's not already in array
                          var matchItemIndex = matchLanguagesArray.indexOf(value.language);

                          if (matchItemIndex < 0) {

                              matchLanguagesArray.push(value.language);
                              matchLanguagesCount.push(1);

                          } else {
                              matchLanguagesCount[matchItemIndex]++;
                          }


                      }




                  });


              }, function (error) {
                  console.log(error);
              }));
              return $q.all(repoPromises);

          }





          document.getElementById("myChartLocation").onclick = function (evt) {
              console.log("Bar Clicked: ", myLocationChart.getElementsAtEvent(evt)[0]._model.label);


              $scope.chartSelectedLanguage = myLocationChart.getElementsAtEvent(evt)[0]._model.label;
              $scope.loadingResults = true;

              //Then checks to se if it's not already in array
              var indexFound = topUserUsersStoredLanguages.indexOf(myLocationChart.getElementsAtEvent(evt)[0]._model.label);

              if (indexFound < 0) {
                  $scope.gitTopAPI(nearbyLocationList[0].replace(/[_-]/g, "+").toLowerCase(), myLocationChart.getElementsAtEvent(evt)[0]._model.label,topUserUsersStoredLanguages);

              } else {
                  $scope.$apply(function () {
                      $scope.topUserForSelectedLanguage = topUserUsersArray[indexFound].users[0];
                      $scope.loadingResults = false;
                  });


              }


              //alert(myLocationChart.getElementsAtEvent(evt));
              // use _datasetIndex and _index from each element of the activePoints array

          };
          angular.forEach($scope.returnLocationUsersData, function (username, index) {

              promises.push(findLocationRepos(username));
          });
          $q.all(promises).then(function () {



              for (var i = 0; i < matchLanguagesCount.length; i++) {
                  if (matchLanguagesArray[i] !== null) {

                      topLanguagesList.push({ language: matchLanguagesArray[i], count: matchLanguagesCount[i] });
                  }
              }

              var swapped;
              do {
                  swapped = false;
                  for (var z = 0; z < topLanguagesList.length - 1; z++) {
                      if (parseInt(topLanguagesList[z].count) < parseInt(topLanguagesList[z + 1].count)) {
                          var temp = { language: topLanguagesList[z].language, count: topLanguagesList[z].count };
                          topLanguagesList[z] = topLanguagesList[z + 1];
                          topLanguagesList[z + 1] = temp;
                          swapped = true;

                      }
                  }

              } while (swapped);
              for ( i = 0; i < topLanguagesList.length; i++) {
                  console.log("Language", topLanguagesList[i].language, "Count:", topLanguagesList[i].count);
              }
              // Location Chart
              //Fixed Bug where old pie data showed on hover
              if (myLocationChart !== null) {
                  myLocationChart.destroy();
              }



              for (i = 0; i < numberOfLanguagestoDisplay; i++) {
                  //console.log("Top Language", topLanguagesList[i].language, "Top Count", topLanguagesList[i].count);
                  language.push(topLanguagesList[i].language);
                  pieBackgroundColors.push(getColor(topLanguagesList[i].language));
                  pieDatasets.push(numberOfLanguagestoDisplay - (numberOfLanguagestoDisplay - topLanguagesList[i].count));
              }
              for (var l = 0; l < 6; l++) {
                  if (topLanguagesList[l].language) {
                      $scope.chartSelectedLanguage = topLanguagesList[0].language;
                      $scope.gitTopAPI(nearbyLocationList[0].replace(/[_-]/g, "+").toLowerCase(), topLanguagesList[l].language,topUserUsersStoredLanguages, topUserUsersArray);
                  }
              }
              // This should be renamed and hoisted
              function renameFunction (newData) {
                  matchesData.items[newData.index].email = newData.email;

                  matchesData.items[newData.index].public_repos = newData.public_repos;

                  matchesData.items[newData.index].location = newData.location;

                  matchesData.items[newData.index].followers = newData.followers;
              }
              for (var cm = 0; cm < 10; cm++) {
                  var myData = matchService.getUser(matchesData.items[cm].login, cm);
                  promises.push(myData.then(renameFunction));
              }
              function topUsersFunction(data) {
                  topUserUsersArray[data.index].users[0].followers = data.followers;
                  topUserUsersArray[data.index].users[0].html_url = data.html_url;
                  console.log(topUserUsersArray[data.index].users[0]);
              }
              $timeout(function () {
                  for (var tl = 0; tl < 6; tl++) {
                      console.log(topLanguagesList[tl]);
                      var indexFound = topUserUsersStoredLanguages.indexOf(topLanguagesList[tl].language);
                      console.log(indexFound);
                      console.log(topUserUsersStoredLanguages);
                      console.log(topLanguagesList);
                      console.log(topUserUsersArray);
                      var damnVariables = matchService.getUser(topUserUsersArray[indexFound].users[0].login, indexFound);
                      promises.push(damnVariables.then(topUsersFunction));
                  }
              }, 1000);

              $timeout(function () {
                  $q.all(promises).then(function () {


                      $scope.displayResultsLocation(matchesData);
                      $scope.displayLocation = displayLocationGlobal;

                      $scope.googleBG(googleLocationToken, 'location');
                      $('#loading-modal').modal('toggle');
                      $('html, body').animate({
                          scrollTop: $("#location-section").offset().top
                      }, 1000);
                      var indexFound = topUserUsersStoredLanguages.indexOf(topLanguagesList[0].language);

                      console.log("Applying Now");
                      $scope.topUserForSelectedLanguage = topUserUsersArray[indexFound].users[0];
                      $scope.loadingResults = false;

                  });





              }, 1000);


              function getColor(language) {
                  for (var z = 0; z < gitColors.length; z++) {
                      if (gitColors[z].name == language) {
                          //console.log("Color Found in JSON:", gitColors[z].color);
                          return gitColors[z].color;
                      }
                  }
              }

              var ctx = document.getElementById('myChartLocation').getContext('2d');

              myLocationChart = new Chart(ctx, {
                  type: 'horizontalBar',
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
                          xAxes: [{
                              display: false
                          }],
                          yAxes: [{
                              gridLines: {
                                  color: "rgba(0, 0, 0, 0)",
                              }
                          }]

                      },
                      legend: {
                          display: false
                      },
                      tooltips: {
                          enabled: false
                      }

                  }
              });

          });




      }
      // Works now!
      $scope.gitTopAPI = function (locationT, languageToken,topUserUsersStoredLanguages,topUserUsersArray) {
          let resultLength;
          // Remove Spaces from input
          var locationToken = locationT;
          console.log("LocationToken: ", locationToken);
          console.log("LanguageToken: ", languageToken);


          //languageToken = languageToken.replace(/\s+/g, '+').toLowerCase();

          //Passes location to Factory. Determines whether return data is good.
          // Requires different token format
          // replace : with =
          // EG https://crossorigin.me/http://git-awards.com/api/v0/users?city=los+angeles&language=shell

          var getData = topLocationService.getUsers(locationToken, languageToken);
          promises.push(getData.then(function (response) {
              //console.log(response);
              $scope.returnData = response;
              resultLength = $scope.returnData.total_count;
              //console.log("GitHub # of Users: ", $scope.returnData.total_count);
              //console.log("These are the Top users");
              //console.table($scope.returnData.users);
              //Picks the first top user and hooks it up to scope variable for display
              //console.log($scope.returnData.users[0].login)
              //console.log("Display Scope 1: ", $scope.topUserForSelectedLanguage);
              topUserUsersArray.push($scope.returnData);
              topUserUsersStoredLanguages.push(languageToken);
              //Hide Loader div
              $scope.loadingResults = false;


          }));
      };
      //Display Location Results
      $scope.displayResultsLocation = function (matchesData) {
          // $scope.displayLocationMatches
          let myChart = null;
          let myChartMatch =  null;
          let myChartLocation = null;

          //console.log("Matches Data to display: ", matchesData);
          console.log("Selected Lang to display: ", $scope.languagesSelected);
          displayMatches(0);


          $scope.nextDisplayLoca = function (index) {

              ++index;
              ++$scope.currentTop;
              //console.log(index);
              displayMatches(index);
          };
          $scope.previousDisplayLoca = function (index) {

              --index;
              --$scope.currentTop;
              //console.log(index);
              displayMatches(index);
          };
          function displayMatches(index) {
              let matchLanguagesArray = [];
              let matchLanguagesCount = [];

              for (var x = 0; x < 10; x++) {
                  console.log("LOCATION TOP FIVE", matchesData.items[x]);
                  $scope.firstFive.push(matchesData.items[x]);
              }
              $scope.currentMatch = matchesData.items[index];

              //Displays the bestMatch's repos.
              var getData = matchService.getRepos(matchesData.items[index].login);
              getData.then(function (response) {
                  //Stores the language for every repo found
                  $scope.currentMatchRepo = response;

                  angular.forEach($scope.currentMatchRepo, function (value, key) {

                      //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                      if ($scope.currentMatchRepo.length) {
                          for (var i = 0; i < $scope.languagesSelected.length; i++) {
                              if (value.language == $scope.languagesSelected[i]) {
                                  //Then checks to se if it's not already in array
                                  var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                  if (matchItemIndex < 0) {

                                      matchLanguagesArray.push(value.language);
                                      matchLanguagesCount.push(1);

                                  } else {
                                      matchLanguagesCount[matchItemIndex]++;
                                  }
                              }
                          }
                      }

                  });

                  if (myChartLocationMatch !== null) {
                    console.log(myChartLocationMatch);

                  }

                  var totalItems = matchLanguagesArray.length;
                  var pieDatasets = [];
                  var pieBackgroundColors = [];


                  for (var i = 0; i < matchLanguagesArray.length; i++) {
                      pieBackgroundColors.push(getColor(matchLanguagesArray[i]));
                      pieDatasets.push(totalItems - (totalItems - matchLanguagesCount[i]));
                  }


                  function getColor(language) {
                      for (var z = 0; z < gitColors.length; z++) {
                          if (gitColors[z].name == language) {
                              //console.log("Color Found in JSON:", gitColors[z].color);
                              return gitColors[z].color;
                          }
                      }
                  }

                  console.log("Radar Data: ", totalItems, pieDatasets, pieBackgroundColors);
                  var ctx = document.getElementById('myChartLocationMatch').getContext('2d');

                  myChartMatch = new Chart(ctx, {
                      type: 'pie',
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
                  console.log("ERROR: NO REPOS FOUND");

              });
          }
      };

      $scope.displayResults = function (language, languageCount, userData, userRepoData, matchesData,weightedLanguages,gotTop) {
          let myChartMatch = null;
          let myChart = null;
          let myLocationChart = null;
          let myChartLocationMatch = null;
          var matchLanguagesArray = [];
          var matchLanguagesCount = [];
          var bestMatchArrayLocation = [];
          var bestMatchArrayCount = [];

          var matchScore = [];
          var matchesPercents = [];

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
          findBestMatch(weightedLanguages,gotTop);

          function findBestMatch(weightedLanguages,gotTop) {

              var bestMatchNumber = 0;
              var matchingLanguagesCounter = 0;
              // Wait for fetchEachRepo to complete
              fetchEachRepo().then(function () {
                  displayMatches($scope.currentTop);
              });


              function fetchEachRepoSuccess (response) {
                  matchingLanguagesCounter = 0;
                  //Stores the language for every repo found
                  $scope.currentMatchRepo = response;
                  promises.push(forEachRepo($scope.currentMatchRepo, response.newIndex));
                  //console.log("match array2:  ", bestMatchArrayLocation);
              }
              function fetchEachRepoError(error) {
                 console.log("ERROR: NO REPOS FOUND");

             }
              function fetchEachRepo() {
                  var promises = [];
                  var defered;
                  var angularDeferred;
                  var foreachRepoCallback;
                  usernameSender = $scope.userName;
                  for (var j = 0; j < matchesData.length; j++) {
                      //console.log(matchesData[j]);
                      //console.log("J: ", j);
                      //console.log("matchesData[j].login", matchesData[j].login);
                      //console.log("$scope.returnMatchData.login", $scope.userName);
                      if (matchesData[j].login.toLowerCase() != $scope.userName.toLowerCase()) {


                          defered = $q.defer();
                          var getData = matchService.getRepos(matchesData[j].login, j);
                          promises.push(getData.then(fetchEachRepoSuccess,fetchEachRepoError));
                      }
                      //console.log("Matching Languages Counter",matchingLanguagesCounter);
                      //console.log("Best Match Number",bestMatchNumber);
                      //if (matchingLanguagesCounter > bestMatchNumber) {
                      //    bestMatchNumber = matchingLanguagesCounter;
                      //    console.log("New Best Match: ", j, bestMatchNumber);
                      //    if (bestMatchArrayLocation.length == 0) {
                      //        bestMatchArrayLocation.push(j);
                      //    } else {
                      //        bestMatchArrayLocation.unshift(j);
                      //    }
                      //    console.log("Best Match Array: ", bestMatchArrayLocation);
                      //}

                  }
                  console.log("Fetching Repo Done");
                  return $q.all(promises);
              }

              function forEachRepo(currentMatchRepo, index) {
                  let languageMultiplier = 1;
                  var newPromises = [];
                  var newAngularDeferred = $q.defer();
                  var GitMatchFactor = 14.843474908426657;
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
                                  languageMultiplier = weightedLanguages.indexOf(value.language);
                                  if (languageMultiplier == -1) {
                                      languageMultiplier = 1;
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
                                      matchingLanguagesCounter = matchingLanguagesCounter + (1 * languageMultiplier);
                                  }
                              }
                          }
                      }


                  });
                  bestMatchArrayLocation.push(index);
                  bestMatchArrayCount.push(Math.log(matchingLanguagesCounter) * GitMatchFactor);
                  //console.log("Index: ", index, "matchingLanguagesCounter", matchingLanguagesCounter, "matchingLanguages arry", matchLanguagesArray);
                  newAngularDeferred.resolve();
                  //console.log("Counter Out: ", matchingLanguagesCounter);



                  //             $scope.emailAddress = response.email;
                  //console.log("Found Matches Email:", $scope.emailAddress); console.log("Best Match Array: ", bestMatchArrayLocation);
                  //if (matchingLanguagesCounter > bestMatchNumber) {
                  //    bestMatchNumber = matchingLanguagesCounter;
                  //    console.log("New Best Match: ", index, bestMatchNumber);

                  //    bestMatchArrayLocation.push(index);
                  //    bestMatchArrayCount.push(matchingLanguagesCounter);

                  //    console.log("Best Match Array: ", bestMatchArrayLocation);
                  //}
                  return $q.all(newPromises);
              }

          }
          $scope.nextDisplay = function (index) {

              ++index;
              ++$scope.currentTop;
              //console.log(index);
              displayMatches(index);
          };
          $scope.previousDisplay = function (index) {

              --index;
              --$scope.currentTop;
              //console.log(index);
              displayMatches(index);
          };
          function displayMatches(index) {

              let bestMatchNum;
              matchLanguagesArray = [];
              matchLanguagesCount = [];
              //console.log(bestMatch_Language);
              bestMatchNum = bestMatchArrayLocation;
              //console.log("match array: ", bestMatchArrayLocation);
              //console.log("match array count: ", bestMatchArrayCount);
              var load = [];
              if (index === 0 && !gotTop) {

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
                      if (maxIndex === 0 && maxCount === 0) {
                          console.log("No more Matches found");
                      } else {
                          matchScore.push(maxCount);
                          //console.log(maxCount);
                          // console.log(maxIndex);
                          matchesPercents.push(maxCount);

                          $scope.topFive.push(bestMatchArrayLocation[bestMatchArrayLocation.indexOf(maxIndex)]);
                          bestMatchArrayCount.splice(bestMatchArrayLocation.indexOf(maxIndex), 1);
                          bestMatchArrayLocation.splice(bestMatchArrayLocation.indexOf(maxIndex), 1);
                      }
                  }
              }

              // GET TOP STARS FOR MATCHES
              var getMatchDataSearcher = topLocationService.getUserRepos($scope.userName);
              load.push(getMatchDataSearcher.then(function (data) {
                  var starCounter = 0;
                  for (var i = 0; i < data.user.rankings.length; i++) {
                      starCounter = starCounter + data.user.rankings[i].stars_count;
                  }
                  console.log("Username: ", data.user.login, " Star Count: ", starCounter);
                  $scope.Searcher = { username: data.user.login, stars: starCounter };
              }, function (error) {
                  // ERROR GOES HERE
              }));
              function getMatchDataMatcheeSuccess(data) {
                  var starCounter = 0;
                  for (var i = 0; i < data.user.rankings.length; i++) {
                      starCounter = starCounter + data.user.rankings[i].stars_count;
                  }
                  console.log("Username: ", data.user.login, " Star Count: ", starCounter);
                  $scope.Matchee.push({ username: data.user.login, stars: starCounter });
              }
              function getMatchDataMatcheeError(error) {
              }
              for (var b = 0; b < $scope.topFive.length; b++) {
                  var getMatchDataMatchee = topLocationService.getUserRepos(matchesData[$scope.topFive[b]].login);
                  load.push(getMatchDataMatchee.then(getMatchDataMatcheeSuccess,getMatchDataMatcheeError ));
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
                  //NEW - Mario
                  if (response.email) {
                      //console.log("EMAIL FOUND!");
                      $scope.emailAddress = response.email;
                      $scope.emailFound = true;
                  } else {
                      //console.log("EMAIL NOT FOUND!");
                      $scope.emailFound = false;
                  }

              });

              //Displays the bestMatch's repos.
              getData = matchService.getRepos(matchesData[$scope.topFive[index]].login);
              getData.then(function (response) {
                  //Stores the language for every repo found
                  $scope.currentMatchRepo = response;

                  angular.forEach($scope.currentMatchRepo, function (value, key) {

                      //Checks to see if the language match with the searcher's array of languages (user looking for matches)
                      if ($scope.currentMatchRepo.length) {
                          for (var i = 0; i < language.length; i++) {
                              if (value.language == language[i]) {
                                  //Then checks to se if it's not already in array
                                  var matchItemIndex = matchLanguagesArray.indexOf(value.language);
                                  if (matchItemIndex < 0) {

                                      matchLanguagesArray.push(value.language);
                                      matchLanguagesCount.push(1);

                                  } else {
                                      matchLanguagesCount[matchItemIndex]++;
                                  }
                              }
                          }
                      }

                  });

                  if (myChartMatch !== null) {
                      myChartMatch.destroy();
                  }

                  var totalItems = matchLanguagesArray.length;
                  var pieDatasets = [];
                  var pieBackgroundColors = [];

                  for (var i = 0; i < matchLanguagesArray.length; i++) {
                      pieBackgroundColors.push(getColor(matchLanguagesArray[i]));
                      pieDatasets.push(totalItems - (totalItems - matchLanguagesCount[i]));
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
                  console.log("ERROR: NO REPOS FOUND");

              });
              //Output Results
              if (index === 0 && !gotTop) {
                  gotTop = true;
                  $timeout(function () {
                      $scope.repoList.push({ value: "none", display: "No specific repo" });
                      $('#loading-modal').modal('toggle');
                      $('html, body').animate({
                          scrollTop: $("#match-section").offset().top
                      }, 1000);
                  }, 2000);
              }
          }


          $scope.userData = userData;



          // Pie Chart
          //Fixed Bug where old pie data showed on hover
          if (myChart !== null) {
              myChart.destroy();
          }

          var totalItems = language.length;
          var pieDatasets = [];
          var pieBackgroundColors = [];

          for (var i = 0; i < language.length; i++) {
              pieBackgroundColors.push(getColor(language[i]));
              pieDatasets.push(totalItems - (totalItems - languageCount[i]));
          }


          function getColor(language) {
              for (var z = 0; z < gitColors.length; z++) {
                  if (gitColors[z].name == language) {
                      //console.log("Color Found in JSON:", gitColors[z].color);
                      return gitColors[z].color;
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
      // Send Email Function
      $scope.sendEmail = function () {
          if ($scope.userName.toLowerCase() == "bareinhard") {
            var emaliJSON = {};
              if ($scope.selectedRepo.value != "none") {
                   emailJSON = {
                      emailAddress: "brettreinhard@gmail.com",
                      repo: 'https://github.com/' + $scope.selectedRepo.value,
                      usernameSender: usernameSender,
                      usernameReceiver: usernameReceiver
                  };
              } else {
                  emailJSON = {
                      emailAddress: "brettreinhard@gmail.com",
                      repo: $scope.selectedRepo.value,
                      usernameSender: usernameSender,
                      usernameReceiver: $scope.emailAddress
                  };
              }
              $http.post('https://prod-18.southcentralus.logic.azure.com:443/workflows/c0ecbbfc0eba409281d256ff34c7a6c0/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bzv-FvzJhnMFl8ocz3TrJi4mOZs4MciyMix4W2D3058', emailJSON).then(function (data) {
                  //console.log(data);
              }, function (error) {
                  //console.log(error);
              });
          }

          //NEW - Mario
          $('#request-modal').modal('toggle');
          $('html,body').animate({
              scrollTop: $("#match-section").offset().top
          }, 2000);
          //window.location.replace("https://github.com/login/oauth/authorize?client_id=f9d85111ad2fea5dd1a9&redirect_uri=http://beta-gitnear.azurewebsites.net/#!/emailsent");
          //Email Sent Success Goes Here
      };



      $scope.getRepos = function (text) {

          text = text.toLowerCase();
          var ret = $scope.repoList.filter(function (d) {
              return d.display.toLowerCase().startsWith(text);
          });
          return ret;
      };

      // Disable Menu from closing after selecting a auto complete field
      $('.md-virtual-repeat-offsetter').bind('click', function (e) {
          e.stopPropagation();
          $('.md-virtual-repeat-offsetter').css({ marginTop: '=28px' });
      });
      // Stops click event from bubbling up to built in dropdown-menu click event function
      $('.dropdown-menu').bind('click', function (e) {
          e.stopPropagation();
      });







      // Insert HTML
      $scope.renderHtml = function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
      };
      $('#searchbar').affix({
          offset: {
              top: $(window).height() * 0.50
          }
      });

      // Create Token for GitHub Api Call
      $scope.createLanguageToken = function () {
          var languageT = "";
          for (var i = 0; i < $scope.languagesSelected.length; i++) {
              languageT += "+language:" + $scope.languagesSelected[i];
          }
          if ($scope.selectedItem !== null) {
              languageT += "+language:" + $scope.selectedItem.display;
          }
          return languageT;
      };


















      // Google Geocode & Nearby Function
      $scope.googleGeoCode = function (locationToken) {
          //Google Maps Geocode
          $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + locationToken + '&key=' + googleAPIkey)
            .then(function (result) {
                //console.log("GeoCode Address: ", result.data.results[0].formatted_address);
                ////console.log("GeoCode LAT: ", result.data.results[0].geometry.location.lat, "\n LNG: ", result.data.results[0].geometry.location.lng);
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
             });// End of Map Geocode Error CallBack



      };





      //Background Image Function
      $scope.googleBG = function (location, section) {
          var googleMapStyle1 = "&style=element:labels|visibility:off|color:0xf49f53&style=feature:water|element:geometry|color:0x42a9ee|lightness:17&style=feature:landscape|element:geometry|color:0xf5f5f5|lightness:20&style=feature:road.highway|element:geometry.fill|color:0xffffff|lightness:17&style=feature:road.highway|element:geometry.stroke|color:0xffffff|lightness:29|weight:0.2&style=feature:road.arterial|element:geometry|color:0xffffff|lightness:18&style=feature:road.local|element:geometry|color:0xffffff|lightness:16&style=feature:poi|element:geometry|color:0xf5f5f5|lightness:21&style=feature:poi.park|element:geometry|color:0xdedede|lightness:21&style=element:labels.text.stroke|visibility:off|color:0xffffff|lightness:16&style=element:labels.text.fill|saturation:36|color:0x333333|lightness:40&style=element:labels.icon|visibility:off&style=feature:transit|element:geometry|color:0xf2f2f2|lightness:19&style=feature:administrative|element:geometry.fill|color:0xfefefe|lightness:20&style=feature:administrative|element:geometry.stroke|color:0xfefefe|lightness:17|weight:1.2";
          //Determines the zoom for the background image of the match section
          var mapZoom = $scope.getLocationType(location);
          //console.log("Google Static Map Function. Token: ", location, "Section: ", section);
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

          $('#' + section + '-section').css({ 'background-image': '  linear-gradient( 0deg, rgba(255,255,255, 0.9),  rgba(174,223,242, 0.3)), url(' + googleStaticMapUrl + ')' });
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
                 console.log("Get Location Type Fail");
             });// End of Map Geocode Error CallBack

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
      };

      // Function to save username and email to database for future Collab Requests
      // No longer needed, with the Authorization Header in the Services
      $scope.addEmailToDB = function () {
          $http.get('users/email').then(function (response) {
              var addEmailJSON = {
                  emailAddress: response.data.email.toLowerCase(),
                  username: $scope.username.toLowerCase()
              };

          });

      };

  }]);
})();
