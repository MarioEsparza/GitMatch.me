app.controller('HomeController', ['$scope', '$timeout', '$http', '$sce', '$location', 'locationService', function ($scope, $timeout, $http, $sce, $location, locationService) {
    //Variables
    var APIkey = "AIzaSyDAihxgpGZnCxv9w99fyjThJsZDYKEOVp8"
    var resultLength = null;
    var latitude, longitude = null;
    var searchRadius = "40234"; // 25 miles in meters
    var extendedSearchRadius = "80468"; //50 miles in meters
    var nearbyLocationList = [];
    var languangeToken = "";
    $scope.getGitAttempts = 0;
    $scope.selected = "";
    
    // Locations to be used as Check Boxes
    $scope.languages = ["Javascript", "Python", "C#"];
   
    // Match Algorithm Details

    // ------ Search Based on Location and Language
    // ------ Return First User
    // ------ Show Details of User, list projects
   
    
    // Selected languages
    $scope.languagesSelected = [];

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
        console.log($scope.languagesSelected);
    };

    
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
                    console.log("Nearby Search SUCCESS: ", results.length);
                    for (var i = 0; i < results.length; i++) {
                        nearbyLocationList[i] = results[i].name.replace(/\s+/g, '-').toLowerCase();
                    }
                    console.log("Nearby Places: ", nearbyLocationList);
  
                }
                else {
                    console.log("Nearby Search FAIL");
                }

                // Called within call back

                $scope.gitAPI($scope.location.replace(/\s+/g, '-').toLowerCase());
            }
            //Calls gitAPI and passes locationToken formatted for the call

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
    // Create Token for GitHub Api Call
    $scope.createLanguageToken = function () {
        var languageT="";
        for (var i = 0; i < $scope.languagesSelected.length; i++) {
            languageT += "+language:" + $scope.languagesSelected[i];
        }
        if ($scope.selectedItem != null) {
            languageT += "+language:" + $scope.selectedItem.display;
        }
        return languageT;
    }
    $scope.gitAPI = function (locationT) {
        
        /*GitHub APi*/
        languangeToken = "";
        var locationToken = locationT;       
        languangeToken = $scope.createLanguageToken();
        //Passes location to Factory. Determines whether return data is good.
        var getData = locationService.getUsers(locationToken, languangeToken);
        getData.then(function (response) {
            console.log(response);
            $scope.returnData = response;
            // Creates appended list of users returned
            if ($scope.getGitAttempts == 0) {
                $scope.usersReturned = response.items
                console.log("First set of users returned", $scope.usersReturned)
            } else {
                $scope.usersReturned.push.apply($scope.usersReturned, response.items);
                console.log("Next set of users returned ",$scope.usersReturned)
            }
            resultLength = $scope.returnData.total_count;

            console.log("GitHub # of Users returned from API Call",$scope.returnData.total_count);
            console.log("GitHub # of Total Users: ", $scope.usersReturned.length);
            console.table($scope.usersReturned);
            if (resultLength < 10) {                //If GitHub API results are less than 5, then search nearby location
                if ($scope.getGitAttempts < nearbyLocationList.length) {
                    //Increment $scope.getGitAttempts each call from nearbyLocationList, attempts the next location given the names aren't too similar
                    console.log(locationT != nearbyLocationList[$scope.getGitAttempts].replace(/\s+/g, '-').toLowerCase())
                    
                    // Could think about using fuzzyset.js
                    //http://glench.github.io/fuzzyset.js/

                    // Compares locationT , which was passed to  $scope.gitAPI and already formatted in a token format, and the formatted nearbyLocationList item
                    if (locationT == nearbyLocationList[$scope.getGitAttempts].replace(/\s+/g, '-').toLowerCase()) {
                        $scope.getGitAttempts++;
                        console.log("Skipped, too similar of location");
                    }
                    //Starts search for next location in list
                    console.log("Starting next location")
                    $scope.gitAPI(nearbyLocationList[$scope.getGitAttempts++]);
                    

                } else if ($scope.getGitAttempts == nearbyLocationList.length) {
                    // Broaden Search Locations and remove previously searched locations

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

            }
        })
    };

    // Extended Call Back executed when Extended Nearby Search returns its promise
    function extendedNearbySearchResults(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Nearby Search SUCCESS: ", results.length);
            console.log(results);
            var currentResult = results[0].name;
            for (var i = 0; i < results.length; i++) {
                currentResult = results[i].name.replace(/\s+/g,'-').toLowerCase();
                if (nearbyLocationList.indexOf(currentResult) == -1) {
                    nearbyLocationList[nearbyLocationList.length] = currentResult;
                } else {
                    console.log("Location already in list", currentResult);
                }
                
            }
            console.log("Nearby Places: ", nearbyLocationList);

        }
        else {
            console.log("Nearby Search FAIL");
        }

        // Called within call back
        if (nearbyLocationList.length > $scope.getGitAttempts) {
            $scope.gitAPI(nearbyLocationList[$scope.getGitAttempts++]);
        }
        else {
            console.log("No new search locations were found, adding another extend may not yield much and whether or not to do so will come down to how much we value the GitHub API calls")
        }
    }
    

    // Proof of Concept for Git-Awards CORS-ByPass for Top-Location
    //console.log("Dont mind this, the site still works, but I need to test on mobile")
    //$http.get("https://crossorigin.me/http://git-awards.com/api/v0/users?city=los+angeles&language=shell").then(function (data) {
    //    console.log(data);
    //    Use this one if you wanna see a familiar face :P
    //    console.log(data.data[13]);
    //}, function (error) {
        
    //})
    

    // No works!
    $scope.gitTopAPI = function (locationT) {
       
        // Remove Spaces from input
        var locationToken = locationT;

        //Passes location to Factory. Determines whether return data is good.
        // Requires different token format
        // replace : with =
        // EG https://crossorigin.me/http://git-awards.com/api/v0/users?city=los+angeles&language=shell
        var getData = topLocationService.getUsers(locationToken, languangeToken);
        getData.then(function (response) {
            console.log(response);
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

    // Function to Call gitTopApi when button pressed 
    $scope.getTop = function () {
        $scope.gitTopAPI($scope.location.replace(/\s+/g, '-').toLowerCase());
    }

    


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

}]);
