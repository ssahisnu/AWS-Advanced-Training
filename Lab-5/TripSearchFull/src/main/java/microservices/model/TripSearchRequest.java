package microservices.model;

public class TripSearchRequest {

	private TripSearchPayload payload;
	
	public TripSearchRequest()
	{
		
	}

	public TripSearchPayload getPayload() {
		return payload;
	}

	public void setPayload(TripSearchPayload payload) {
		this.payload = payload;
	}
	
	public String getCity(){
		return this.payload.getCity();
	}
	
}
