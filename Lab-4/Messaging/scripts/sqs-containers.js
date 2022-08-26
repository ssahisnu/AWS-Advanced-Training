// -- note drawing-container.js must be included above this module

/**
 * extends the base point drawing canvas class so that instances send
 * drawn points to the given derived class message handler
 */
 class SXSPublisherDrawingContainer extends EventPublisherDrawingContainer
 {
     constructor(container,
                 configuration,
                 endpointTarget,
                 sqsInstance,
                 statisticsCallback
               )
     {
         super(container, configuration, statisticsCallback);

         var self             = this;

         this.endpointTarget  = endpointTarget;
         this.sqsInstance     = sqsInstance;
         this.arrayPoints     = [];

         this.canvas.node.onmousemove = function(e)
         {
             if(!self.isDrawing)
             {
                 return;
             }

             self.lastMouseMoveTime = e.timeStamp;

             var x = e.pageX - self.offset(this).left;
             var y = e.pageY - self.offset(this).top;

             self.arrayPoints.push({x:x, y:y, timestamp: new Date().getTime(), clear:false});
             window.setTimeout(self.pointQueueIdleDispatch,
                               1,
                               self,
                               self.sqsInstance,
                               self.arrayPoints);
             self.drawPoint(x,y);
             self.statistics.MessagesSent++;
             self.BroadcastStatistics();
         };

         this.canvas.node.onmousedown = function(e)
         {
             self.isDrawing = true;
         };

         this.canvas.node.onmouseup = function(e)
         {
             self.isDrawing = false;
         };

         // send clicks through as a single mouse move
         this.canvas.node.onclick = function(e)
         {
             self.isDrawing = true;
             self.canvas.node.onmousemove(e);
             self.isDrawing = false;
         };
     }

     clearCanvas()
     {
         super.clearCanvas();
         this.arrayPoints = [];
         this.arrayPoints.push({x:0, y:0, timestamp: new Date().getTime(), clear:true});
         window.setTimeout(this.pointQueueIdleDispatch,
                           1,
                           this,
                           this.sqsInstance,
                           this.arrayPoints);
     }

 }

class SQSPublisherDrawingContainer extends SXSPublisherDrawingContainer
{
  /**
   * posts first element in pointQueue array to sqs queue instance,
   * chaining on a tail call to repeat the process (via setTimeout)
   * once a response returns
   */
  pointQueueIdleDispatch(publisher, sqsInstance, pointQueue)
  {

      if(pointQueue.length > 0)
      {
          var point = pointQueue.shift();

          var params = publisher.getMessageParameters(point);

          sqsInstance.sendMessage(params, function(err, data)
                                  {
                                      if(err)
                                      {
                                          console.log(err, err.stack); // an error occurred
                                      }
                                      else
                                      {
                                          // queue up next point dispatch call
                                          window.setTimeout(publisher.pointQueueIdleDispatch,
                                                            1,
                                                            publisher,
                                                            sqsInstance,
                                                            pointQueue);

                                          publisher.statistics.MessagesConfirmed++;
                                          publisher.BroadcastStatistics();

                                      }
                                  });
      }
  }

  purgeQueue()
  {
      var params = { QueueUrl: this.endpointTarget };

      this.sqsInstance.purgeQueue(params, function(err, data)
                                  {
                                      if(err)
                                      {
                                          console.log(err, err.stack);
                                      }
                                      else
                                      {
                                          console.log(data);
                                      }
                                  });
  }

  /**
   * crafts message request block for current queue type
   */
  getMessageParameters(point)
  {
      return {
          MessageBody: JSON.stringify(point),
          QueueUrl: this.endpointTarget
      };
  }
}

class SNSPublisherDrawingContainer extends SXSPublisherDrawingContainer
{
  /**
   * posts first element in pointQueue array to sns instance,
   * chaining on a tail call to repeat the process (via setTimeout)
   * once a response returns
   */
  pointQueueIdleDispatch(publisher, snsInstance, pointQueue)
  {

      if(pointQueue.length > 0)
      {
          var point = pointQueue.shift();

          var params = publisher.getMessageParameters(point);

          /*
          sns.publish(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
          });
          }
          */


          snsInstance.publish(params, function(err, data)
                                  {
                                      if(err)
                                      {
                                          console.log(err, err.stack); // an error occurred
                                      }
                                      else
                                      {
                                          // queue up next point dispatch call
                                          window.setTimeout(publisher.pointQueueIdleDispatch,
                                                            1,
                                                            publisher,
                                                            snsInstance,
                                                            pointQueue);

                                          publisher.statistics.MessagesConfirmed++;
                                          publisher.BroadcastStatistics();

                                      }
                                  });
      }
  }

