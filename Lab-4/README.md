<h3>Overview</h3>
In this lab, you explore the different messaging options on the AWS platform.
Messaging is an important concept to understand when designing scalable, decoupled architectures; it makes them more resistant to failure.
Building applications from the individual components that each perform a discrete function improves scalability and reliability and is a best practice of design for modern applications.
AWS has several messaging solutions, from queuing to streaming, and you investigate the behaviors of each as you go through the lab.

<h3>Objectives</h3>
<blockquote>
<ul>
<li>Understand the different behaviors of the various messaging options on the AWS platform.</li>
<li>Understand the differences between queuing and streaming data.</li>
<li>Use AWS messaging solutions from the web browser and programmatically using the Java SDK.</li>
<li>Read data from an Amazon Kinesis stream using an AWS Lambda function.</li>
</ul>
</blockquote>

<h4>Software Requirements</h4>
<ul>
<li><a href="https://git-scm.com/book/en/v1/Getting-Started-Installing-Git" target="_blank">Git client</a></li>
<li><a href="http://www.oracle.com/technetwork/pt/java/javase/downloads/jdk8-downloads-2133151.html" title="Java 8 JDK" target="_blank">Java 8 JDK</a></li>
<li><a href="https://www.eclipse.org/downloads/eclipse-packages/" title="Eclipse IDE" target="_blank">Eclipse IDE for Java EE Developers</a>.</li>
<li><a href="https://tomcat.apache.org/download-90.cgi" title="Tomcat Home Support ApacheThe Apache Software Foundation Apache Tomcat" target="_blank">Tomcat 8 or 9</a>.</li>
<li><a href="http://docs.aws.amazon.com/toolkit-for-eclipse/v1/user-guide/setup-install.html" target="_blank">AWS Toolkit for Eclipse</a></li>
<li><a href="http://docs.aws.amazon.com/cli/latest/userguide/installing.html" target="_blank">AWS CLI</a></li>
<li><a href="https://maven.apache.org/download.cgi" title="Maven" target="_blank">Maven 3.5.0+</a></li>
</ul>

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
  
![sqs-sqs-hd](https://user-images.githubusercontent.com/43699421/186841883-89bf4367-4d6f-4734-8f8d-0df8a8f3c62d.gif)

![sqs-m_sqs-hd](https://user-images.githubusercontent.com/43699421/186842364-a7078bc1-bf26-4750-a9c5-23f9deb16fde.gif)

![f-sqs_sqs_hd](https://user-images.githubusercontent.com/43699421/186842948-ece52956-c1a7-4a1a-ba10-eb3ae2dd50b0.gif)

![sns-sqs-hd](https://user-images.githubusercontent.com/43699421/186843696-3bfca830-c003-4cc9-9b25-f7a3430c3f0c.gif)

![kin-sqs-hd](https://user-images.githubusercontent.com/43699421/186844456-9a8a290b-5dae-4f1f-9237-2095fb67b90b.gif)

![iot-mqtt-hd](https://user-images.githubusercontent.com/43699421/186844894-c13608dd-9b99-4a1a-9c75-571466ec3b36.gif)
