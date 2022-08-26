// -- note drawing-container.js must be included above this module

/**
 * extends the base point drawing canvas class so that instances send
 * drawn points to the given derived class message handler
 */
 class KinesisPublisherDrawingContainer extends EventPublisherDrawingContainer
 {
     constructor(container,
                 configuration,
                 endpointTarget,
                 kinesisInstance,
                 statisticsCallback
               )
     {
         super(container, configuration, statisticsCallback);

         var self             = this;

         this.endpointTarget  = endpointTarget;
         this.kinesisInstance = kinesisInstance;
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
                               self.kinesisInstance,
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
                           this.kinesisInstance,
                           this.arrayPoints);
     }

     pointQueueIdleDispatch(publisher, kinesisInstance, pointQueue)
     {

         if(pointQueue.length > 0)
         {
             var point = pointQueue.shift();

             var params = publisher.getMessageParameters(point);

             kinesisInstance.putRecords(params, function(err, data)
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
                                       kinesisInstance,
                                       pointQueue);

                     publisher.statistics.MessagesConfirmed++;
                     publisher.BroadcastStatistics();

                 }
             });
         }
     }

    /**
     * crafts message request block for current queue type
     */
    getMessageParameters(point)
    {
        return {
          Records: [
          {
            Data: JSON.stringify(point),
            PartitionKey: this.configuration.Kinesis.PartitionKey
          }
        ],
        StreamName: this.endpointTarget
      };
    }
}
