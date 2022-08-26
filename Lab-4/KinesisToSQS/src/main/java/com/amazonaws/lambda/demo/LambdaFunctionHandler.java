package com.amazonaws.lambda.demo;

import java.awt.geom.AffineTransform;
import java.awt.geom.Point2D;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent.KinesisEventRecord;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.SendMessageBatchRequest;
import com.amazonaws.services.sqs.model.SendMessageBatchRequestEntry;
import com.fasterxml.jackson.databind.ObjectMapper;

public class LambdaFunctionHandler implements RequestHandler<KinesisEvent, Integer> {

    final int MAX_SQS_BATCH_SIZE = 10;

    private AmazonSQS sqs = AmazonSQSClientBuilder.defaultClient();

    @Override
    public Integer handleRequest(KinesisEvent event, Context context) {

        Iterator<KinesisEventRecord> iterator = event.getRecords().iterator();
        AffineTransform transformer = new AffineTransform(1, 0, 0, -1, 0, 400);
        ObjectMapper mapper = new ObjectMapper();
        Point2D dstPoint = new Point2D.Double();
        boolean sendMessagesToSQS = true;

        try
        {
            //
            // Read the SQS Queue Target from the Lambda Environment Variables
            //
            String sqsUrl = System.getenv("TargetSQSUrl");
            if ( sqsUrl == null || sqsUrl.isEmpty() )
            {
                context.getLogger().log("WARNING:: Environment Variable [TargetSQSUrl] is not set. No messages will be sent via SQS");
                sendMessagesToSQS = false;
            }

            while ( iterator.hasNext() )
            {
                int messageCounter = 0;

                // Prepare a batch request to write all the messages we have received in this invocation
                Collection<SendMessageBatchRequestEntry> entries = new ArrayList<SendMessageBatchRequestEntry>();

                while ( iterator.hasNext() && messageCounter++ < MAX_SQS_BATCH_SIZE )
                {
                    String payload = new String(iterator.next().getKinesis().getData().array());
                    context.getLogger().log("Payload: " + payload);
                    DrawPoint transformedPoint = new DrawPoint();

                    try
                    {
                        transformedPoint = mapper.readValue(payload, DrawPoint.class);
                        // Transform the point
                        Point2D srcPoint = new Point2D.Double(transformedPoint.getX(), transformedPoint.getY());

                        transformer.transform(srcPoint, dstPoint);

                        // Update the payload
                        transformedPoint.setX((int)dstPoint.getX());
                        transformedPoint.setY((int)dstPoint.getY());

                        // Add this payload into our batch
                        SendMessageBatchRequestEntry entry = new SendMessageBatchRequestEntry(
                            "msg_" + messageCounter,
                            mapper.writeValueAsString(transformedPoint)
                        );

                        entries.add(entry);
                    }
                    catch (Exception e)
                    {
                        context.getLogger().log("Unable to deserialise " + payload + " as a DrawPoint! " + e.getMessage());
                    }
                }

                if ( sendMessagesToSQS && entries.size() > 0 )
                {
                    // We have reached the end of the records or we have reached the maximum
                    // batch size allowed for SQS, so we need to send our entries
                    context.getLogger().log("Sending batch of " + (messageCounter - 1) + " events to SQS...");

                    SendMessageBatchRequest batch = new SendMessageBatchRequest()
                        .withQueueUrl(sqsUrl);

                    batch.setEntries(entries);

                    // Perform the message sending
                    sqs.sendMessageBatch(batch);
                }
            }
        }
        catch (Exception e)
        {
            context.getLogger().log("EXCEPTION::Aborting Lambda processing");
            context.getLogger().log(e.getStackTrace().toString());
        }

        return event.getRecords().size();
    }

    // Inner class must be marked as static in order for the JSON mapper to deserialize
    private static class DrawPoint {

        private int x;
        private int y;
        private long timestamp;
        private boolean clear;

        public int getX() {
            return x;
        }
        public void setX(int x) {
            this.x = x;
        }
        public int getY() {
            return y;
        }
        public void setY(int y) {
            this.y = y;
        }
        public long getTimestamp() {
            return timestamp;
        }
        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
        public boolean isClear() {
            return clear;
        }
        public void setClear(boolean clear) {
            this.clear = clear;
        }
    }
}
