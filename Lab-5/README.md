<h3>Overview</h3>
<p>Redesign monolithic CloudAir application and move it to a serverless/serviceful architecture with microservices.
  In previous labs had exposures on 
  various serverless concepts - for example, AWS Lambda and Amazon API Gateway - here rethink and redesign the monolith application,
  and move to a completely serverless model incorporating authentication and authorization using Amazon Cognito.</p>
<h3>Before</h3>

![Architecture-before](https://user-images.githubusercontent.com/43699421/186924472-1680982f-9f85-47db-8719-cd9cc78c6d0d.png)

<h3>After</h3>

![Lab5-CloudAir-slide58_version3](https://user-images.githubusercontent.com/43699421/186924508-54e7d9f2-eb96-4be5-be74-8190d0d41fa9.png)


<h4>Build TripSearch Lambda functions</h4>
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

<h4>Create APIs to expose TripSearch microservice using AWS ApiGateway</h4>

![Screenshot 2022-08-26 at 8 02 56 PM](https://user-images.githubusercontent.com/43699421/186928000-4d080081-9f52-4a9e-9c30-9676821ae173.png)
<strong>Test the apis</strong>

![task-1-trips23-output](https://user-images.githubusercontent.com/43699421/186933650-443a2854-be83-4e1e-b57a-2a3613ced596.png)

<h4>Deploy HotelSearch microservice using AWS SAM</h4>

<ul>
  <li>Find in repo and build <em>HotelSpecials</em> artifact</li>
  <li>Upload the build artifact to the S3 bucket, then update the template.yml pointer to the code artifact on Amazon S3, and write a new template with this update included to a file called template-export.yml.
  </br>
  <code>aws cloudformation package --template template.yml --s3-bucket qls-123456-a1b2c3d4e5f6-s3bucketlambdacode-a1b2c3d4e5f6
 --output-template template-export.yml --profile aws-lab-env
</code>
  </li>
  
  <li>Create and Delpoy the Cloudformation
  </br>
  <code>aws cloudformation deploy --template-file template-export.yml --stack-name HotelSpecialsAPI --capabilities CAPABILITY_IAM --profile aws-lab-env </code>
  </li>
</ul>
<strong>Test the /hotelspecials api</strong>

![Screenshot 2022-08-26 at 8 12 15 PM](https://user-images.githubusercontent.com/43699421/186930325-4060b698-df85-417e-8fcc-b73d35d59c67.png)

<h4>Deploy FlightSpecials API using AWS CodeStar and CI/CD</h4>
<ul>
  <li>Create Codestar project, AWS Service: AWS Lambda; Application Type: Web Service; Programming Lang: Java; ProjectName: FlightSpecialsAPI
  </li>
  <li>Find in repo <em>FlightSpecialsAPI</em></li>
  <li>Push the changes to <em>Code Commit</em> using git commands to trigger the builds</li>
</ul>

![CodeStar-Pipeline](https://user-images.githubusercontent.com/43699421/186918680-81471430-94b4-40fe-9fb7-6ede3ef1f77d.png)

<p>The <strong>buildspec.yml</strong>, <strong>swagger.yml</strong>, and <strong>template.yml</strong> files define the Amazon API Gateway, Lambda function, and the build/deployment process through AWS CodeBuild. Notice that the <em>buildspec.yml</em> file uses the same AWS CLI command to package the deployment similar to the manual package step in the HotelSpecials API earlier.</p>

<strong>Test the /flightspecials api</strong>

![FlightSplApi](https://user-images.githubusercontent.com/43699421/186931295-8dd4cb3f-c36d-4ae7-aad6-f1628027873d.png)

<h4>Set up the single-page application (SPA) website</h4>
<p>Three APIs set up, Now set up the single-page web application (SPA) and host it on Amazon S3 and utilise the APIs to call from the website</p>
<ul>
  <li>Find in repo the SPA code <em>www</em></li>
  <li>Push SPA files to S3
  </br>
  <code>aws s3 sync . s3://qls-136873-a1b2c3d4e5f6-s3bucketwebsite-a1b2c3d4e5f6 --profile aws-lab-env</code>
  </li>
</ul>

<h4>Authorisation and Authentication</h4>
Now that the APIs are public, set up the API keys from with the AWS ApiGateway console and also configure throttle
Associate the API keys to the exposed APIs

<h4>Add Authentication to the SPA website using Amazon Cognito</h4>
Find the config file in <em>webapp-configuration.js</em>
</br>
<strong>Mark the /trips API to require authenticaion</strong>

![image](https://user-images.githubusercontent.com/43699421/186939067-2071145c-de67-4242-bb28-52b443f0979e.png)
</br>
<strong>Live demo</strong>

![trim-std](https://user-images.githubusercontent.com/43699421/186922906-d5a498d1-cd4e-46f6-a50a-61e9973d45c0.gif)

<h4>Tracing applicaion performance using AWS X-Ray</h4>
Configure the Lambda funcion, enable AWS X-Ray card in Acitve tracing 

![image](https://user-images.githubusercontent.com/43699421/186939660-433ddb50-9829-43ad-82f3-5fbf3acdf161.png)
<p>Here, you can see that the overall call took 4.54 seconds, 1.46 seconds of which was taken by the scan of the <em>CloudAirTripSectors</em> DynamoDB table.</p>

<h3>Resources</h3>
<p><strong>Amazon Elastic Compute Cloud (Amazon EC2)</strong></p>
<ul>
  <li>Amazon EC2 is a web service that provides resizable compute capacity in the cloud. It’s designed to make web-scale cloud computing easier for developers. Amazon EC2 reduces the time required to obtain and boot a new server instance to minutes, allowing you to quickly scale capacity, both up-and-down, as your computing requirements change.</li>
  <li><strong>Additional information:</strong> <a href="https://aws.amazon.com/ec2" target="_blank">Learn more about the Amazon EC2</a></li>
</ul>
<p><strong>Amazon Cognito</strong></p>
<ul>
<li>Amazon Cognito lets you easily add user sign-up and sign-in to your mobile and web apps. With Amazon Cognito, you also have the option to authenticate users through social identity providers such as Facebook, Twitter, or Amazon with SAML identity solutions or using your own identity system.</li>
<li><strong>Additional information:</strong> <a href="https://aws.amazon.com/cognito/" target="_blank">Select here for more information about Amazon Cognito</a></li>
</ul>
<p><strong>Amazon API Gateway</strong></p>
<ul>
<li>Amazon API Gateway is an AWS service that enables developers to create, publish, maintain, monitor, and secure application programming interfaces (APIs) at any scale. You can create APIs that access AWS or other web services, as well as data stored in the AWS Cloud. API Gateway can be considered a backplane in the cloud to connect AWS services and other public or private web sites. It provides consistent RESTful APIs for mobile and web applications to access AWS services.
<li><strong>Additional information:</strong> <a href="https://aws.amazon.com/apigateway/" target="_blank">Select here for more information about Amazon API Gateway</a></li>
</ul>
<p><strong>Amazon DynamoDB</strong></p>
<ul>
<li>Amazon DynamoDB is a key-value and document database that delivers single-digit millisecond performance at any scale. It’s a fully managed, multi-region, multi-active, durable database with built-in security, backup and restore, and in-memory caching for internet-scale applications. DynamoDB can handle more than 10 trillion requests per day and can support peaks of more than 20 million requests per second.</li>
<li><strong>Additional information:</strong> <a href="https://aws.amazon.com/dynamodb/" target="_blank">Learn more about the Amazon DynamoDB</a></li>
</ul>
