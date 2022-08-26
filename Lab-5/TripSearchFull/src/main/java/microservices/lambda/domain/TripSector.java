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


package microservices.lambda.domain;


import java.io.Serializable;
import java.util.Date;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBIndexHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBRangeKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;


@DynamoDBTable(tableName = "CloudAirTripSectors")
public class TripSector implements Serializable {

    private static final long serialVersionUID = -8243145429438016232L;
    public static final String DESTINATION_CITY_INDEX = "destinationCity-index";
    public static final String ORIGIN_CITY_INDEX = "originCity-index";

    @DynamoDBHashKey
    private Long date;
    
    @DynamoDBRangeKey
    @DynamoDBIndexHashKey(globalSecondaryIndexName = ORIGIN_CITY_INDEX)
    private String originCity;

    @DynamoDBIndexHashKey(globalSecondaryIndexName = DESTINATION_CITY_INDEX)
    private String destinationCity;

    private String airline;

    public TripSector() { }

	public String getDestinationCity() {
		return destinationCity;
	}

	public void setDestinationCity(String destinationCity) {
		this.destinationCity = destinationCity;
	}

	public String getOriginCity() {
		return originCity;
	}

	public void setOriginCity(String originCity) {
		this.originCity = originCity;
	}

	public Long getDate() {
		return date;
	}

	public void setDate(Long date) {
		this.date = date;
	}

	public String getAirline() {
		return airline;
	}

	public void setAirline(String airline) {
		this.airline = airline;
	}
	
	@Override	
	public String toString(){
		return new Date(this.date) + " > " + this.originCity + " to " + this.destinationCity + " on " + this.airline;
	}

}
