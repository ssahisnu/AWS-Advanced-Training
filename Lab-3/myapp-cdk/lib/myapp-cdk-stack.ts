import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';
import * as DefaultStackSynthesizer from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'; 
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as event_sources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Duration } from 'aws-cdk-lib/core';

//CDK PermissionsBoundary
export class PermissionsBoundary implements cdk.IAspect {
  private readonly permissionsBoundaryArn: string;
  constructor(permissionBoundaryArn: string) {
    this.permissionsBoundaryArn = permissionBoundaryArn;
  }
  public visit(node: IConstruct): void {
    if (cdk.CfnResource.isCfnResource(node) && node.cfnResourceType === 'AWS::IAM::Role') {
      node.addPropertyOverride('PermissionsBoundary', this.permissionsBoundaryArn);
    }
  }
}

// The code that defines your stack goes here
// BEGIN TODO:1 Replace SendEmailARN-GOES-HERE with value to the left of these instructions
const myTopicARN = "arn:aws:sns:us-east-2:146982910096:send-email"
// END TODO:1

export class MyappCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   // Add a permission boundary to all IAM roles created by CDK

    // BEGIN TODO:2
    const permissionsBoundaryArn = 'arn:aws:iam::146982910096:policy/boundaryMyappRoleRestrictions';
    // END TODO:2
    Aspects.of(this).add(new PermissionsBoundary(permissionsBoundaryArn));

    // Pre-built roles to be used by Lambda functions.
    // BEGIN TODO:3
    const rekognitionRole = iam.Role.fromRoleArn(this, 'Role', 'arn:aws:iam::146982910096:role/rekognitionRole', {
    mutable: false,
    });

    const s3FunctionRole = iam.Role.fromRoleArn(this, 'Role-1', 'arn:aws:iam::146982910096:role/s3FunctionServiceRole', {
    mutable: false,
    });

    const stateMachineRole = iam.Role.fromRoleArn(this, 'Role-2', 'arn:aws:iam::146982910096:role/StateMachineRole', {
    mutable: false,
    });

    const s3ImageServiceRole = iam.Role.fromRoleArn(this, 'Role-3', 'arn:aws:iam::146982910096:role/s3ImageServiceRole', {
    mutable: false,
    });

    const bucketNotificationHandler = iam.Role.fromRoleArn(this, 'Role-4', 'arn:aws:iam::146982910096:role/BucketNotificationsHandler', {
    mutable: false,
    });
    // END TODO:3
    //END Pre-built Roles

    const rekFn = new lambda.Function(this, 'rekognitionFunction', {
      code: lambda.Code.fromAsset('rekognitionlambda'),
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      role: rekognitionRole
    })



    const humanFn = new lambda.Function(this, 'humanFunction', {
      code: lambda.Code.fromAsset('humanlambda'),
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      //Same permissions as the s3ImageServiceRole so no need to create another role.
      role: s3ImageServiceRole,
      environment: {
        "topicARN": myTopicARN
      },
    })

    const processObject = new tasks.LambdaInvoke(this, 'Process Image', {
        lambdaFunction: (rekFn),
        outputPath: '$.Payload'
    });

    const success = new sfn.Succeed(this, 'We succeeded! Yay!');

    const processHuman = new tasks.LambdaInvoke(this, 'Process Human', {
      lambdaFunction: (humanFn)});

    processHuman.next(success);

    const processOther = new sfn.Pass(this, 'Other Processing');

    processOther.next(success);

    const checkHuman = new sfn.Choice(this, 'Human Found?');
    checkHuman.when(sfn.Condition.stringEquals('$.found', 'human'), processHuman);
    checkHuman.when(sfn.Condition.stringEquals('$.found', 'other'), processOther);

    const definition = processObject
    .next(checkHuman)

    const stm = new sfn.StateMachine(this, 'StateMachine', {
        definition,
        role: stateMachineRole
    });

    const mybucket = "input-bucket"
    const bucket = new s3.Bucket(this, mybucket)

    const stmArn = stm.stateMachineArn

    const s3Fn = new lambda.Function(this, 's3Function', {
      code: lambda.Code.fromAsset('s3lambda'),
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'index.handler',
      role: s3FunctionRole,
      environment: {
        "STEP_ARN": stmArn
      },
    })

    const mybucket1 = "processing-bucket"
    const bucket1 = new s3.Bucket(this, mybucket1)

    s3Fn.addEventSource(new event_sources.S3EventSource(bucket, { events: [ s3.EventType.OBJECT_CREATED ],
      }));

    s3Fn.addToRolePolicy(new iam.PolicyStatement({
      resources: [stmArn],
      actions: ['states:StartExecution'],
      }));
  }
}   // example resource
    // const queue = new sqs.Queue(this, 'MyappCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
