(function () {
    'use strict';

    angular
        .module('app')
        .filter('dateFormatter', function()
        {
            return function(dateAsEpoch) {

                var date = new Date(dateAsEpoch);

                var humanReadable = 
                    date.getDate() + "/" +
                    (date.getMonth() + 1) + "/" +                    
                    date.getFullYear() + " at " +
                    date.getHours() + ":" +
                    ((date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes())

                return humanReadable;
            };
        });
})();