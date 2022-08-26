var config = {

	"Region" : "us-east-1",

	"Cognito" : {
		"IdentityPoolId": "us-east-1:efed6451-757a-42a1-9fd8-c8d755fd368f"
	},

	"SQS" : {
		"Standard" : {
			"QueueUrl" : "https://sqs.us-east-1.amazonaws.com/976041174873/microservices_drawqueue_1"
		},
		"Secondary" : {
			"QueueUrl" : "https://sqs.us-east-1.amazonaws.com/976041174873/microservices_drawqueue_2"
		},
		"Tertiary" : {
			"QueueUrl" : "https://sqs.us-east-1.amazonaws.com/976041174873/microservices_drawqueue_3"
		},
		"FIFO" : {
			"QueueUrl" : "https://sqs.us-east-1.amazonaws.com/976041174873/microservices_drawqueue.fifo",
			"GroupId" : "microservices_sqs_fifo"
		}
	},

	"SNS" : {
		"TopicARN" : "arn:aws:sns:us-east-1:976041174873:microservicesMessageDuplicator"
	},

	"Kinesis" : {
		"StreamName" 		: "microservicesDrawingData",
		"PartitionKey"	: "Partition1"
	},

	"IoT" : {
		"Endpoint" : "a1v6aiimr71fu0-ats.iot.us-east-1.amazonaws.com",
		"Topic" : "microservices/drawingdemo"
	}
}
