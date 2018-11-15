	// Setup an event listener to make an API call once auth is complete
	// Handle the successful return from the API call
	// Use the API call wrapper to request the member's basic profile data

//https://flaviocopes.com/commonjs/
var ride = {
	onLinkedInLoad: function () {
		IN.Event.on(IN, "auth", ride.getProfileDataOnAuthEvent);
		IN.Event.on(IN, "logout", ride.signoutCallback);
		var auth_status= ride.checkAuth();
		ride.change_gui_show(auth_status);
	},

	onSuccess: function (data) {
		console.log("INFO 201807131656");
		console.log(data);
	}, 

	// Handle an error response from the API call
	onError: function (error) {
		console.log("ERROR 201807131657");
		console.log(error);
	} ,


	getProfileData : function () {
		console.log("INFO 201807131627 getProfileData() enter") ;
		//IN.API.Raw("/people/~").result(onSuccess).error(onError);
		IN.API.Raw("/people/~").result(ride.getProfileDataOnSuccess).error(ride.onError);
		console.log("INFO 201807131627 getProfileData() done") ;

	},

	getProfileDataOnAuthEvent: function (){
		console.info("201808172332 getProfileDataOnAuthEvent()	enter") ;
		ride.getProfileData();
	},

	authorizeCallback:	function (){
		console.info("201808172335 authorizeCallback()	enter") ;
		ride.getProfileData();
	},

	getProfileDataOnSuccess : function (data) {
		console.log("INFO 2017131508 getProfileDataOnSuccess() data=");
		console.log(data);
		var profile = {"first_name": data.firstName
			, "last_name": data.lastName
			, "headline": data.headline
			, "oauth_id": data.id
			, 'siteStandardProfileRequest': data.siteStandardProfileRequest
			, 'sm_link': data.siteStandardProfileRequest.url
		} ;

		var profile_hex = rideCrypt.encrypt(JSON.stringify(profile));
	
		//setCookie("profile", profile_hex, 1 );
		sessionStorage.setItem("profile", profile_hex );

		//var decrypted_profile= rideCrypt.decrypt(getCookie("profile"))
		var decrypted_profile= rideCrypt.decrypt(sessionStorage.getItem("profile"))
		profile = JSON.parse(decrypted_profile);

		console.log("INFO 2017131508 getProfileDataOnSuccess() oauth_id =" + profile.oauth_id);
		console.log("INFO 2017131508 getProfileDataOnSuccess() first_name =" + profile.first_name);
		ride.change_gui_show(true);
		ride.get_session(profile)	;

		//window.location.reload(true);		// use true to reload page from server
	},

	get_session: function(profile)
	{
		var encodedRelativeUrl = "/ws/get_session" ;

		var json_string = JSON.stringify(profile);

		rideHttpClient.sendRequestToServerWithCallback(
			json_string, "POST", encodedRelativeUrl , null, ride.get_session_callback ) ;

	},

	get_session_callback: function (httpRequest, elem)
	{
		console.info("INFO 201808172240 ride.get_session_callback() enter ");
		var	httpResponseTextJson = rideHttpClient.httpResponseTextJson(httpRequest);
		if (httpResponseTextJson != null)	{
			console.info("INFO 201808172242 ride.get_session_callback() about to set jwt cookie ");
			//setCookie("jwt", httpResponseTextJson.jwt) ;
			sessionStorage.setItem('jwt', httpResponseTextJson.jwt);
	
			console.info("INFO 201808172244 ride.get_session_callback() jwt cookie is set");
		}
		else {
			console.info("INFO 201808172247 ride.get_session_callback() httpResponseTextJson is null. jwt cookie cannot be set");
		}
	},

	change_gui_show :function(signed_in)
	{
		return;  //signin signout elements has been removed
		document.getElementById("signin").setAttribute("show", !signed_in);
		document.getElementById("signout").setAttribute("show", signed_in);
	},


	newtrip : function () {
		ride.checkAuth();
		if (getCookie("profile.id") !== "") window.location = '/newtrip';
	},

	checkAuth: function () {
	
		console.debug("201807131928 checkAuth");
		console.debug("201807131928 oauth_id = " + getCookie("oauth_id") );
		if ( !IN.User.isAuthorized() ) {
			ride.clearProfileInCookie() ;	//just in case the cookie still holds the profile
			ride.change_gui_show(false);
			//IN.User.authorize(ride.authorizeCallback, null);
			return false;
		}
		else if ( IN.User.isAuthorized()	) 
		{
			//IN.User.authorize(ride.authorizeCallback, null);
			IN.User.authorize(null, null); // on auth event will trigger getProfileData()
			return true;
		}
		else {
			console.log("INFO 201807131924 Already authed");
			return true;
		}
		return false;
	},

	signin: function () {
		if ( ! ride.checkAuth())	{
			IN.User.authorize(null, null); // on auth event will trigger getProfileData()
		}
	},

	signout: function () {
		//if (	IN.User.isAuthorized() ) {
			//IN.User.logout(ride.signoutCallback, null) ;
			IN.User.logout(null, null) ; //logout event will trigger signoutCallback()
		//}
		//ride.signoutCallback () ; // just double sure that cookies are cleared
	},

	signoutCallback: function () {
		console.log("INFO 201807131556 Signed Out !") ;
		ride.clearProfileInCookie() ;
		ride.change_gui_show(false);
		window.location.replace("/");		// use true to reload page from server
	},

	clearProfileInCookie: function () {
		console.debug("201808161126 clearProfileInCookie()");
		//setCookie("profile", "", -1 ) ;
		//setCookie("jwt", "", -1 ) ;
		//setCookie("ss", "", -1 ) ;	//iron secure session cookie. Not using it
		sessionStorage.removeItem('jwt');
		sessionStorage.removeItem('profile');
	}

};

function setCookie (cname, cvalue, exhours) {
	var d = new Date();
	d.setTime(d.getTime() + (exhours*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie (cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
		c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
		return c.substring(name.length, c.length);
		}
	}
	return "";
}
