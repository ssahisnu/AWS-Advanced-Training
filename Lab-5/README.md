<h3>Overview</h3>
<p>Redesign monolithic CloudAir application and move it to a serverless/serviceful architecture with microservices.
  In previous labs had exposures on 
  various serverless concepts - for example, AWS Lambda and Amazon API Gateway - here rethink and redesign the monolith application,
  and move to a completely serverless model incorporating authentication and authorization using Amazon Cognito.</p>
<h3>Before</h3>

![Architecture-before](https://user-images.githubusercontent.com/43699421/186924472-1680982f-9f85-47db-8719-cd9cc78c6d0d.png)

<h3>After</h3>

![Lab5-CloudAir-slide58_version3](https://user-images.githubusercontent.com/43699421/186924508-54e7d9f2-eb96-4be5-be74-8190d0d41fa9.png)


<h4>Build Lambda functions</h4>
Find in repo and build <em>TripSearchFull</em> artifact
<ul>
  <li>Upload the artifact to S3 </br>
    <code>aws s3 cp target/tripsearch-1.0.0.jar s3://<S3BucketLambdaCode> --region us-east-1 --profile aws-lab-env</code>
  </li>
  <li>Create FindAllTrips lambda </br>
    <code>aws lambda create-function --function-name microservicesTripSearchFull --runtime java8 --role <LambdaExecutionRole> --handler microservices.lambda.FindAllTripsHandler --code S3Bucket=<S3BucketLambdaCode>,S3Key=tripsearch-1.0.0.jar --timeout 15 --description "CloudAir TripSearch microservice - FindAllTrips" --memory-size 1024 --profile aws-lab-env</code>
  </li>
  <li>Create FindAllTripsFromCity lambda </br>
    <code>aws lambda create-function --function-name microservicesTripSearchFromCity --runtime java8 --role <LambdaExecutionRole> --handler microservices.lambda.FindTripsFromCityHandler --code S3Bucket=<S3BucketLambdaCode>,S3Key=tripsearch-1.0.0.jar --timeout 15 --memory-size 1024 --profile aws-lab-env</code>
  </li>
  <li>Create FindTripsToCity lambda </br>
    <code>aws lambda create-function --function-name microservicesTripSearchToCity --runtime java8 --role <LambdaExecutionRole> --handler microservices.lambda.FindTripsToCityHandler --code S3Bucket=<S3BucketLambdaCode>,S3Key=tripsearch-1.0.0.jar --timeout 15 --memory-size 1024 --profile aws-lab-env</code>
  </li>
  <li></li>
</ul>

![ApiGateway-AWSConsole](https://user-images.githubusercontent.com/43699421/186917885-699f4c8a-513f-41ee-9a9e-29bccd0bd5ef.png)
![ApiResponses](https://user-images.githubusercontent.com/43699421/186918230-8693376e-2b52-488c-80d6-86a0c7278bc9.png)
![CodeStar-Pipeline](https://user-images.githubusercontent.com/43699421/186918680-81471430-94b4-40fe-9fb7-6ede3ef1f77d.png)
![Screenshot 2022-08-26 at 7 29 06 PM](https://user-images.githubusercontent.com/43699421/186920643-a58adeca-774f-4973-bbed-b18c5a27eb7f.png)![Screenshot 2022-08-26 at 7 28 56 PM](https://user-images.githubusercontent.com/43699421/186920666-9ce83080-99b9-4be7-9869-9c0ffb57ae43.png)
![trim-std](https://user-images.githubusercontent.com/43699421/186922906-d5a498d1-cd4e-46f6-a50a-61e9973d45c0.gif)
![Screenshot 2022-08-26 at 7 42 31 PM](https://user-images.githubusercontent.com/43699421/186923222-d7954e7a-479f-43c6-8e47-6d9bbb407469.png)





<p><strong>Amazon Elastic Compute Cloud (Amazon EC2)</strong></p>
<ul>
<li>Amazon EC2 is a web service that provides resizable compute capacity in the cloud. It’s designed to make web-scale cloud computing easier for developers. Amazon EC2 reduces the time required to obtain and boot a new server instance to minutes, allowing you to quickly scale capacity, both up-and-down, as your computing requirements change.</li>
<li><i class="fas fa-info-circle" style="color:#00a1c9"></i> <strong>Additional information:</strong> <a href="https://aws.amazon.com/ec2" target="_blank">Learn more about the Amazon EC2</a></li>
</ul>
<p><strong>Amazon Cognito</strong></p>
<p>Amazon Cognito lets you easily add user sign-up and sign-in to your mobile and web apps. With Amazon Cognito, you also have the option to authenticate users through social identity providers such as Facebook, Twitter, or Amazon with SAML identity solutions or using your own identity system.</p>
<p><i class="fas fa-info-circle" style="color:#00a1c9"></i> <strong>Additional information:</strong> <a href="https://aws.amazon.com/cognito/" target="_blank">Select here for more information about Amazon Cognito</a></p>
