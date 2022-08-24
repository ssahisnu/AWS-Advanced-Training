Lab 1 - Deploy monolith application to AWS Elastic Beanstalk

Monolith - Java application running in local tomcat within Eclipse IDE

![before-beanstalk](https://user-images.githubusercontent.com/43699421/186492255-b6dbbcca-5660-484c-9bd6-b0c9bf990bf4.gif)

stack: Java MVC, MySQL

Infrastructure Design:

![Screenshot 2022-08-24 at 11 48 48 PM](https://user-images.githubusercontent.com/43699421/186493782-2adaf75e-6140-4dbc-a0b1-3f441afb12b2.png)

Used CloudFormation template to automate the provisioning of infrastructure - labvpc.template

AWS BeanStalk application

![beanstalk-ref](https://user-images.githubusercontent.com/43699421/186491221-bc1fe522-dea6-407b-9e2a-5859805f4a22.gif)

design: AWS BeanStalk with Tomcat 9.0; High Availablity - ELB, Multi-AZ; RDS - MySQL; 
