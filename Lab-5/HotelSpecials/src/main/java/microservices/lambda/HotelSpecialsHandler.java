package microservices.lambda;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.apache.tomcat.jdbc.pool.DataSource;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import microservices.model.HotelSpecial;
import microservices.model.LambdaResult;

public class HotelSpecialsHandler implements RequestHandler<Object, LambdaResult<List<HotelSpecial>>> {

	final String connectionString 	= System.getenv("JDBC_CONNECTION_STRING");
	final String uid 				= System.getenv("JDBC_UID");
	final String pwd 				= System.getenv("JDBC_PWD");
	
	Statement statement;
	ResultSet resultSet;

	@Override
	public LambdaResult<List<HotelSpecial>> handleRequest(Object input, Context context) {
		
		LambdaResult<List<HotelSpecial>> result = new LambdaResult<List<HotelSpecial>>();
		LambdaLogger logger = context.getLogger();
		
		logger.log("Starting " + this.getClass().getName() + " Lambda\n");

		result.setData(new ArrayList<HotelSpecial>());
		
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
			
			String query = "select * from hotelspecial";
			Statement statement = con.createStatement();
			
			logger.log("Executing query...");
			
			resultSet = statement.executeQuery(query);

			logger.log("     done");
			
			while (resultSet.next()) {

				HotelSpecial newItem = new HotelSpecial();
				newItem.setId(resultSet.getInt("id"));
				newItem.setHotel(resultSet.getString("hotel"));
				newItem.setDescription(resultSet.getString("description"));
				newItem.setCost(resultSet.getInt("cost"));
				newItem.setLocation(resultSet.getString("location"));
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
