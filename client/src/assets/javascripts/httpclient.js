var rideHttpClient = {
	//port : 4210,
	//port : 4201,
	sendRequestWithCallback: function (urlEncoded, method, action, elem, callback)
	{
		// if GET, urlEncoded is empty and action has the full url
		// if POST, urlEncoded is the qury part 
		method = method.toUpperCase() ;
        	console.log("INFO 201807141033 sendRequestWithCallback urlEncoded= <"+urlEncoded+">") ;
        	console.log("INFO 201807141033 sendRequestWithCallback method= "+ method) ;
        	console.log("INFO 201807141033 sendRequestWithCallback action= "+action) ;
        	console.log("INFO 201807141033 sendRequestWithCallback callback= "+callback) ;
        	var xhr = new XMLHttpRequest();

        	xhr.onreadystatechange = function(){ callback(xhr, elem); } ;

        	xhr.open (method, action, true);
		if ( method == "POST"  )
		{
        		console.log("INFO 201807140938 setting POST headers" );
			//xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.setRequestHeader('Content-Type', 'application/json');
			// xhr.setRequestHeader('Content-Length', urlEncoded.length); // Refused to set unsafe header "Content-Length"
		}
        	xhr.send (urlEncoded);
        	console.log("INFO 201807141033 sendRequestWithCallback done");
        	return false;
	} ,

	sendRequestToServerWithCallback: function (data, method, encodedRelativeUrl, elem, callback)
	{
		//disregard method. Always POST
		var root = window.location.protocol + "//"+window.location.hostname + ":"+ window.location.port;
		var url = root + encodedRelativeUrl ;
		return rideHttpClient.sendRequestWithCallback(data, "POST", url, null,  callback);
	},

	httpResponseTextJson: function (httpRequest) {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
                	if (httpRequest.status === 200) {
				var response=httpRequest.responseText;
                        	console.info("201807132315 httpResponseTextJson() response.length=" + response.length );
                        	console.info("201807132315 httpResponseTextJson() response=" + response );
				var responseTextJson=JSON.parse(response) ;
				console.info("201807132315 httpResponseTextJson() responseTextJson=" +  responseTextJson );

				var repsonse_all_header = httpRequest.getAllResponseHeaders();
				console.info("201808161156 httpResponseTextJson() repsonse_all_header=" +  repsonse_all_header );
				//var repsonse_cookie_header = httpRequest.getResponseHeader("Set-Cookie");
				//console.info("201808161156 httpResponseTextJson() repsonse_cookie_header=" +  repsonse_cookie_header );
				return responseTextJson ;
                	}
                	else {
                        	console.log('ERROR 201807102058: return status '+ httpRequest.status + "\n" + httpRequest.responseText.replace(/\s+/g,''));
				return null;
                	}
		}
		return null;
	}
}
