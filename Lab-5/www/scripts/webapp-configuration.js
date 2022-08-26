//
// Configuration section
//
// Follow the instructions in the Lab guide to set
// the following constants to run the web application
// against your AWS account:
//
//      API_GATEWAY_ENDPOINT_URI
//      IOT_BROKER_ENDPOINT
//      COGNITO_IDENTITY_POOL_ID
//      AWS_REGION
//
(function () {
    'use strict';

    angular
        .module('app')

        .constant('COGNITO_IDENTITY_POOL_ID',   'us-east-1:76b6b12c-bdfc-4343-ace7-37b0905f9912')
        .constant('COGNITO_USER_POOL',          'us-east-1_NyYCeUDNF')
        .constant('COGNITO_USER_POOL_CLIENT_ID','2l2n73ts5hl7jcvcs84pdjtbgh')
        .constant('COGNITO_APP_WEB_DOMAIN',     'labstack-4b96c70e-3de4-4c4a-8766-s3bucketwebsite-j4kqjm6dsf4i')

        .constant('AWS_REGION',                 'us-east-1')
        .constant('APP_BANNER',                 'Cloud Air')

})();
