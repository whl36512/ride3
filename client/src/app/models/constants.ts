export class Constants{
	static GET					= 'GET'				;
	static POST					= 'POST'			;

	static PROFILE				= "profile" 		;
	static JWT					= "jwt"				;
	static SERVER_PORT			= "4210"			;
	//static SERVER_PORT			= "4201"			;

	static GET_USER_URL 		= '/ws/get_user'	;
	static SAVE_USER_URL 		= '/ws/save_user'	;
	static UPD_TRIP_URL 		= '/ws/upd_trip'	;

	static URL_SAVE_USER 		= '/ws/save_user'	;
	static URL_GET_USER 		= '/ws/get_user'	;
	static URL_UPD_USER 		= '/ws/upd_user'	;
	static URL_UPD_TRIP 		= '/ws/upd_trip'	;
	static URL_SEARCH 			= '/ws/search'	;
	static URL_SEARCH_ALL 		= '/ws/search_all'	;
	static URL_SEARCH_REGION 	= '/ws/search_region'	;
	static URL_BOOK 			= '/ws/book'		;
	static URL_ACTIVITY 		= '/ws/activity'	;
	static URL_MYOFFERS 		= '/ws/myoffers'	;
	static URL_MYBOOKING 		= '/ws/mybooking'	;
	static URL_UPD_JOURNEY 		= '/ws/upd_journey'	;
	static URL_CANCEL_BOOKING 	= '/ws/cancel_booking'; // cancel by rider
	static URL_FINISH 			= '/ws/finish'		; 
	static URL_CONFIRM 			= '/ws/confirm'		; 
	static URL_REJECT 			= '/ws/reject'		; // reject or cancel by driver
	static URL_MSGS 			= '/ws/msgs'		; 
	static URL_SAVE_MSG 		= '/ws/save_msg'	; 
	static URL_WITHDRAW	 		= '/ws/withdraw'	; 
	static URL_THIST			= '/ws/thist'		; 
	static URL_WEBS				= 'ws://rideshare.beegrove.com:4202'		; 

	static URL_GOOGLE_MAP		= 'https://www.google.com/maps/dir' ;

	static USER_PAGE 			= 'user'			;
	static TRIP_PAGE 			= 'trip'			;
	static SEARCH_PAGE 			= 'search'			;

	static PAGE_USER			= 'user'			;
	static PAGE_TRIP			= 'trip'			;
	static PAGE_SEARCH			= 'search'			;
	static PAGE_ACTIVITY 		= 'activity'		;
	static PAGE_MYOFFERS 		= 'myoffers'		;
	static PAGE_MYBOOKING 		= 'mybooking'		;
	static PAGE_DEPOSIT			= 'deposit'			;
	static PAGE_WITHDRAW		= 'withdraw'		;
	static PAGE_CONTACT_US		= 'contact_us'		;
	static PAGE_TOU 			= 'tou'				;
	static PAGE_NAV 			= 'nav'				;
	static PAGE_MAP 			= 'map'				;
	static PAGE_THIST 			= 'thist'			;

	static EMAIL_PATTERN 		
		= String.raw`^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]{1,30}\.){1,4}([a-zA-Z]{2,5})$` ;

	static MAX_PRICE 			= 0.2 				;
	static MAX_PRICE_RIDER 		= 0.24 				;
	static MAX_SEATS 			= 6					;
	static MAX_SEARCH_TIGHTNESS = 5				;



	//static ERROR_NO_SESSION 	= {"error": "#201808181958 no session"} 	;
	//static ERROR_NOT_SIGNED_IN 	= {"error": "#201808181957 not signed in"} 	;
	static ERROR_NO_ROUTE 		= 0 					;
	static WARN_NOT_SIGNED_IN 	= 'Your are not signed in, yet'			;

	static KEY_FORM_SEARCH		= 'form_search'		;
	static KEY_FORM_TRIP		= 'form_trip'		;
	static KEY_MYOFFERS			= 'form_myoffers'	;
	static KEY_MYBOOKING		= 'form_mybooking'	;
	static KEY_FORM_ACTIVITY	= 'form_activity'	;
	static KEY_FORM_THIST		= 'form_thist'		;

	static VERSION_FORM_SEARCH	= 2					;
	static VERSION_FORM_TRIP	= 1					;

	// timer is in miliseconds. So need * 1000 when set up timer
	static TIMER_INTERVAL		= 200				; //milisecond
	static MSG_TIMER_WAIT		= 5					; // seconds
	static MSG_NO_ACTIVITY_COUNT_DOWN	= 30		; // close msg window afer n seconds of no activity

	//static ICON_ARROW_UP		= &#xfe3f			;
	static ICON_ARROW_UP		= '\ufe3f'			;
 	//static ICON_ARROW_DOWN		= &#xfe40		;
 	static ICON_ARROW_DOWN		= '\ufe40'			;

 	static EMAIL_DEPOSIT		= 'deposit@beegrove.com' ;

 	static ACTION_FAIL			= 'Action Failed' 	;
 	static OK_UPDATE			= 'Updated' 		;
 	static OK_NO_CHANGE			= 'No Change' 		;

 	static COLOR_RANDOM			= 'random' 			;
 	static COLOR_RANDOM_SAME	= 'random_same' 	;
 	static COLOR_RED			= 'red' 			;
 	static COLOR_GREEN			= 'green' 			;

 	static MSG_KEY_MSG_PANEL	= 'msgKeyMsgPanel' 	;
 	static MSG_KEY_TRIP			= 'msgKeyTrip' 		;
 	static MSG_KEY_PAIR			= 'msgKeyPair' 		;
 	static MSG_KEY_PAGE_OPEN	= 'msgKeyPageOpen' 	;
 	static MSG_KEY_PAGE_CLOSE	= 'msgKeyPageClose' ;
 	static MSG_KEY_MARKER_CLEAR	= 'msgKeyMarkerClear' 		; // clear all markers on the map
 	static MSG_KEY_MARKER_PAIR	= 'msgKeyMarkerPair' 		; // place marker pair on the map
 	static MSG_KEY_MARKER_BOOKS	= 'msgKeyMarkerBooks' 		; 
 	static MSG_KEY_MARKER_BOOK	= 'msgKeyMarkerBook' 		; 
 	static MSG_KEY_MARKER_FIT	= 'msgKeyMarkerFit' 		; // show map fitting the markers
 	static MSG_KEY_SHOW_ACTIVITY_BODY	= 'msgKeyShowActivityBody' 	; // show map fitting the markers
 	static MSG_KEY_MAP_BODY_SHOW	= 'msgKeyShowMapBodyShow' 		; 
 	static MSG_KEY_MAP_BODY_NOSHOW	= 'msgKeyShowMapBodyNoShow' 	; 
 	static MSG_KEY_MAP_LINE		= 'msgKeyMapLine' 	; 
 	static MSG_KEY_GREETING		= 'msgKeyGreeting';

 	static BODY_SHOW			= 'show' 			; 
 	static BODY_NOSHOW			= 'noshow' 			; 

	// if markers overlap, draw subsequent marks at a offset location
 	static MAP_OVERLAP_OFFSET	= 0.00004*5 		;
 	static MAP_LINE_COLOR_REGULAR	= 'blue' 		;
 	static MAP_LINE_COLOR_HIGHLIGHT	= 'red'			;
 	static MAP_LINE_COLOR_RIDER	= 'green'			;
 	static MAP_LINE_WEIGHT_REGULAR	= 1 			;	
 	static MAP_LINE_WEIGHT_HIGHLIGHT= 3 			;	
 	static MAP_VIEWPORT_MARGIN		= 50 			;	

 	static MAP_Z_INDEX_SHOW		= 300 				;	
 	static MAP_Z_INDEX_HIDE		= 100 				;	
 	static MAX_SEARCH_RESULT	= 100 				;	

	constructor (){} 
	static TODAY() { // TODAY is browser local time and is in the form of 2018-09-11
		let utc = new Date();
		let d = new Date(utc.getTime() - utc.getTimezoneOffset() * 60000)
		let s = d.toJSON() ;
		console.debug ( '201810142022 Constants.TODAY()=', s	);

		return s.slice(0,10) ;
	} ; 

	static to_local_time(date : string) : string {
		let since_epoch = Date.parse(date);
		let utc = new Date();
		
		let d = new Date(since_epoch - utc.getTimezoneOffset() * 60000);
		let s = d.toJSON() ;
		return s;
	}

	static up_to_minutes( date: string) : string {
		let local_time = Constants.to_local_time(date);
		return local_time.slice(0,10) + ' ' + local_time.slice(11,16);	
	}

	static elapsed_time ( date: string) : string {
		let since_epoch = Date.parse(date);
		let utc = new Date();
		let minutes = Math.floor(( utc.getTime() -since_epoch + 10000)/60000);
		
		let days = Math.floor(minutes/60/24) ;
		let hours = Math.floor(minutes % (60*24)/60);
		let minutes2 = minutes % (60);
		let elapsed_time='';
		if (days!=0) { elapsed_time = elapsed_time+ days + ' days ago' ; }
		else if (hours!=0) { elapsed_time = elapsed_time+ hours + ' hr ago'; }
		else if (minutes2!=0) { elapsed_time = elapsed_time+ minutes2 + ' min ago';}
		else { elapsed_time= 'now'; }
		return elapsed_time;
	}

	static stringify(json: any) :string {
		return JSON.stringify(json,null,2);
	}
	
	static convert_trip_to_pair(trip: any): any|null {
		if(!trip) return null;
		let pair: any ={} ;
		pair.p1 ={
					loc		: trip.start_loc
				, lat		: trip.start_lat
				, lon		: trip.start_lon
				, display_name	: trip.start_display_name
				//, marker_text	: trip.start_marker_text
				//, icon_type	: trip.start_icon_type
				//, color	 : trip.start_color
			};
		pair.p2 ={
					loc		: trip.end_loc
				, lat		: trip.end_lat
				, lon		: trip.end_lon
				, display_name	: trip.end_display_name
				//, marker_text	: trip.end_marker_text
				//, icon_type	: trip.end_icon_type
				//, color	 : trip.end_color
			};
		return pair;
	}

	static convert_book_to_pair(book: any): any|null {
		if(!book) return null;
		let pair: any = {};
		pair.p1 ={
					loc		: book.pickup_loc
				, lat		: book.pickup_lat
				, lon		: book.pickup_lon
				, display_name	: book.pickup_display_name
				//, marker_text	: book.pickup_marker_text
				//, icon_type	: book.pickup_icon_type
				//, color	 : book.pickup_color
			};
		pair.p2 ={
					loc		: book.dropoff_loc
				, lat		: book.dropoff_lat
				, lon		: book.dropoff_lon
				, display_name	: book.dropoff_display_name
				//, marker_text	: book.dropoff_marker_text
				//, icon_type	: book.dropoff_icon_type
				//, color	 : book.dropoff_color
			};
		return pair;
	}



}

export class C extends Constants {
	constructor (){
		super();
	}
}
