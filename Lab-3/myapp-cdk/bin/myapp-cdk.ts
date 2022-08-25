#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { MyappCdkStack} from '../lib/myapp-cdk-stack';

const app = new cdk.App();
new MyappCdkStack(app, 'MyappCdkStack', {
synthesizer: new DefaultStackSynthesizer({
    qualifier: 'cdk8487',

    // Name of the ECR repository for Docker image assets
    imageAssetsRepositoryName: 'cdk-staging-assets-repository',
    
    lookupRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/CDK-LabStack-Lookup-Role',
    
    fileAssetsBucketName: 'cdk-staging-bucket-${AWS::AccountId}-${AWS::Region}',

    // ARN of the role assumed by the CLI and Pipeline to deploy here
    deployRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/CDK-LabStack-Deploy-Role',
    deployRoleExternalId: '',

    // ARN of the role used for file asset publishing (assumed from the deploy role)
    fileAssetPublishingRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/CDK-LabStack-File-Publishing-Role',
    fileAssetPublishingExternalId: '',

    // ARN of the role used for Docker asset publishing (assumed from the deploy role)
    imageAssetPublishingRoleArn: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/CDK-LabStack-Image-Publishing-Role',
    imageAssetPublishingExternalId: '',

    // ARN of the role passed to CloudFormation to execute the deployments
    cloudFormationExecutionRole: 'arn:${AWS::Partition}:iam::${AWS::AccountId}:role/CDK-LabStack-CFN-Execution-Role',

    // Name of the SSM parameter which describes the bootstrap stack version number
    bootstrapStackVersionSsmParameter: '/cdk-bootstrap/${Qualifier}/version',

    // Add a rule to every template which verifies the required bootstrap stack version
    generateBootstrapVersionRule: true,
    }),
});


