(function () {
    'use strict';

    angular
        .module('app')
        .controller('NavbarController', NavbarController);

    function NavbarController(
        $scope,
        $modal,
        toaster,
        AuthenticationService,
        FlightSpecialsService,
        HotelSpecialsService,
        TripSearchService,
        APP_BANNER
        )
    {

        var main = this;
        $scope.searchTripsToCity = "";
        $scope.searchInProgress  = false;

        $scope.Login = function()
        {
            console.log("Login");

            $modal.open({
                animation: true,
                templateUrl: 'login/login.view.html',
                controller: 'LoginController',
                size: 'md'
                });
        }

        $scope.FindTripsToCity = function()
        {
            $scope.searchInProgress = true;

            if ( $scope.searchTripsToCity != "" )
            {
                TripSearchService.FindTripsToCity($scope.searchTripsToCity, function(){$scope.searchInProgress = false});
            }
            else
            {
                TripSearchService.FindAllTrips(function(){$scope.searchInProgress = false});
            }
        }

        $scope.Logout = function()
        {
            AuthenticationService.ClearCredentials();
            toaster.success({title: "Logout", body:"You have been successfully logged out of your Cloud Air account", timeout:3000});
        }

        $scope.IsLoggedOn = function()
        {
            return AuthenticationService.IsLoggedOn();
        }

        $scope.CurrentUserInfo = function()
        {
            if ( AuthenticationService.IsLoggedOn() )
                return AuthenticationService.CurrentUserInfo().userAttributes.given_name + " " + AuthenticationService.CurrentUserInfo().userAttributes.family_name + " (" + AuthenticationService.CurrentUserInfo().currentUser.username + ")";
            else
                return "";
        }

        $scope.ApplicationName = function()
        {
            return APP_BANNER;
        }

        $scope.CognitoIdentityId = function()
        {
            if ( AWS && AWS.config && AWS.config.credentials )
                return AWS.config.credentials.identityId;
            else
                return "(Not logged on)";
        }

    }

})();
