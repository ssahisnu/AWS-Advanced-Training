<h3>Overview</h3>
Develop and deploy a cloud application using the Cloud Development Kit (CDK).
With the CDK, you will leverage Amazon Rekognition to identify human faces within images that you upload to an S3 bucket.
The components of this application will be defined in a series of Step Functions that is provisioned by the CDK.
All application development will be done within an AWS Cloud9 IDE.

</br></br>
Find in repo: Typescript init project created using <strong>cdk init -l typescript</strong>

<ul>
<li>
<p>A hidden <strong>.git</strong> subdirectory and a hidden <strong>.gitignore</strong> file, which makes the project compatible with source control tools such as Git.</p>
</li>
<li>
<p>A <strong>bin</strong> subdirectory, which includes a <strong>myapp-cdk.ts</strong> file. This file contains the entry point for your AWS CDK app.</p>
</li>
<li>
<p>A <strong>lib</strong> subdirectory, which includes a <strong>myapp-cdk-stack.ts</strong> file. This file contains the code for your AWS CDK stack. This code is described in the next step in this procedure.</p>
</li>
<li>
<p>A <strong>node_modules</strong> subdirectory, which contains supporting code packages that the app and stack can use as needed.</p>
</li>
<li>
<p>A <strong>test</strong> subdirectory, which includes a <strong>myapp-cdk-test.ts</strong> file. This is used for Jest testing.</p>
</li>
<li>
<p>A hidden <strong>.npmignore</strong> file, which lists the types of subdirectories and files that <strong>npm</strong> does not need when it builds the code.</p>
</li>
<li>
<p>A <strong>cdk.json</strong> file, which contains information to make running the <strong>cdk</strong> command easier.</p>
</li>
<li>
<p>A <strong>jest.config.js</strong> file, which is used for Jest testing.</p>
</li>
<li>
<p>A <strong>package-lock.json</strong> file, which contains information that <strong>npm</strong> can use to reduce possible build and run errors.</p>
</li>
<li>
<p>A <strong>package.json</strong> file, which contains information to make running the <strong>npm</strong> command easier and with possibly fewer build and run errors.</p>
</li>
<li>
<p>A <strong>README.md</strong> file, which lists useful commands you can run with <strong>npm</strong> and the AWS CDK.</p>
</li>
<li>
<p>A <strong>tsconfig.json</strong> file, which contains information to make running the <strong>tsc</strong> command easier and with possibly fewer build and run errors.</p>
</li>
</ul>

<h5>Bootstrap the environment in the terminal</h5>
 Stacks that contain assets or large Lambda functions require special dedicated AWS CDK resources to be provisioned. AWS CDK only uses Amazon S3 buckets for this purpose. The 
<strong>cdk bootstrap</strong> command creates the necessary resources for you. You only need to bootstrap if you are deploying a stack that requires dedicated resources.

With CDK V2, By default, CDK now uses a pre-configured bootstrapping template to create the resources required to bootstrap successfully. 
Find the template <strong>customized-bootstrap-template.yaml</strong>

<h5>Subscribe to SNS</h5>
<code>snsTopicARN=$(aws sns list-topics --output text --query 'Topics[*].TopicArn | [0]')</code></br>
<code>aws sns subscribe --topic-arn $snsTopicARN --protocol email --notification-endpoint (YOUR-EMAIL)</code>

<h5>Deploy Application Stack</h5>
<code>cdk deploy</code>
</br></br>
<img src="https://user-images.githubusercontent.com/43699421/186729622-b8eb7578-d74b-4176-aad5-0c97964ca386.png", alt="CLI-Output">

<h5>Test Application</h5>
<code>inputBucketName=$(aws s3api list-buckets --output text --query 'Buckets[?contains(Name, `myappcdkstack-inputbucket`) == `true`] | [0].Name')</code>
</br>
<code>aws s3 cp human.jpg s3://$inputBucketName</code>

<h4>Test Flow</h4>

![highQ-sta](https://user-images.githubusercontent.com/43699421/186732431-81923ea1-04d5-4d71-a2fd-bde9b583d354.gif)


<h4>Resources</h4>
<h4>AWS Cloud Development Kit</h4>
The AWS Cloud Development Kit (AWS CDK) is an open source software development framework to model and provision your cloud application resources using familiar programming languages.
It provides you with high-level components that pre-configure cloud resources with proven defaults, so you can build cloud applications without needing to be an expert.
AWS CDK provisions your resources in a safe, repeatable manner through AWS CloudFormation.
</br>
Learn more: https://aws.amazon.com/cdk/

<h4>AWS Step Functions</h4>
AWS Step Functions makes it easy to coordinate the components of distributed applications as a series of steps in a visual workflow.
You can quickly build and run state machines to run the steps of your application in a reliable and scalable fashion.
</br>
Learn more: https://aws.amazon.com/step-functions/

<h4>AWS Cloud9</h4>
AWS Cloud9 is a cloud-based integrated development environment (IDE) that lets you write, run, and debug your code with just a browser.
It includes a code editor, debugger, and terminal. Cloud9 comes prepackaged with essential tools for popular programming languages,
including JavaScript, Python, PHP, and more, so you don’t need to install files or configure your development machine to start new projects.
</br>
Learn more: https://aws.amazon.com/cloud9/

<h4>AWS Rekognition</h4>
Amazon Rekognition makes it easy to add image and video analysis to your applications.
You just provide an image or video to the Rekognition API, and the service can identify the objects, people, text, scenes, and activities,
as well as detect any inappropriate content. Amazon Rekognition also provides highly accurate facial analysis and facial recognition
on images and video that you provide. You can detect, analyze, and compare faces for a wide variety of user verification,
people counting, and public safety use cases.
</br>
Learn more: https://aws.amazon.com/rekognition/
