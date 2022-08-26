(function () {
    'use strict';

    angular
        .module('app')
        .factory('HotelSpecialsService', HotelSpecialsService);

    function HotelSpecialsService(
        $http,
        $rootScope,
        AuthenticationService,
        AWS_REGION
        )
    {        
        var service = {};

        service.Singleton               = null;
        service.Initialise              = Initialise;
        service.GetAllHotels            = GetAllHotels;

        AuthenticationService.RegisterAuthChangeListener("HotelSpecialsService", Initialise);

        Initialise();

        return service;

        function Initialise()
        {
            console.log("HotelSpecialsService::OnAuthChangeCallback")

            service.Singleton = apigClientFactory_HotelSpecials.newClient({
                region: AWS_REGION
            });
        }

        function GetAllHotels(
            callback
            )
        {
            if ( service.Singleton )
            {
                service.Singleton.hotelspecialsGet(
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
