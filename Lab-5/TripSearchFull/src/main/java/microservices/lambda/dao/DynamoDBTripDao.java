// Copyright 2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may
// not use this file except in compliance with the License. A copy of the
// License is located at
//
//	  http://aws.amazon.com/apache2.0/
//
// or in the "license" file accompanying this file. This file is distributed
// on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing
// permissions and limitations under the License.

package microservices.lambda.dao;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;

import microservices.lambda.domain.TripSector;
import microservices.lambda.manager.DynamoDBManager;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import java.util.*;

public class DynamoDBTripDao implements ITripDao {

	private static final Logger log = LogManager.getLogger(DynamoDBTripDao.class);

	private static final DynamoDBMapper mapper = DynamoDBManager.mapper();

	private static volatile DynamoDBTripDao instance;

	private DynamoDBTripDao() {
	}

	public static DynamoDBTripDao instance() {

		if (instance == null) {
			synchronized (DynamoDBTripDao.class) {
				if (instance == null)
					instance = new DynamoDBTripDao();
			}
		}
		return instance;
	}


	@Override
	public List<TripSector> findAllTrips() {
		return mapper.scan(TripSector.class, new DynamoDBScanExpression());
	}

	@Override
	public List<TripSector> findTripsFromCity(String city) {
		Map<String, AttributeValue> eav = new HashMap<>();
		eav.put(":v1", new AttributeValue().withS(city));

		DynamoDBQueryExpression<TripSector> query = new DynamoDBQueryExpression<TripSector>()
				.withIndexName(TripSector.ORIGIN_CITY_INDEX).withConsistentRead(false)
				.withKeyConditionExpression("originCity = :v1").withExpressionAttributeValues(eav);

		return mapper.query(TripSector.class, query);
	}

	@Override
	public List<TripSector> findTripsToCity(String city) {

		Map<String, AttributeValue> eav = new HashMap<>();
		eav.put(":v1", new AttributeValue().withS(city));

		DynamoDBQueryExpression<TripSector> query = new DynamoDBQueryExpression<TripSector>()
				.withIndexName(TripSector.DESTINATION_CITY_INDEX).withConsistentRead(false)
				.withKeyConditionExpression("destinationCity = :v1").withExpressionAttributeValues(eav);

		return mapper.query(TripSector.class, query);

	}
}
