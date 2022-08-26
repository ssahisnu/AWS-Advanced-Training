(function () {
    'use strict';

    angular
        .module('app')
        .factory('TripSearchService', TripSearchService);

    function TripSearchService(
        $http,
        $rootScope,
        $modal,
        toaster,
        AuthenticationService,
        AWS_REGION
        )
    {        
        var service = {};

        service.Singleton               = null;
        service.Initialise              = Initialise;
        service.FindTripsToCity         = FindTripsToCity;
        service.FindAllTrips            = FindAllTrips;

        AuthenticationService.RegisterAuthChangeListener("TripSearchService", Initialise);

        Initialise();

        return service;

        function Initialise()
        {
            console.log("TripSearchService::OnAuthChangeCallback")

            service.Singleton = apigClientFactory_TripSearch.newClient({
                region: AWS_REGION
            });
        }

        function FindAllTrips(
            callback
            )
        {
            if ( service.Singleton )
            {
                service.Singleton.tripsGet(
                    {
                    },
                    {},
                    {
                    headers : {
                        Authorization : AuthenticationService.CognitoSignInData.lastIdentityToken
                    }
                    }
                )
                .then(function(response)
                {
                    if ( !response.err )
                    {
                        console.log(response);

                        $modal.open({
                            animation: true,
                            templateUrl: 'dialogs/trips.dialog.html',
                            controller: 'TripsDialogController',
                            size: 'md',
                            resolve:
                            {
                            trips: function ()
                                    {
                                        return response.data.data;
                                    },
                            mode: function ()
                                {
                                    return "all";
                                },
                            city: function ()
                                {
                                    return "all";
                                }
                            }
                        });        
                    }
                    
                    if ( callback )
                    {
                        callback(response);
                    }
    
                }).catch(function(response)
                {
                    $rootScope.$apply(function()
                    {
                        if ( response.status == 401 )
                        {
                            toaster.error({title: "Security Error", body:"You must be logged in to search for all trips!", timeout:5000});
                        }
                        else
                        {
                            toaster.error({title: "Error", body:response.data.message, timeout:5000});
                        }
                    });

                    if ( callback )
                    {
                        callback(response);
                    }

                    console.log("TripSearchService.EXCEPTION::" + JSON.stringify(response));
                });
            }
        }

        function FindTripsToCity(
            toCity, 
            callback
            )
        {
            console.log("FindTripsToCity " + toCity);
            service.Singleton.tripstocityCityGet(
                {
                    "city":toCity
                },
                {},
                {
                  headers : {
                    Authorization : AuthenticationService.CognitoSignInData.lastIdentityToken
                  }
                }
              )
              .then(function(response)
              {
                  if ( !response.err )
                  {
                      console.log(response);

                      $modal.open({
                        animation: true,
                        templateUrl: 'dialogs/trips.dialog.html',
                        controller: 'TripsDialogController',
                        size: 'md',
                        resolve:
                        {
                          trips: function ()
                                  {
                                      return response.data.data;
                                  },
                         mode: function ()
                            {
                                return "tripstocity";
                            },
                         city: function ()
                            {
                                return toCity;
                            }
                        }
                      });
        
                  }
  
                  if ( callback )
                  {
                      callback(response);
                  }
  
              }).catch(function(response)
              {
                if ( callback )
                {
                    callback(response);
                }
            
                console.log("TripSearchService.EXCEPTION::" + JSON.stringify(response));
              });
        }
    };

})();
