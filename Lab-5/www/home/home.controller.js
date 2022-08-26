(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    function HomeController(
        FlashService,
        AuthenticationService,
        FlightSpecialsService,
        HotelSpecialsService,
        $rootScope,
        $modal,
        APP_BANNER
        )
    {
        var vm = this;

        vm.cognitoId            = AWS.config.credentials ? AWS.config.credentials.identityId : "(Authenticating)";
        vm.appBanner            = APP_BANNER;
        vm.user                 = AuthenticationService.CurrentUserInfo();
        vm.allFlights           = [];
        vm.allHotels            = [];
        
        initController();

        function initController()
        {
            $rootScope.$on('taskslist', function(event, data)
            {
            });

            $rootScope.$on('cognitoId', function(event, data)
            {
                vm.cognitoId = data
            });

            RefreshFlightsList();
            RefreshHotelsList();
            
        }

        function RefreshHotelsList()
        {
            HotelSpecialsService.GetAllHotels(
                    function (response)
                    {
                        if ( !response.err )
                        {
                            $rootScope.$apply(function()
                            {
                                vm.allHotels = response.data.data;

                                if ( !response.data.succeeded )
                                {
                                    FlashService.Error(response.data.message);
                                }
                                else
                                {
                                }

                            });
                        }
                        else
                        {
                            FlashService.Error(response.message);
                        }
                    }
            );
        }

        function RefreshFlightsList()
        {
            console.log("RefreshFlightsList()");
            
            FlightSpecialsService.GetAllFlights(
                    function (response)
                    {
                        if ( !response.err )
                        {
                            $rootScope.$apply(function()
                            {
                                vm.allFlights = response.data.data;

                                if ( !response.data.succeeded )
                                {
                                    FlashService.Error(response.data.message);
                                }
                                else
                                {
                                }

                            });
                        }
                        else
                        {
                            FlashService.Error(response.message);
                        }
                    }
            );
        }
    }

})();
