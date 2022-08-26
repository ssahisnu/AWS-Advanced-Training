(function () {
    'use strict';

    angular
        .module('app')
        .factory('FlightSpecialsService', FlightSpecialsService);

    function FlightSpecialsService(
        $http,
        $rootScope,
        AuthenticationService,
        AWS_REGION
        )
    {        
        var service = {};

        service.Singleton               = null;
        service.Initialise              = Initialise;
        service.GetAllFlights           = GetAllFlights;

        AuthenticationService.RegisterAuthChangeListener("FlightSpecialsService", Initialise);

        Initialise();

        return service;

        function Initialise()
        {
            console.log("FlightSpecialsService::OnAuthChangeCallback")

            service.Singleton = apigClientFactory_FlightSpecials.newClient({
                region: AWS_REGION
            });
        }

        function GetAllFlights(
            callback
            )
        {
            if ( service.Singleton )
            {
                service.Singleton.flightspecialsGet(
                    null,
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
                    }
    
                    if ( callback )
                    {
                        console.log(response);
                        callback(response);
                    }
    
                }).catch(function(response)
                {
                    console.log("EXCEPTION::" + JSON.stringify(response))
                });
            }
        }
    };

})();
