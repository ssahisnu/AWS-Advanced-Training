package microservices.lambda.test;

import java.io.IOException;
import java.util.List;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import com.amazonaws.services.lambda.runtime.Context;

import microservices.lambda.FindAllTripsHandler;
import microservices.lambda.FindTripsFromCityHandler;
import microservices.lambda.FindTripsToCityHandler;
import microservices.lambda.domain.TripSector;
import microservices.model.LambdaResult;
import microservices.model.TripSearchPayload;
import microservices.model.TripSearchRequest;

/**
 * A simple test harness for locally invoking your Lambda function handler.
 */
public class LambdaFunctionHandlerTest {

    private Context createContext() {
        TestContext ctx = new TestContext();

        // TODO: customize your context here if needed.
        ctx.setFunctionName("Your Function Name");

        return ctx;
    }

    @Test
    public void testLambdaFunctionHandler() {

    	Context ctx = createContext();
    	ctx.getLogger().log("TEST::testLambdaFunctionHandler()");

    	if (
    			System.getenv("DDB_TABLENAME_TRIPSECTOR") != null &&
    			System.getenv("DDB_TABLENAME_TRIPSECTOR").length() > 0
    		)
		{
	        FindAllTripsHandler handler = new FindAllTripsHandler();

	        // Input object is not used for the 'find all' case so we can pass an empty object
	        LambdaResult<List<TripSector>> result = handler.handleRequest(new Object(), ctx);
	        if ( !result.isSucceeded() )
	        {
	        	ctx.getLogger().log("Call failed -> [" + result.getErrorCode() + "] " + result.getMessage());
	        }

	        Assert.assertTrue(result.getData().size() > 0);



	        FindTripsFromCityHandler handlerFromCity = new FindTripsFromCityHandler();

	        TripSearchRequest request = new TripSearchRequest();
	        request.setPayload(new TripSearchPayload("Melbourne"));
	        LambdaResult<List<TripSector>> resultFromCity = handlerFromCity.handleRequest(request, ctx);
	        if ( !result.isSucceeded() )
	        {
	        	ctx.getLogger().log("Call failed -> [" + resultFromCity.getErrorCode() + "] " + resultFromCity.getMessage());
	        }

	        Assert.assertTrue(resultFromCity.getData().size() > 0);


	        FindTripsToCityHandler handlerToCity = new FindTripsToCityHandler();

	        request = new TripSearchRequest();
	        TripSearchPayload payload = new TripSearchPayload("Sydney");
	        request.setPayload(payload);
	        LambdaResult<List<TripSector>> resultToCity = handlerToCity.handleRequest(request, ctx);
	        if ( !result.isSucceeded() )
	        {
	        	ctx.getLogger().log("Call failed -> [" + resultToCity.getErrorCode() + "] " + resultToCity.getMessage());
	        }

	        Assert.assertTrue(resultToCity.getData().size() > 0);

		}
    	else
    	{
    		ctx.getLogger().log("DDB_TABLENAME_TRIPSECTOR not defined - skipping test");
    	}

    }
}
