<h3>Overview</h3>
Explored different messaging options on the AWS platform.
Messaging help in designing scalable, decoupled architectures; also it makes them more resistant to failure.
Building applications from the individual components that each perform a discrete function improves scalability and reliability and is a best practice of design for modern applications.

<h3>Objectives</h3>
<blockquote>
<ul>
<li>Understand the different behaviors of the various messaging options on the AWS platform.</li>
<li>Understand the differences between queuing and streaming data.</li>
<li>Use AWS messaging solutions from the web browser and programmatically using the Java SDK.</li>
<li>Read data from an Amazon Kinesis stream using an AWS Lambda function.</li>
</ul>
</blockquote>

<h4>Create, Configure, and Populate an S3 bucket website</h4>
<ul>
  <li>
    Make Bucket
    </br>
    <code>aws s3 mb s3://microservices-lab4-sahi-02 --region us-east-1 --profile aws-lab-env</code>
  </li>
  <li>
    Enable <em>website</em> mode on the S3 bucket
    </br>
    <code>aws s3 website s3://microservices-lab4-sahi-02 --index-document sqs-standard.html --region us-east-1 --profile aws-lab-env</code>
  </li>
  <li>
    Add a bucket policy to the S3 bucket to allow anonymous requesters to read the objects in the bucket; Policy document: <strong>bucket\policy.json</strong>
    <code>aws s3api put-bucket-policy --bucket microservices-lab4-sahi-02 --policy file://bucket/policy.json --region us-east-1 --profile aws-lab-env</code>
  </li>
  
</ul>
 
 <h4>SQS Queue setup</h4>
<p>3 standard queues and 1 FIFO queue</p>

