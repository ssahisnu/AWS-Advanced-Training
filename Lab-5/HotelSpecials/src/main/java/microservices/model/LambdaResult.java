package microservices.model;

public class LambdaResult<T> {

	private boolean succeeded;
	private String  message;
	private int 	errorCode;
	private T       data;
	
	public LambdaResult()
	{
		succeeded = false;
		message = "";
		errorCode = 0;		
	}
	
	public boolean isSucceeded() {
		return succeeded;
	}
	public void setSucceeded(boolean succeeded) {
		this.succeeded = succeeded;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public int getErrorCode() {
		return errorCode;
	}
	public void setErrorCode(int errorCode) {
		this.errorCode = errorCode;
	}
	public T getData() {
		return data;
	}
	public void setData(T data) {
		this.data = data;
	}	


}