  getMessageParameters(point)
  {
      return {
          Message: JSON.stringify(point),
          TopicArn: this.endpointTarget
      };
  }
}



/**
 * extend the standard sqs class so that we can customise the send
 * request parameters
 */
class SQSFIFOPublisherDrawingContainer extends SQSPublisherDrawingContainer
{
    constructor(container,
                configuration,
                endpointTarget,
                sqsInstance,
                statisticsCallback
              )
    {
        super(container,
              configuration,
              endpointTarget,
              sqsInstance,
              statisticsCallback
            );
    }

    /**
     * crafts message request block for current queue type - fifo
     * queue needs a couple more params than standard
     */
    getMessageParameters(point)
    {
        return {
            MessageBody: JSON.stringify(point),
            QueueUrl: this.endpointTarget,
            MessageDeduplicationId: JSON.stringify(Date.now()),
            MessageGroupId: this.configuration.SQS.FIFO.GroupId
        };
    }
}

/**
 * extend the basic point drawing canvas so that instances listen for
 * messages on the given SQS instance which are then drawn as points
 */
class SQSSubscriberDrawingContainer extends EventSubscriberDrawingContainer
{
    constructor(container,
                configuration,
                endpointTarget,
                sqsInstance,
                statisticsCallback
              )
    {
        super(container, configuration, statisticsCallback);

        var self = this;
        this.endpointTarget = endpointTarget;
        this.SNSDecodeMode  = false;

        // -- receiver methods

        function processMessages(sqsInstance, messages)
        {
            if(messages.length == 0)
            {
                startWaitOnSQSQueue(sqsInstance);
                return;
            }

            var params =
                {
                    Entries: [],
                    QueueUrl: self.endpointTarget
                };

            var messagesToDeleteThisBatch = 0;

            for(var message in messages)
            {
                var thisMessage = messages[message];
                var jsonMessage;

                // console.log(messages)
                if ( self.SNSDecodeMode )
                {
                  var messageContainer = JSON.parse(thisMessage.Body);
                  jsonMessage = JSON.parse(messageContainer.Message);
                }
                else
                {
                  jsonMessage = JSON.parse(thisMessage.Body);
                }

                messagesToDeleteThisBatch++;

                self.processMessage(jsonMessage);

                params.Entries.push(
                    {
                        Id: thisMessage.MessageId,
                        ReceiptHandle: thisMessage.ReceiptHandle
                    }
                );
            }

            self.BroadcastStatistics();
            sqsInstance.deleteMessageBatch(params, function(err, data)
                                           {
                                               if(err)
                                               {
                                                   console.log("params: " + params);
                                                   console.log(err, err.stack); // an error occurred
                                               }
                                               else
                                               {
                                                  self.statistics.MessagesDeleted += messagesToDeleteThisBatch;
                                                  self.BroadcastStatistics();
                                               }
                                               startWaitOnSQSQueue(sqsInstance);
                                           });

        }

        function doWaitOnSQSQueue(sqsInstance, configuration)
        {
            var params =
                {
                    MaxNumberOfMessages: 10,
                    QueueUrl: self.endpointTarget,
                    VisibilityTimeout: 20,
                    WaitTimeSeconds: 20
                };

            sqsInstance.receiveMessage(params, function(err, data)
                                       {
                                           if(err)
                                           {
                                               console.log("params: " + params);
                                               console.log(err, err.stack);
                                           }
                                           else
                                           {
                                               processMessages(sqsInstance, data.Messages);
                                           }
                                       });
        }

        function startWaitOnSQSQueue(sqsInstance)
        {
            setTimeout(doWaitOnSQSQueue,
                       1,
                       sqsInstance,
                       configuration);
        }

        startWaitOnSQSQueue(sqsInstance);
    }

    setSNSDecodeMode(mode)
    {
        this.SNSDecodeMode = mode;
    }
};
