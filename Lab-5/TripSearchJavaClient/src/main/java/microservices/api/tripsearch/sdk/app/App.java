package microservices.api.tripsearch.sdk.app;

import com.amazonaws.opensdk.config.ConnectionConfiguration;
import com.amazonaws.opensdk.config.TimeoutConfiguration;

import microservices.api.sdk.*;
import microservices.api.sdk.model.GetTripsfromcityCityRequest;
import microservices.api.sdk.model.GetTripsfromcityCityResult;
import microservices.api.sdk.model.TripsFromCityResponse;

public class App 
{
	static final String API_KEY 			= "fOyuAErY6J4ntvzNeYVBl73h9Zm93UhP6xTP0KF2";
	static final String CITY_TO_SEARCH 	= "Melbourne";
	
    public static void main( String[] args )
    {
	    	try
	    	{
	    		TripSearch client = TripSearch.builder()
	    		    .connectionConfiguration(new ConnectionConfiguration()
	    			    .maxConnections(100)
	    			    .connectionMaxIdleMillis(1000))
	    		    .timeoutConfiguration(new TimeoutConfiguration()
	    			    .httpRequestTimeout(10000)
	    			    .totalExecutionTimeout(10000)
	    			    .socketTimeout(2000))
	    		    .apiKey(API_KEY)
	    		    .build();
	    		
	    		
	    		for ( int i=0; i < 100; i++ )
	    		{
	    			try
	    			{
		        		long startTime = System.currentTimeMillis();
			    		GetTripsfromcityCityResult toCityResult = 
			    				client.getTripsfromcityCity(
			    						new GetTripsfromcityCityRequest().city(CITY_TO_SEARCH)
			    						);
			    		
			    		TripsFromCityResponse fromCityResponse = toCityResult.getTripsFromCityResponse();
			    		
			    		long endTime = System.currentTimeMillis();
			    		System.out.println("Got " + fromCityResponse.getData().size() + " items in " + (endTime - startTime) + "ms");
	    			}
	    			catch(Exception ex)
	    			{
	    				System.out.println(ex.getMessage() + " - waiting 1 second...");
	    				Thread.sleep(1000);
	    			}
	    		}
	    	}
	    	catch(Exception ex)
	    	{
	    		System.out.println("EXCEPTION -> " + ex.getMessage());
	    	}
	    	
	    	System.out.println("Done!");
    }
}