![sqsconsole2020](https://user-images.githubusercontent.com/43699421/186849546-ea5bc8e4-2937-47ee-b4cb-6f16edf94252.png)

<h3>SQS publisher to SQS subscriber</h3>
 

![sqspubsub1-architecture](https://user-images.githubusercontent.com/43699421/186861452-88c3a9fa-f3eb-4aac-ae13-9ee46408e7dd.png)

<p>The webpage uses the AWS SDK for Javascript in the browser and authenticates anonymously with Amazon Cognito to obtain scoped, temporary credentials with which it can sign requests to connect into the Amazon SQS service to publish and subscribe to the same SQS queue. In this webpage , the <em>publisher</em> is represented on the left grey canvas, the <em>subscriber</em> on the right.</p>
<p>To be able to connect to and query your AWS environment (for example, to send messages to queues), the Javascript code running in the browser needs to obtain credentials. You should never embed <em>Access Keys/Secret Access Keys</em> into your applications, so another mechanism for the web page to dynamically obtain credentials is required. Amazon Cognito provides a mechanism to vend temporary credentials to untrusted environments, such as web pages. All these lab demonstrations use the “unauthenticated” or “anonymous” access mode with Amazon Cognito. In this mode, the webpage can obtain the temporary credentials without the user having to provide authentication credentials. Find the Cognito IdentityPool: <em>Messaging/scripts/cognito-bootstrap.js</em></p>
<p>Using the mouse or pointing device, a shape is drawn by holding down with the left mouse button or equivalent pointing device action while the pointer  is moved it leaves a trail of pixels. Messages will be sent to an SQS queue containing information about the X & Y coordinates of the mouse. These messages will be received by the browser polling the <em>same</em> SQS queue and rendered on the right-hand canvas.</p>

![sqs-sqs-hd](https://user-images.githubusercontent.com/43699421/186841883-89bf4367-4d6f-4734-8f8d-0df8a8f3c62d.gif)

<p>What you will notice in the above gif is that the shape will render the drawing points on the <em>subscriber</em> panel in a different order than the order they were drawn. Regardless, eventually, every drawing point will be rendered. The order is not gaurnteed in case of <strong>Standard</strong>
SQS queue</p> 

<p><em><strong>What is causing the delay between send and receive?</strong></em></p>
<p>Due to the nature of the threading model in the browser, and contention on the network stack through the browser, there will be some delay and competition between the send and receive sides of the demonstration. Amazon SQS is highly scalable and performant, but this demo is not designed to illustrate the performance. It is designed to highlight the out-of-order message reception. There is no coordination between publishing and subscribing in this demo, and the web browser doesn’t implement an ability to “spawn threads” to run the two tasks simultaneously, so they compete.</p>

<h3>SQS publisher to multiple SQS subscribers</h3>

![sqspubmultisub1-architecture](https://user-images.githubusercontent.com/43699421/186866968-e16abb35-48d8-4400-bffe-34df2490fc24.png)

![sqs-m_sqs-hd](https://user-images.githubusercontent.com/43699421/186842364-a7078bc1-bf26-4750-a9c5-23f9deb16fde.gif)
<p><em><strong>The points are drawn out-of-order on the right-hand side, and no single canvas has the complete drawing</strong></em></p>
<p>Points are drawn out of order because messages received through an SQS queue are received in an indeterminate order. This is a characteristic of the standard SQS queue. Because each canvas is polling the same SQS queue, they are competing for the messages in the queue and will arbitrarily receive the points events and render them, stealing them from the other canvases.</p>
<p>Regardless of which canvas subscriber receives the drawing point message, all of the sent messages will be received. You can confirm this by comparing the <strong>Messages Sent</strong> counter against the <strong>Messages Received</strong> counter in the publisher statistics panel. They will eventually be identical.</p>
<h3>SQS publisher to SQS subscriber with FIFO ordering</h3>

![f-sqs_sqs_hd](https://user-images.githubusercontent.com/43699421/186842948-ece52956-c1a7-4a1a-ba10-eb3ae2dd50b0.gif)

<p>The FIFO behavior has preserved the message ordering at the expense of throughput and latency. You may notice that there is an additional delay observed before the messages start to be received.</p>

<h3>SNS publisher to multiple SQS subscribers</h3>

![snssqsarchitecture1](https://user-images.githubusercontent.com/43699421/186868485-f4186468-7465-4c27-97e1-711c347eaf22.png)

<p>In previous topic, it can be seen that multiple subscribers reading from the same SQS queue could “steal” messages from each other, so that no single subscriber saw all the messages in the queue. Sometimes, it is a requirement that multiple subscribers to a queue receive all messages, so some mechanism for publishing a single message to multiple queues is required. The solution is to use an intermediary mechanism to “fan out” the message to multiple subscribers. The intermediary in this case is Amazon SNS, the Simple Notification Service. Amazon SNS allows an application to send a single message intent and have that message delivered to one or more targets. The targets of the message can be an HTTP endpoint, a mobile device, or an SQS queue - and in fact, multiples and any combination of these.</p>

![sns-sqs-hd](https://user-images.githubusercontent.com/43699421/186843696-3bfca830-c003-4cc9-9b25-f7a3430c3f0c.gif)

<h3>Kinesis publisher to SQS subscriber</h3>
<p>Amazon Kinesis makes it easy to collect, process, and analyze real-time streaming data so you can get timely insights and react quickly to new information. In this scenario, the browser sends draw points to a Kinesis stream. Normally, you would create a Kinesis consumer client and read the events from the stream directly to process them. But for this scenario, let’s assume you want the messages to be delivered to an SQS queue like you have done in the previous scenarios.</p>
<p>Since there is no built-in way to route messages that have been published to a Kinesis stream into an SQS queue. In this scenario, an intermediary as a Lambda function is implemented that will create a bridge between the Kinesis stream and the SQS queue we want to target.</p>
<p>Find in repo <em>KinesisToSQS</em> lamdba handlers implemented for this purpose</p>

![kinesislambdasqsarchitecture1](https://user-images.githubusercontent.com/43699421/186871064-9b6788ec-c97d-414b-8bb7-ad674dbd73bc.png)

![kin-sqs-hd](https://user-images.githubusercontent.com/43699421/186844456-9a8a290b-5dae-4f1f-9237-2095fb67b90b.gif)

<p><strong>Note that the shape you draw is rendered inversed in the Y-dimension</strong></p>
<p>This is because the implementation used for the Lambda function runs a transform on the drawing points, just to demonstrate how we can manipulate the data in the Kinesis stream before passing it to the SQS queue.</p>

<h3>MQTT Publisher to MQTT Subscriber</h3>
<p>The last messaging behavior to explore is lightweight Message Queuing Telemetry Transport (MQTT) messaging, using AWS IoT as an ephemeral pub/sub bus. In this scenario, drawing events are published to a custom MQTT topic. This same custom topic is subscribed to by the receiving canvas, and points are rendered. The latency between the publish and subscribe is very low, but note that all messages sent on the bus are <em>ephemeral</em> - if the subscriber is not “listening” when the publisher sends the message, the message is lost forever.</p>

![iotpubsubarchitecture](https://user-images.githubusercontent.com/43699421/186872308-183e6d00-e6a6-452b-bd70-936efd36a807.png)

![iot-mqtt-hd](https://user-images.githubusercontent.com/43699421/186844894-c13608dd-9b99-4a1a-9c75-571466ec3b36.gif)
<p>Notice that the shape appears on the MQTT Subscriber canvas on both browser tabs at the same time. The MQTT messages automatically “fan out” to multiple subscribers. You do not need to pre-provision the subscriber pages ahead of time - they are dynamically subscribed to the same bus when they connect. Unlike SQS for example, where you need to provision the SQS queue ahead of time.</p>
