(function () {
    'use strict';

    angular
        .module('app')
        .controller('TripsDialogController', TripsDialogController);

    function TripsDialogController(
        $scope,
        $rootScope,
        $modal,
        $timeout,
        $modalInstance,
        trips,
        mode,
        city,
        FlashService
        )
    {

        $scope.trips    = trips;
        $scope.city     = city;
        console.log($scope.trips);

        initController();

        function initController()
        {
        }

        $scope.CloseDialog = function()
        {
            $modalInstance.close();
        }

        $scope.mode = function()
        {
            return mode;
        }
    }

})();
