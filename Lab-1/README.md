<h3>Overview</h3>
<p>This lab covers, deploying the fictitious web application <em>CloudAir</em> to run on the AWS Elastic Beanstalk PaaS service. How AWS CloudFormation automates the creation of your base cloud infrastructure and how to use the Elastic Beanstalk CLI to automate the provisioning and deployment of the web application. The CloudFormation template <strong>labvpc.template</strong> automatically provisions a MySQL database instance hosted with Amazon Relational Database Service (Amazon RDS) and all the necessary networking components to secure the environment. Cloud9 environment environment is used for developing.</p>
<h4>Software Prerequisites</h4>
<ul>
<li><a href="http://www.oracle.com/technetwork/pt/java/javase/downloads/jdk8-downloads-2133151.html" title="Java 8 JDK" target="_blank">Java 8 JDK</a></li>
<li><a href="https://www.eclipse.org/downloads/eclipse-packages/" title="Eclipse IDE" target="_blank">Eclipse IDE for Java EE Developers</a></li>
<li><a href="https://tomcat.apache.org/download-90.cgi" title="Tomcat Home Support ApacheThe Apache Software Foundation Apache Tomcat" target="_blank">Tomcat 8 or 9</a></li>
<li><a href="http://docs.aws.amazon.com/toolkit-for-eclipse/v1/user-guide/setup-install.html" target="_blank">AWS Toolkit for Eclipse</a></li>
<li><a href="http://docs.aws.amazon.com/cli/latest/userguide/installing.html" target="_blank">AWS CLI</a></li>
<li><a href="http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html" target="_blank">Elastic Beanstalk CLI</a></li>
<li><a href="https://maven.apache.org/download.cgi" title="Maven" target="_blank">Maven 3.5.0+</a></li>
</ul>
<h4>Local execution</h4>
<strong><em>Java MVC application using local MySQL and running on local Tomcat</em></strong>

![before-beanstalk](https://user-images.githubusercontent.com/43699421/186492255-b6dbbcca-5660-484c-9bd6-b0c9bf990bf4.gif)


<h4>AWS Infrastructure Design</h4>

![Screenshot 2022-08-24 at 11 48 48 PM](https://user-images.githubusercontent.com/43699421/186493782-2adaf75e-6140-4dbc-a0b1-3f441afb12b2.png)

<strong>Configure Elastic BeanStalk</strong>
<ul>
  <li>Platform: Tomcat</li>
  <li>Upload WAR through public S3 url or local file upload</li>
  <li>Choose <em>High Availability</em> option. This will change the configuration to support multiple web servers behind an Elastic Load Balancer, and implement auto-scaling</li>
  <li>Modify <em>Network</em> For Load Balancer choose Public Subnets, so ELB is acessible from the internet; For Instance choose private subnet, indicating that EC2 should be launched private behind ELB</li>
  <li>Modify <em>Software</em> to include DB(JDBC) configs - include RDS endpoint, username and password</li>
</ul>

![beanstalk-ref](https://user-images.githubusercontent.com/43699421/186491221-bc1fe522-dea6-407b-9e2a-5859805f4a22.gif)

<h4>Deploy the change using AWS Elastic Beanstalk CLI</h4>
<ul>
<li>Initialize Elastic Beanstalk environment contents: <code>eb init --profile aws-lab-env</code></li>
<li>Upload the newly built deployment to Beanstalk environment: <code>eb deploy --profile aws-lab-env</code></li>
</ul>
