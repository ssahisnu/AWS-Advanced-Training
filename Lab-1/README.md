<h3>Overview</h3>
<p>This lab covers, deploying the fictitious web application <em>CloudAir</em> to run on the AWS Elastic Beanstalk PaaS service. How AWS CloudFormation automates the creation of your base cloud infrastructure and how to use the Elastic Beanstalk CLI to automate the provisioning and deployment of the web application. The CloudFormation template <strong>labvpc.template</strong> automatically provisions a MySQL database instance hosted with Amazon Relational Database Service (Amazon RDS) and all the necessary networking components to secure the environment. Cloud9 environment environment is used for developing.</p>

<h4>Local execution</h4>

![before-beanstalk](https://user-images.githubusercontent.com/43699421/186492255-b6dbbcca-5660-484c-9bd6-b0c9bf990bf4.gif)

<strong><em>design: Java MVC application using local MySQL and running on local Tomcat</em></strong>

<h4>AWS Infrastructure Design</h4>

![Screenshot 2022-08-24 at 11 48 48 PM](https://user-images.githubusercontent.com/43699421/186493782-2adaf75e-6140-4dbc-a0b1-3f441afb12b2.png)


<h4>Cloud migrated application</h4>

![beanstalk-ref](https://user-images.githubusercontent.com/43699421/186491221-bc1fe522-dea6-407b-9e2a-5859805f4a22.gif)

<strong><em>design: AWS BeanStalk with Tomcat 9.0; High Availablity - ELB, Multi-AZ; RDS - MySQL</strong></em>
