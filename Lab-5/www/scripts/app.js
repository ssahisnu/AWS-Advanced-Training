var applianceManagerApp = null;

(function () {
    'use strict';

    applianceManagerApp = angular
        .module('app', ['ngRoute', 'ngCookies', 'ngAnimate', 'toaster', 'ui.bootstrap', 'ui.bootstrap-slider', 'btorfs.multiselect'])
        .config(config)
        .run(onPageLoad)

    function config($routeProvider, $locationProvider) {
        $routeProvider
        .when('/', {
            controller: 'HomeController',
            templateUrl: 'home/home.view.html',
            controllerAs: 'vm'
        })
        .when('', {
            controller: 'HomeController',
            templateUrl: 'home/home.view.html',
            controllerAs: 'vm'
        })

            .otherwise({ redirectTo: '/' }); 
    }

    function onPageLoad(
      $rootScope,
      $location,
      $cookieStore,
      $http,
      AuthenticationService,
      COGNITO_USER_POOL,
      COGNITO_USER_POOL_CLIENT_ID
      )
    {
        console.log("onPageLoad()");
        //
        // keep user logged in after page refresh
        //
        if (AuthenticationService.CognitoSignInData && AuthenticationService.CognitoSignInData.currentUser)
        {
            AuthenticationService.GetUserSession(
                AuthenticationService.CognitoSignInData.currentUser,
                function(response)
                {
                    if (!response.succeeded)
                    {
                        console.log("Failed to get user token () -> " + response.message);
                        $location.path('/');
                    }
                }
            );
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current)
        {
            return;
            console.log('locationChangeStart -' + JSON.stringify(AuthenticationService.CognitoSignInData.currentUser));

            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login']) === -1;
            if ( !AuthenticationService.CognitoSignInData.currentUser )
            {
              if (restrictedPage )
              {
                  //console.log("Redirecting away from restricted page");
                  //$location.path('/login');
                  $location.path('/');
              }
            }
        });
    }

})();
