/*
Documentation for HomeController

jsonService gets colors for GitHub colors on Page Load

FindMatch is executed on Form Submission
  ->matchService gets location from GitHub username
    success -> gets Google Background from Google API
            -> getRepos Service gets username Repos
              -> gets languages from users repo list
              -> locationService is called and gets matching users based on location and top language
                returnData.total_count > 0    -> displayResults is called
                                                  ->
                returnData.total_count == 0   -> matchNearbyResults is called
                                                  -> extends Locations nearby then calls gitAPI
                                                    -> calls getLanguages is threshold met
                                                      -> searches each user for Repos via findLocationRepos
                                                        -> upon completion of all users repos, finds top users based on language count and repos
                                                          -> displayResultsLocation
                                                    -> calls extendedNearbySearchResults
                                                      -> calls gitAPI again
                                                        -> calls get languages so long as user is found
    error   ->   Displays and Error













*/
