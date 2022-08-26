(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthenticationService', AuthenticationService);

    function AuthenticationService(
        FlashService,

        $http,
        $cookieStore,
        $rootScope,
        $timeout,
        $location,
        COGNITO_USER_POOL,
        COGNITO_IDENTITY_POOL_ID,
        COGNITO_USER_POOL_CLIENT_ID,
        COGNITO_APP_WEB_DOMAIN,
        AWS_REGION
        )
    {
        var service = {};

        AWS.config.region                                   = AWS_REGION;
        AWSCognito.config.region                            = AWS_REGION;

        service.NotifyAuthChangeListeners                   = NotifyAuthChangeListeners;
        service.RegisterAuthChangeListener                  = RegisterAuthChangeListener;
        service.registeredAuthChangeListeners               = [];
        service.RegisterUser                                = RegisterUser;
        service.Login                                       = Login;
        service.VerifyNewUserCode                           = VerifyNewUserCode;
        service.SetCredentials                              = SetCredentials;
        service.ClearCredentials                            = ClearCredentials;
        service.GetUserSession                              = GetUserSession;
        service.IsLoggedOn                                  = IsLoggedOn;
        service.loggedIn                                    = false;
        service.CurrentUserInfo                             = CurrentUserInfo;
        service.TargetUserPool                              = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool({
                                                                    UserPoolId: COGNITO_USER_POOL,
                                                                    ClientId: COGNITO_USER_POOL_CLIENT_ID
                                                                });

        service.CognitoSignInData = {
            lastIdentityToken: null,
            lastAccessToken: null,
            currentUser: service.TargetUserPool.getCurrentUser(),
            userName : "",
            userAttributes:[]
        };

        return service;

        function GetUserSession(cognitoUser, callback)
        {
          cognitoUser.getSession(function(err, result)
          {
              if (result)
              {
                  cognitoUser.getUserAttributes(
                    function(err, userAttributes)
                    {
                        if (err)
                        {
                            alert(err);
                            return;
                        }


                        for (var i = 0; i < userAttributes.length; i++)
                        {
                            //console.log('attribute ' + userAttributes[i].getName() + ' has value ' + userAttributes[i].getValue());
                            service.CognitoSignInData.userAttributes[userAttributes[i].getName()] = userAttributes[i].getValue();
                        }

                        // Add the User's Id Token to the Cognito credentials login map.
                        var cognitoLogin =
                        {
                            IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
                            Logins: []
                        }

                        cognitoLogin.Logins[
                          "cognito-idp." +
                          AWS_REGION +
                          ".amazonaws.com/" +
                          COGNITO_USER_POOL
                        ] = result.getIdToken().getJwtToken();

                        AWS.config.credentials = new AWS.CognitoIdentityCredentials(cognitoLogin);

                        //call refresh method in order to authenticate user and get new temp credentials
                        AWS.config.credentials.refresh(function(error) {
                            if (error)
                            {
                                console.error(error);
                                $rootScope.$broadcast('authflow', "Cognito Error");

                                console.log("Cognito Error: " + err );
                                $rootScope.$apply(function() {
                                    FlashService.Error("Cognito Error: " + err);
                                });
                            }
                            else
                            {
                                $rootScope.$broadcast('cognitoId', AWS.config.credentials.identityId);
                                $rootScope.$broadcast('authflow', AWS.config.credentials.identityId);
                                
                                SetCredentials(result);
                                service.NotifyAuthChangeListeners();

                                service.loggedIn = true;

                                $rootScope.$apply(function()
                                {
                                    callback({succeeded:true});
                                });
                            }
                            });
                    });


              }
          });

        }

        function VerifyNewUserCode(username, code, callback)
        {

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username : username,
                Pool : service.TargetUserPool
            });

            cognitoUser.confirmRegistration(code, true, function(err, result) {
                
                $rootScope.$apply(function()
                {
                    if (err)
                        {
                            console.log(err);
                            callback({
                                succeeded: false,
                                message: err.message
                            });
                        }
                        else
                        {
                            callback({
                                succeeded: true,
                                message: "Verification of " + username + " succeeded"
                            });
                        }
                    });
            });
        }

        function Login(username, password, callback)
        {
            $rootScope.$broadcast('authflow', 'Calling authentication service');

            var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails({
                Username : username,
                Password : password
            });

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username : username,
                Pool : service.TargetUserPool
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {

                  $rootScope.$apply(function()
                  {
                    $rootScope.$broadcast('authflow', 'Authenticated - redeeming token');
                    console.log('access token ' + result.getAccessToken().getJwtToken());
                    console.log('identity token ' + result.getIdToken().getJwtToken());

                    var cognitoUser = service.TargetUserPool.getCurrentUser();
                    if (cognitoUser != null)
                    {
                        service.CognitoSignInData.currentUser = cognitoUser;
                        GetUserSession(cognitoUser, callback);
                    }
                  });
                },

                onFailure: function(err)
                {
                  $rootScope.$apply(function()
                  {
                    $rootScope.$broadcast('authflow', err.message);
                    callback(err);
                  });
                }
            });
        }

        function SetCredentials(authResponse)
        {
          service.CognitoSignInData.lastIdentityToken     = authResponse.getIdToken().getJwtToken();
          service.CognitoSignInData.lastAccessToken       = authResponse.getAccessToken().getJwtToken();
        }

        function ClearCredentials()
        {
            if ( service.TargetUserPool && service.TargetUserPool.getCurrentUser() )
            {
              service.TargetUserPool.getCurrentUser().clearCachedTokens();
            }

            service.CognitoSignInData.lastIdentityToken = null;
            service.CognitoSignInData.lastAccessToken = null;
            service.CognitoSignInData.currentCognitoUser = null;
            $http.defaults.headers.common.CognitoAuth = '';

            var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser({
                Username : "",
                Pool : service.TargetUserPool
            });

            cognitoUser.signOut();
            if ( AWS.config.credentials )
              AWS.config.credentials.clearCachedId();
            
            service.loggedIn = false;
            AWS.config.credentials = null;
            service.NotifyAuthChangeListeners();
        }

        function IsLoggedOn()
        {
            return service.loggedIn;
        }

        function CurrentUserInfo()
        {
            if ( IsLoggedOn() )
            {
                return service.CognitoSignInData;
            }
            else
                return {};
        }

        function RegisterUser(
            registerFirstname, 
            registerLastname, 
            registerEmail, 
            registerPassword,
            callback
            )
        {
            var attributeList = [];
            
            var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                Name : 'email',
                Value : registerEmail
            });

            var attributeFamilyName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                Name : 'family_name',
                Value : registerLastname
            });

            var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                Name : 'given_name',
                Value : registerFirstname
            });

            var attributeUsername = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute({
                Name : 'name',
                Value : registerEmail
            });

            attributeList.push(attributeEmail);
            attributeList.push(attributeName);
            attributeList.push(attributeFamilyName);
            attributeList.push(attributeUsername);

            service.TargetUserPool.signUp(
                registerEmail, 
                registerPassword, 
                attributeList, 
                null, 
                function(err, result)
                {
                    $rootScope.$apply(function()
                    {
                        if (err)
                        {
                            console.log(err);
                            callback({
                                succeeded: false,
                                message: err.message
                            });
                        }
                        else
                        {
                            callback({
                                succeeded: true,
                                message: "Registration of " + result.user.getUsername() + " succeeded"
                            });
                        }
                    });
                });
        }

        function NotifyAuthChangeListeners()
        {
            for ( var id in service.registeredAuthChangeListeners)
            {
                if ( service.registeredAuthChangeListeners[id] !== null )
                    service.registeredAuthChangeListeners[id]("Initialise");
            };
        }

        function RegisterAuthChangeListener(id, callback)
        {
            console.log("RegisterAuthChangeListener " + id);
            service.registeredAuthChangeListeners[id] = callback;
        }

    }

})();
