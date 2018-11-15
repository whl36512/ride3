export	class	Usr{
	public	usr_id			:	string	;
	public	first_name		:	string	;
	public	last_name		:	string	;
	public	headline		:	string	;
	public	email			:	string	;
	public	bank_email		:	string	;
	public	member_since	:	Date	;
	public	trips_posted	:	number	;
	public	trips_completed	:	number	;
	public	rating			:	number	;
	public	balance			:	number	;
	public	oauth_id		:	string	;
	public	oauth_host		:	string	;
	public	deposit_id		:	string	;
	public	c_ts			:	Date	;
	public	m_ts			:	Date	;
	public	profile_ind		:	boolean	;

	public	names	=	class	names	{
		static	USR_ID				=	"usr_id"			;
		static	OAUTH_ID			=	"oauth_id"			;
		static	IS_PROFILE_COMPLETE	=	"isProfileComplete"	;
		static	OAUTH_ID_IN_COOKIE	=	"profile.id"		;
		static	LAST_NAME_IN_COOKIE	=	"profile.lastName"	;	
		static	FISRT_NAME_IN_COOKIE=	"profile.firstName"	;	
		static	HEADLINE_IN_COOKIE	=	"profile.headline"	;
	}	;
	public	values	=	class	values	{
		static	PROFILE_COMPLETE	=	"true"	;
		static	EMAIL_PATTERN		
				=	"^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]{1,30}\.){1,4}([a-zA-Z]{2,5})$"	;
	}	;

	constructor	(	{
			usr_id			=	null
		,	first_name		=	null
		,	last_name		=	null
		,	headline		=	null
		,	email			=	null
		,	bank_email		=	null
		,	member_since	=	null
		,	trips_posted	=	null
		,	trips_completed	=	null
		,	rating			=	null
		,	balance			=	null
		,	oauth_id		=	null
		,	oauth_host		=	null
		,	deposit_id		=	null
		,	c_ts			=	null
		,	m_ts			=	null
	}	={}
	)
	{	
		this.usr_id				=usr_id		
		this.first_name			=first_name	
		this.last_name			=last_name		
		this.headline			=headline		
		this.email				=email		
		this.bank_email			=bank_email	
		this.member_since		=member_since	
		this.trips_posted		=trips_posted	
		this.trips_completed	=trips_completed	
		this.rating				=rating		
		this.balance			=balance		
		this.oauth_id			=oauth_id		
		this.oauth_host			=oauth_host	
		this.deposit_id			=deposit_id	
		this.c_ts				=c_ts		
		this.m_ts				=m_ts		
	}
}	
/*
{
	var	isProfileComplete	=	UsrTable.values.PROFILE_IN_COMPLETE
	
	def	isUserProfileComplete	:	Boolean	=	{
	val	isUserProfileComplete	=	(	email,	isProfileComplete	)	match	{
	case	(Some(x),	_)				=>	isProfileComplete=	UsrTable.values.PROFILE_COMPLETE;	true	//profile	complete	if	email	is	present
	case	(_,	UsrTable.values.PROFILE_COMPLETE)	=>	true
	case	_					=>	false
	}
	Logger.debug(s"201807272153	UsrTable.isUserProfileComplete	email=$email	isUserProfileComplete=$isUserProfileComplete	")
	isUserProfileComplete
	}

	def	addToSession(rideResultHead:	RideResultHead)	=	{
	rideResultHead.addSession(List((UsrTable.names.USR_ID		,	usr_id.getOrElse(""))
					,	(UsrTable.names.OAUTH_ID		,	oauth_id.getOrElse(""))
					,	(UsrTable.names.IS_PROFILE_COMPLETE	,	isProfileComplete)
					)
				)
	}

};


	object	

	final	val	fieldNamesFrom3Party	=	Seq(names.OAUTH_ID_IN_COOKIE,	names.LAST_NAME_IN_COOKIE,	names.FISRT_NAME_IN_COOKIE,	names.HEADLINE_IN_COOKIE)
	final	val	usrInSession	=	Seq(names.USR_ID,	names.OAUTH_ID	,	names.IS_PROFILE_COMPLETE	)

	type	T	=	UsrTable
	def	fromJson	(jsValue:	JsValue)	:	Option[T]	=	{
	implicit	val	jsonReads	=	Json.reads[T]
	val	fromJson:	JsResult[T]	=	Json.fromJson[T](jsValue)
	fromJson	match	{
	case	JsSuccess(obj:	T,	path:	JsPath)	=>
	Logger.debug("201807252208	Usr.fromJson	obj=	"	+	obj)
	return	Some(obj)
	case	e:	JsError	=>
	Logger.error("201807250824	Usr.fromJson	"	+	JsError.toJson(e).toString())
	return	None
	}
	}

	def	userFrom3PartyAuth	(request:	RideRequest):	UsrTable	=	{
	val	user	=	request.getCookies(fieldNamesFrom3Party)	match	{
	case	Seq(oauth_id,	last_name,	first_name,	headline)	=>	UsrTable	(oauth_id=oauth_id,	last_name=last_name,	first_name=first_name,	headline=headline);
	case	_						=>	null
	}

	Logger.debug(s"201807161501	userFrom3PartyAuth=$user")
	user;
	}

	def	userFromSession	(request:	RideRequest)	:	UsrTable	=	{
	val	user=	request.getSessionCookies(usrInSession)	match	{
	case	Seq(usr_id,	oauth_id,	isProfileComplete	)	=>	
	val	usr	=	UsrTable	(usr_id=usr_id,	oauth_id=oauth_id);	
	usr.isProfileComplete=isProfileComplete.getOrElse(UsrTable.values.PROFILE_IN_COMPLETE);
	usr
	case	_						=>	null
	}
	
	Logger.debug(s"201807161501	userFromSession=$user")
	user;
	}
	
	def	userFromDb	(userFrom3Party:	UsrTable)(implicit	db:	Database):	UsrTable	=	{
	val	userArray:	JsArray	=
	SQLResult.run1("select	row_to_json(a)	from	funcs.updateusr(in_oauth_id	=>	?	,	in_last_name	=>	?	,	in_first_name	=>	?	,	in_headline	=>	?)	a"
		,	Array(userFrom3Party.oauth_id	,	userFrom3Party.last_name,	userFrom3Party.first_name,	userFrom3Party.headline)
		,	1
	)
	val	userFromDb	=	UsrTable.fromJson((userArray.value)	(0)).get
	Logger.debug("201807280834	UsrTable.userFromDb	=	$userFromDb")
	userFromDb
	}
}




case	class	Trip(p1:	Trip.P1=	Trip.P1(),	p2:Trip.P2	=	Trip.P2())	{

	def	upd(implicit	db:	Database):	Option[Trip]	=	
	{
	val	result:	JsArray	=	SQLResult.run1	(
	"""select	row_to_json(a)
		from	funcs.updatetrip
		(
		trip_id		=>	?
		,	driver_id		=>	?
		,	start_date		=>	?
		,	end_date		=>	?
		,	departure_time	=>	?
		,	start_loc		=>	?
		,	start_display_name	=>	?
		,	start_lat		=>	?
		,	start_lon		=>	?
		,	end_loc		=>	?
		,	end_display_name	=>	?
		,	end_lat		=>	?
		,	end_lon		=>	?
		,	distance		=>	?
		,	price		=>	?
		,	recur_ind		=>	?
		,	status_code		=>	?
		,	description		=>	?
		,	seats		=>	?
		,	day0_ind		=>	?
		,	day1_ind		=>	?
		,	day2_ind		=>	?
		,	day3_ind		=>	?
		,	day4_ind		=>	?
		,	day5_ind		=>	?
		,	day6_ind		=>	?
		)	a
	"""
	,	Array(
		this.p1.trip_id
	,	this.p1.driver_id
	,	this.p1.start_date
	,	this.p1.end_date
	,	this.p1.departure_time
	,	this.p1.start_loc
	,	this.p1.start_display_name
	//,	this.p1.start_lat.map{_.toString}	
	,	this.p1.start_lat
	,	this.p1.start_lon
	,	this.p1.end_loc
	,	this.p1.end_display_name
	,	this.p1.end_lat
	,	this.p1.end_lon
	,	this.p1.distance
	,	this.p1.price
	,	this.p2.recur_ind
	,	this.p1.status_code
	,	this.p1.description
	,	this.p1.seats
	,	this.p2.day0_ind
	,	this.p2.day1_ind
	,	this.p2.day2_ind
	,	this.p2.day3_ind
	,	this.p2.day4_ind
	,	this.p2.day5_ind
	,	this.p2.day6_ind
	)
	,	1
	)
	val	trip	:	Option[Trip]	=	Trip.fromJson((result.value)(0))
	trip
	}
}	

object	Trip
{
	case	class	P1(
	trip_id		:	Option[	String]	=	None
	,	driver_id		:	Option[	String]	=	None
	,	start_date		:	Option[	String]	=	None
	,	end_date		:	Option[	String]	=	None
	,	departure_time	:	Option[	String]	=	None
	,	start_loc		:	Option[	String]	=	None
	,	start_display_name	:	Option[	String]	=	None
	,	start_lat		:	Option[	String]	=	None
	,	start_lon		:	Option[	String]	=	None
	,	end_loc		:	Option[	String]	=	None
	,	end_display_name	:	Option[	String]	=	None
	,	end_lat		:	Option[	String]	=	None
	,	end_lon		:	Option[	String]	=	None
	,	distance		:	Option[	String]	=	None
	,	price		:	Option[	String]	=	None
	,	status_code		:	Option[	String]	=	None
	,	description		:	Option[	String]	=	None
	,	seats		:	Option[	String]	=	None
	)	;
	case	class	P2(
	recur_ind		:	Option[	String]	=	None
	,	day0_ind		:	Option[	String]	=	None
	,	day1_ind		:	Option[	String]	=	None
	,	day2_ind		:	Option[	String]	=	None
	,	day3_ind		:	Option[	String]	=	None
	,	day4_ind		:	Option[	String]	=	None
	,	day5_ind		:	Option[	String]	=	None
	,	day6_ind		:	Option[	String]	=	None
	)	
	object	P1
	{
	type	T	=	Trip.P1	;
	
	def	fromJson	(jsValue:	JsValue)	:	Option[T]	=	{
	implicit	val	jsonReads	=	Json.reads[T]	;
	val	fromJson:	JsResult[T]	=	Json.fromJson[T](jsValue)
	fromJson	match	{
	case	JsSuccess(obj:	T,	path:	JsPath)	=>
		Logger.debug("201807281757	Trip.P1.fromJson	obj=	"	+	obj)
		return	Some(obj)
	case	e:	JsError	=>
		Logger.error("201807281756	Trip.P1.fromJson	"	+	JsError.toJson(e).toString())
		return	None
	}
	}
	}

	object	P2	
	{
	type	T	=	Trip.P2	;
	
	def	fromJson	(jsValue:	JsValue)	:	Option[T]	=	
	{
	implicit	val	jsonReads	=	Json.reads[T]	;
	val	fromJson:	JsResult[T]	=	Json.fromJson[T](jsValue)
	fromJson	match	
	{
	case	JsSuccess(obj:	T,	path:	JsPath)	=>
		Logger.debug("201807281758	Trip.P2.fromJson	obj=	"	+	obj)
		return	Some(obj)
	case	e:	JsError	=>
		Logger.error("201807281759	Trip.P2.fromJson	"	+	JsError.toJson(e).toString())
		return	None
	}
	}
	}

	def	fromJson	(jsValue:	JsValue):	Option[Trip]	=
	{
	val	p1	=	Trip.P1.fromJson(jsValue).getOrElse(null)	;
	val	p2	=	Trip.P2.fromJson(jsValue).getOrElse(null)	;
	(p1,	p2)	match
	{
	case	(null,	null)	=>	None
	case	_		=>	val	trip	=Some(Trip(p1,p2))
				Logger.debug("201807290907	Trip.fromJson	trip=	"	+	trip)
				trip
	}
	}
}
	
case	class	Book	(
	book_id		:	Option[	String]	=	None
	,	trip_id		:	Option[	String]	=	None
	,	rider_id		:	Option[	String]	=	None
	,	trip_date		:	Option[	String]	=	None
	,	price		:	Option[	String]	=	None
	,	money_to_driver	:	Option[	String]	=	None
	,	money_to_rider	:	Option[	String]	=	None
	,	book_status_cd	:	Option[	String]	=	None
	,	rider_score	:	Option[	String]	=	None
	,	driver_score	:	Option[	String]	=	None
	,	rider_comment	:	Option[	String]	=	None
	,	driver_comment	:	Option[	String]	=	None
	,	book_ts		:	Option[	String]	=	None
	,	driver_cancel_ts	:	Option[	String]	=	None
	,	rider_cancel_ts	:	Option[	String]	=	None
	,	finish_ts		:	Option[	String]	=	None
)

case	class	Money_trnx	(
	money_trnx_id		:	Option[	String]	=	None
	,	usr_id		:	Option[	String]	=	None
	,	trnx_type		:	Option[	String]	=	None
	,	requested_amount	:	Option[	String]	=	None
	,	actual_amount		:	Option[	String]	=	None
	,	request_ts		:	Option[	String]	=	None
	,	actual_ts		:	Option[	String]	=	None
	,	bank_email		:	Option[	String]	=	None
	,	reference_no		:	Option[	String]	=	None
	,	cmnt			:	Option[	String]	=	None
)

object	Money_trnx	{
	object	values	{
	final	val	DEPOSIT_EMAIL	=	"deposit@rideshare.beegrove.com"
	final	val	WITHDRAW	=	"W"
	final	val	DEPOSIT	=	"D"
	}
	type	T	=	Money_trnx	;
	
	def	fromJson	(jsValue:	JsValue)	:	Option[T]	=	{
	implicit	val	jsonReads	=	Json.reads[T]	;
	val	fromJson:	JsResult[T]	=	Json.fromJson[T](jsValue)
	fromJson	match	{
	case	JsSuccess(obj:	T,	path:	JsPath)	=>
	Logger.debug("201807292347	Money_trnx.fromJson	obj=	"	+	obj)
	return	Some(obj)
	case	e:	JsError	=>
	Logger.error("201807292346	Money_trnx.fromJson	"	+	JsError.toJson(e).toString())
	return	None
	}
	}
}
*/
