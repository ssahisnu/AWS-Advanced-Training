package microservices.lambda;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.apache.tomcat.jdbc.pool.DataSource;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import microservices.model.FlightSpecial;
import microservices.model.LambdaResult;

public class FlightSpecialsHandler implements RequestHandler<Object, LambdaResult<List<FlightSpecial>>> {

	final String connectionString 	= System.getenv("JDBC_CONNECTION_STRING");
	final String uid 				= System.getenv("JDBC_UID");
	final String pwd 				= System.getenv("JDBC_PWD");
	
	Statement statement;
	ResultSet resultSet;

	@Override
	public LambdaResult<List<FlightSpecial>> handleRequest(Object input, Context context) {
		
		LambdaResult<List<FlightSpecial>> result = new LambdaResult<List<FlightSpecial>>();
		LambdaLogger logger = context.getLogger();
		
		logger.log("Starting " + this.getClass().getName() + " Lambda\n");

		result.setData(new ArrayList<FlightSpecial>());
		
		try {
			
			logger.log("Connecting mysql using " + connectionString +"\n");
			Class.forName("com.mysql.jdbc.Driver");

			DataSource source = new DataSource();
			source.setUrl(connectionString);
			source.setUsername(uid);
			source.setPassword(pwd);
			source.setDriverClassName("com.mysql.jdbc.Driver");
			source.setJdbcInterceptors("com.amazonaws.xray.sql.mysql.TracingInterceptor;");
			
			Connection con = source.getConnection();
			
			logger.log("Connected to mysql\n");
			
			String query = "select * from flightspecial";
			Statement statement = con.createStatement();
			
			logger.log("Executing query...");
			
			resultSet = statement.executeQuery(query);

			logger.log("     done");
			
			while (resultSet.next()) {

				FlightSpecial newItem = new FlightSpecial();
				newItem.setId(resultSet.getInt("id"));
				newItem.setHeader(resultSet.getString("header"));
				newItem.setBody(resultSet.getString("body"));
				newItem.setCost(resultSet.getInt("cost"));
				newItem.setExpiryDate(resultSet.getBigDecimal("expiryDate").longValue());
				
				result.getData().add(newItem);
				
				logger.log(newItem.toString());
			}
			
			result.setSucceeded(true);
			return result;
			
		} catch (SQLException e) {
			result.setSucceeded(false);
			result.setErrorCode(1);
			result.setMessage(e.getMessage());
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			result.setSucceeded(false);
			result.setErrorCode(1);
			result.setMessage(e.getMessage());
			e.printStackTrace();
		}

		return result;
	}

}
