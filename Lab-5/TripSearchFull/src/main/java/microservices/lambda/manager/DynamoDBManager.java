// Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may
// not use this file except in compliance with the License. A copy of the
// License is located at
//
//	  http://aws.amazon.com/apache2.0/
//
// or in the "license" file accompanying this file. This file is distributed
// on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing
// permissions and limitations under the License.


package microservices.lambda.manager;


import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig.TableNameOverride;


public class DynamoDBManager {

    private static volatile DynamoDBManager instance;

    private static DynamoDBMapper mapper;

    private DynamoDBManager() {

    		AWSCredentialsProvider credentialsProvider = null;
    		try
    		{    			
    			//
    	        // If we are running on our dev environment following the Lab Guide
    			// then "aws-lab-env" will be defined. Otherwise we fall through to the
    			// Default provider chain behaviour
    			//
    			credentialsProvider = new ProfileCredentialsProvider("aws-lab-env");
    			credentialsProvider.getCredentials();
    		}
    		catch(Exception ex)
    		{
    			credentialsProvider = new DefaultAWSCredentialsProviderChain();
    		}
        
    		//
    		// Construct our DynamoDB client - note the REGION must match your lab region
    		//
    		AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
    				// .withRegion(Regions.US_WEST_2)
    				.withCredentials(credentialsProvider)
    				.build();
    		
    		//
    		// If there is a DDB_TABLENAME_TRIPSECTOR environment variable present
    		// use that as the Table Name, otherwise, use the default as defined
    		// on the TripSector class
    		//
    		String ddbTableNameFromEnvVar = System.getenv("DDB_TABLENAME_TRIPSECTOR");
        	if ( ddbTableNameFromEnvVar != null && !ddbTableNameFromEnvVar.isEmpty() )
        	{    		
        		System.out.println("EnvVar DDB_TABLENAME_TRIPSECTOR detected - overriding DDB TableName to " + ddbTableNameFromEnvVar);
	    		DynamoDBMapperConfig mapperConfig = new DynamoDBMapperConfig
	    				.Builder()
	    				.withTableNameOverride(TableNameOverride.withTableNameReplacement(ddbTableNameFromEnvVar))
	    		        .build();
	    		mapper = new DynamoDBMapper(client, mapperConfig);
        	}
        	else
        	{
        		mapper = new DynamoDBMapper(client);
        	}

    }

    public static DynamoDBManager instance() {

        if (instance == null) {
            synchronized(DynamoDBManager.class) {
                if (instance == null)
                    instance = new DynamoDBManager();
            }
        }

        return instance;
    }

    public static DynamoDBMapper mapper() {

        instance();
        return DynamoDBManager.mapper;
        
    }

}
