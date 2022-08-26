
(function(connectedCallback, configuration)
 {
     // -- fetch the relevant Cognito credentials
     var params = {
         IdentityPoolId    : config.Cognito.IdentityPoolId
     };

     AWS.config.region       = config.Region;
     AWS.config.credentials  = new AWS.CognitoIdentityCredentials(params);

     AWS.config.credentials.get(function(err)
                                {
                                    if (!err)
                                    {
                                        console.log("Cognito Identity Id: " + AWS.config.credentials.identityId);
										                    connectedCallback(configuration);
                                    }
                                    else
                                    {
                                        console.log("Cognito Error: " + err );
                                    }
                                });
 })(cognitoConnectedFunction, config);
