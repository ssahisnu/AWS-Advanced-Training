package microservices.lambda.test;

import java.io.IOException;
import java.util.List;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import com.amazonaws.services.lambda.runtime.Context;

import microservices.lambda.FlightSpecialsHandler;
import microservices.model.FlightSpecial;
import microservices.model.LambdaResult;

/**
 * A simple test harness for locally invoking your Lambda function handler.
 */
public class LambdaFunctionHandlerTest {

    private static Object input;

    @BeforeClass
    public static void createInput() throws IOException {
        // TODO: set up your sample input object here.
        input = null;
    }

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
    			System.getenv("JDBC_CONNECTION_STRING") != null &&
    			System.getenv("JDBC_CONNECTION_STRING").length() > 0
    		)
		{    	
	        FlightSpecialsHandler handler = new FlightSpecialsHandler();
	        
	        // Can't test on CodeBuild without access to DB/VPC
	        LambdaResult<List<FlightSpecial>> result = handler.handleRequest(input, ctx);
	        if ( !result.isSucceeded() )
	        {
	        	ctx.getLogger().log("Call failed -> [" + result.getErrorCode() + "] " + result.getMessage());
	        }
	         
	        Assert.assertTrue(result.getData().size() > 0);
		}
    	else
    	{
    		ctx.getLogger().log("JDBC_CONNECTION_STRING not defined - skipping test");
    	}
        
    }
}
