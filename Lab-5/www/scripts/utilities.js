function getApplianceTypeFromNameColonType(nameWithType)
{
    return nameWithType.split(":")[1];
}

function GetArrayElementWithUUIDOrNull(arrayToScan, uuid)
{
    for ( var element in arrayToScan )
    {
        if ( arrayToScan[element].uuid === uuid )
            return arrayToScan[element];
    }

    return null;
}

function util_ConvertMillisToHumanReadable(millis)
{
  var date = new Date(millis);
  var str = '';
  str += date.getUTCDate()-1 + " days, ";
  str += date.getUTCHours() + " hours, ";
  str += date.getUTCMinutes() + " minutes, ";
  str += date.getUTCSeconds() + " seconds, ";
  str += date.getUTCMilliseconds() + " millis";
  return str;
}
