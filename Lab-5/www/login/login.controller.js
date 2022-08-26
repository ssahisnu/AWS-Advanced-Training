(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', function(
            $location,
            $scope,
            $modalInstance,
            toaster,
            AuthenticationService
            )
    {
        var vm = this;

        $scope.mode                 = "login";
        $scope.Login                = Login;
        $scope.Register             = Register;
        $scope.Verify               = Verify;
        $scope.username             = "";
        $scope.password             = "";
        $scope.registerFirstname    = "";
        $scope.registerLastname     = "";
        $scope.registerEmail        = "";
        $scope.registerPassword     = "";
        $scope.confirmCode          = "";
        $scope.statusMessage        = "";
        
        (function initController()
        {
            // reset login status
            AuthenticationService.ClearCredentials();
            console.log("initController() " + $scope.mode);
        })();

        $scope.CloseDialog = function()
        {
            $modalInstance.close();
        }

        function Verify()
        {
            $scope.statusMessage = "Verifying your registration code...";
            $scope.dataLoading = true;

            AuthenticationService.VerifyNewUserCode(
                $scope.registerEmail,
                $scope.confirmCode,
                function (response) {
                    if (response.succeeded)
                    {
                        toaster.success({title: "Verification Ok", body:"Please use your email address and password to log in to Cloud Air!", timeout:3000});
                        $scope.mode = 'login';
                        $scope.dataLoading = false;
                        $scope.statusMessage = "Please use your email address and password to log in to Cloud Air!";
                    }
                    else
                    {
                        $scope.statusMessage = response.message;
                        console.log(response.message);
                        $scope.dataLoading = false;
                        toaster.error({title: "Registration Error", body:response.message, timeout:5000});
                    }
                });   
        }

        function Register()
        {
            $scope.statusMessage = "Registering new user...";
            $scope.dataLoading = true;

            AuthenticationService.RegisterUser(
                $scope.registerFirstname, 
                $scope.registerLastname, 
                $scope.registerEmail, 
                $scope.registerPassword,
                function (response) {
                    if (response.succeeded)
                    {
                        toaster.success({title: "Registration Ok", body:"Please check your email inbox for the verification code we have sent you, to complete your registration.", timeout:3000});
                        $scope.mode = 'confirm';
                        $scope.dataLoading = false;
                        $scope.statusMessage = "Registration Ok - waiting for verification code";
                    }
                    else
                    {
                        $scope.statusMessage = response.message;
                        console.log(response.message);
                        $scope.dataLoading = false;
                        toaster.error({title: "Registration Error", body:response.message, timeout:5000});
                    }
                });            
        }

        function Login()
        {
            $scope.statusMessage = "Attempting login...";
            $scope.dataLoading = true;

            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.succeeded)
                {
                    //
                    // Redirect back to Home
                    //
                    console.log("login.controller - log in ok");
                    toaster.success(
                        {
                            title: "Login Ok", 
                            body:"Welcome back to Cloud Air, " + AuthenticationService.CurrentUserInfo().userAttributes.given_name + "!", 
                            timeout:3000
                        });

                    $modalInstance.close();
                }
                else
                {
                    $scope.statusMessage = response.message;
                    console.log(response.message);
                    $scope.dataLoading = false;
                    toaster.error({title: "Login Error", body:response.message, timeout:3000});
                }
            });
        };
    })

})();
