package microservices.model;

public class TripSearchPayload {

	private String city;
	
	public TripSearchPayload()
	{
		
	}
	
	public TripSearchPayload(String city)
	{
		this.city = city;
	}
	
	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}
	
}
