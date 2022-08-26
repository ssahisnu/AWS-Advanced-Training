package microservices.lambda;
import com.amazonaws.xray.AWSXRay;
import com.amazonaws.xray.AWSXRayRecorderBuilder;
import com.amazonaws.xray.strategy.ContextMissingStrategy;

public class LambdaHandlerWithXRayBase 
{
	static  
	{
	  AWSXRayRecorderBuilder builder = AWSXRayRecorderBuilder.standard();

	  builder.withContextMissingStrategy(new ContextMissingStrategy() 
	  {		
		@Override
		public void contextMissing(String arg0, Class<? extends RuntimeException> arg1) 
		{ 
			System.out.println("AWS X-ray unavailable - ignoring"); 
		}	  
	  });

	  AWSXRay.setGlobalRecorder(builder.build());
	}
}
