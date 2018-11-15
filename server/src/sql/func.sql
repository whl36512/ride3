\c ride


drop schema if exists funcs cascade;
create schema funcs ;
grant all on schema funcs to ride;
--grant all on all functions in schema funcs to ride;

create type funcs.criteria as
(
			date1					 date
		,	 date2					 date
		,	 p1							location
		,	 p2							location
		,	 rp1						 location				-- rider pickup location
		,	 rp2						 location				-- rider dropoff location
		,	 distance				decimal(8,2)
		,	 departure_time	time
		,	 usr_id					uuid
		,	 driver_id			 uuid
		,	 rider_id				uuid
		,	 trip_id				 uuid
		,	 journey_id			uuid
		,	 book_id				 uuid
		,	 oauth_id				text
		,	 price					 ridemoney
		,	 seats					 integer
		,	 deposit_id			uuid
		,	 actual_amount	 decimal
		,	 reference_no	text
		,	 search_tightness	integer
);


create or replace function funcs.test1( )
	returns book
as
$body$
DECLARE
		book0 RECORD ;
BEGIN
	select * into book0
	from book
	where 1=2
	;
	return book0;
END
$body$
language plpgsql;

create or replace function funcs.json_populate_record(base anyelement, in_text text )
	returns anyelement
as
$body$
-- if input json string has fields with "" value, change their value to null 
-- in order to avoid error when converting empty string to date
	select json_populate_record(base ,regexp_replace(in_text , '": ?""', '":null', 'g')::json) t ;
	--select json_populate_record(base ,regexp_replace(in_text , '": ?"[ \t]*"', '":null', 'g')::json) t ;
$body$
language sql;

create or replace function funcs.calc_cost(price numeric 
					, distance	numeric
					, seats integer
					, is_rider boolean)
	returns numeric
as
$body$
DECLARE
	booking_fee numeric; 
	margin_factor numeric ;
	the_cost numeric ;
BEGIN
	booking_fee:= 0.2	;
	margin_factor := 1.2	;
	
	if is_rider then
		the_cost :=	round(price * distance * seats * 1.2 + seats*booking_fee , 2) ;
	else	
		the_cost :=	round(price * distance * seats	, 2) ;
	end if;

	return the_cost;
END
$body$
language plpgsql;

create or replace function funcs.bearing(in_trip text )
	returns double precision
as
$body$
DECLARE
	lat1	 double precision;
	lat2	 double precision;
	lon1	 double precision;
	lon2	 double precision;
	dLon	 double precision;
	x		 double precision;
	y		 double precision;
	brng	 double precision; -- bearing
	bearing	 integer ; -- bearing
	s0 RECORD ;
BEGIN
		SELECT * into s0 from funcs.json_populate_record(NULL::funcs.criteria, in_trip ) ;
	lat1	:=	(s0.p1).lat/360*2*pi();
	lat2	:=	(s0.p2).lat/360*2*pi();
	lon1	:=	(s0.p1).lon/360*2*pi();
	lon2	:=	(s0.p2).lon/360*2*pi();
	dLon	:=	lon2-lon1;

	y		:=	sin(dLon)* cos(lat2);
	x		:=	cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon);
	brng	:=	atan2(y,x);
	brng	:=	brng * 360 /(2*pi());
	bearing	:=	round(brng*100 + 36000)::integer % 36000;
	bearing	:=	360 - bearing/100.0	; -- counter clockwise

		return bearing;
END
$body$
language plpgsql;

create or replace function funcs.rbearing(in_trip text )
	returns double precision
as
$body$
DECLARE
	lat1	 double precision;
	lat2	 double precision;
	lon1	 double precision;
	lon2	 double precision;
	dLon	 double precision;
	x		 double precision;
	y		 double precision;
	brng	 double precision; -- bearing
	bearing	 integer ; -- bearing
	s0 RECORD ;
	criteria	text;
BEGIN
		SELECT * into s0 from funcs.json_populate_record(NULL::funcs.criteria, in_trip ) ;
	criteria	:=	format ('{"p1":{"lat":%s,"lon":%s},"p2":{"lat":%s,"lon":%s}}'
							, (s0.rp1).lat
							, (s0.rp1).lon
							, (s0.rp2).lat
							, (s0.rp2).lon
					);
	return funcs.bearing(criteria);
	--lat1	:=	(s0.rp1).lat/360*2*pi();
	--lat2	:=	(s0.rp2).lat/360*2*pi();
	--lon1	:=	(s0.rp1).lon/360*2*pi();
	--lon2	:=	(s0.rp2).lon/360*2*pi();
	--dLon	:=	lon2-lon1;
--
	--y		:=	sin(dLon)* cos(lat2);
	--x		:=	cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLon);
	--brng	:=	atan2(y,x);
	--brng	:=	brng * 360 /(2*pi());
	--bearing	:=	round(brng + 360)::integer % 360;
	--bearing	:=	360 - bearing ; -- counter clockwise
--
		--return bearing;
END
$body$
language plpgsql;


create or replace function funcs.get_user( dummy text, in_user text)
	returns usr
as
$body$
DECLARE
	s0 RECORD; 
	s1 RECORD ;
BEGIN
	SELECT * into s0 from funcs.json_populate_record(NULL::usr, in_user) ;
	
	select * into s1 from usr u where u.usr_id=s0.usr_id ;

	return s1;
END
$body$
language plpgsql;

create or replace function funcs.updateusr( data text, in_user text)
	returns usr
as
$body$
DECLARE
	s0 RECORD; 
	u0 RECORD; 
	i1 RECORD ;
	s1 RECORD ;
	u1 RECORD ;
BEGIN
	SELECT * into s0 from funcs.json_populate_record(NULL::usr, data) ;
	SELECT * into u0 from funcs.json_populate_record(NULL::usr, in_user) ;
	
	insert into usr ( oauth_id) 
		select	s0.oauth_id 
		where s0.usr_id is null and s0.oauth_id is not null
	on conflict on constraint uk_usr
	do nothing 
	returning * into i1
	;

	--select * into s1 from usr u where (u.usr_id=u0.usr_id or u.oauth_id=s0.oauth_id) ;

	update usr u
			set first_name			=coalesce(s0.first_name, u.first_name ) 
			, last_name				=coalesce(s0.last_name, u.last_name )
			, headline				=coalesce(s0.headline, u.headline) 
			, email					=coalesce(s0.email, u.email)
			, bank_email			=coalesce(s0.bank_email, u.bank_email)
			--, member_since 		=coalesce(s0.member_since, u.member_since)
			--, trips_posted		=coalesce(s0.trips_posted, u.trips_posted)
			--, trips_completed		=coalesce(s0.trips_completed, u.trips_completed)
			--, rating				=coalesce(s0.rating, u.rating)
			--, balance				=coalesce(s0.balance, u.balance)
			--, oauth_id			=coalesce(s0.oauth_id, u.oauth_id)
			--, oauth_host			=coalesce(s0.oauth_host, u.oauth_host)
			--, deposit_id			=coalesce(s0.deposit_id, u.deposit_id)
			, sm_link			 	=coalesce(s0.sm_link, u.sm_link)
			--, c_ts				=coalesce(s0.c_ts, u.c_ts)
			, m_ts					=coalesce(s0.m_ts, clock_timestamp())
			, profile_ind			=coalesce(s0.profile_ind, u.profile_ind)
	where 	u.usr_id=u0.usr_id 
	or 		u.oauth_id=s0.oauth_id
	returning u.* into u1
	;
				
	return u1;
END
$body$
language plpgsql;



create or replace function funcs.validate_trip( in_trip text)
	returns boolean
as
$body$
DECLARE
	c0 funcs.criteria ;
	t0 trip ;
BEGIN
	SELECT * into c0	FROM funcs.json_populate_record(NULL::funcs.criteria	, in_trip) ;
	SELECT * into t0	FROM funcs.json_populate_record(NULL::trip				, in_trip) ;
	--in_trip has both dat1, date 2 and start_date , end_date
	
	if t0.distance			<=	0					then return false; end if;
	if (c0.p1).lat			is null					then return false; end if;
	if (c0.p1).lon			is null					then return false; end if;
	if (c0.p1).display_name	is null					then return false; end if;
	if (c0.p2).lat			is null					then return false; end if;
	if (c0.p2).lon			is null					then return false; end if;
	if (c0.p2).display_name	is null					then return false; end if;
	if t0.departure_time	is null					then return false; end if;
	if t0.price				is null					then return false; end if;
	if t0.price				<	0 					then return false; end if;
	if t0.price				>	0.20 				then return false; end if;
	if t0.seats				is null					then return false; end if;
	if t0.seats				<	1 					then return false; end if;
	if t0.seats				>	6 					then return false; end if;
	if c0.date1 			is null					then return false; end if;
	if c0.date1 			< now()::date -1		then return false; end if;
	if t0.recur_ind 		is null					then return false; end if;
	if t0.day0_ind	 		is null					then return false; end if;
	if t0.day1_ind	 		is null					then return false; end if;
	if t0.day2_ind	 		is null					then return false; end if;
	if t0.day3_ind	 		is null					then return false; end if;
	if t0.day4_ind	 		is null					then return false; end if;
	if t0.day5_ind	 		is null					then return false; end if;
	if t0.day6_ind	 		is null					then return false; end if;
	if t0.recur_ind	and c0.date2 is null			then return false; end if;
	if t0.recur_ind	and c0.date2 <= c0.date1		then return false; end if;
	if t0.recur_ind	and c0.date2 > 	c0.date1+ 92	then return false; end if;
	if t0.recur_ind and not t0.day0_ind and not t0.day1_ind and not t0.day2_ind 
					and not t0.day3_ind and not t0.day4_ind and not t0.day5_ind 
					and not t0.day6_ind 
	then return false;
	end if;

	return true;
END
$body$
language plpgsql;

create or replace function funcs.ins_trip( in_trip text, in_user text)
	returns trip
as
$body$
DECLARE
	t0 trip ;
	u0 RECORD ;
	i1 RECORD ;
	t1 RECORD ;
	valid boolean;
	dummy RECORD;
BEGIN
	SELECT * into t0	FROM funcs.json_populate_record(NULL::trip, in_trip) ;
	SELECT * into u0	FROM funcs.json_populate_record(NULL::usr , in_user) ;

	valid			:=	funcs.validate_trip(in_trip) ;
	if (not valid)	then return NULL::trip; end if;

	t0.driver_id	:=	u0.usr_id;
	t0.dir 			:=	funcs.bearing(in_trip);
	t0.trip_id		:=	uuid_generate_v4();
	t0.status_code	:=	'A' ;
	t0.c_ts			:=	clock_timestamp();
	t0.m_ts			:=	clock_timestamp();

	insert into trip values( t0.*) returning * into t1 ;

	if t1.recur_ind = true then
		select * from funcs.create_journey(t1.trip_id) into dummy;
	else
		insert into journey (trip_id, journey_date, departure_time, j_epoch, seats, price)
		select 	trip1.trip_id
			, t1.start_date
			, t1.departure_time
			, extract(epoch from (t1.start_date + t1.departure_time ) )
			, t1.seats
			, t1.price
		;
	end if ;

		return t1;
END
$body$
language plpgsql;

create or replace function funcs.create_journey( in_trip_id sys_id)
returns void 
as
$body$
	with dates as (
		SELECT d::date, extract(dow from d::date) dow
		FROM 	generate_series(
				(select start_date from trip where trip_id=in_trip_id::uuid) ,
				(select end_date	 from trip where trip_id=in_trip_id::uuid) ,
				'1 day'
			) AS gs(d)
	)
	insert into journey (trip_id, journey_date, departure_time, j_epoch, seats, price)
	select 	t.trip_id
		, dates.d				
		, t.departure_time
		, extract(epoch from (dates.d + departure_time ) )
		, t.seats
		, t.price
	from trip t , dates 
	where t.trip_id=in_trip_id::uuid
	and 	(		dates.dow=0 and t.day0_ind = true
		or	 dates.dow=1 and t.day1_ind = true
		or	 dates.dow=2 and t.day2_ind = true
		or	 dates.dow=3 and t.day3_ind = true
		or	 dates.dow=4 and t.day4_ind = true
		or	 dates.dow=5 and t.day5_ind = true
		or	 dates.dow=6 and t.day6_ind = true
		)
	;
$body$
language sql;

create or replace function funcs.upd_journey( in_journey text, in_dummy text)
	returns journey
as
$body$
DECLARE
	journey0 RECORD ;
	journey1 RECORD ;
BEGIN
	SELECT * into journey0 FROM funcs.json_populate_record(NULL::journey , in_journey) ;

	update journey j
	set seats = least(coalesce (journey0.seats, j.seats), 6)
		, price = coalesce (journey0.price, j.price)
	where j.journey_id=journey0.journey_id
	and (j.seats != journey0.seats or j.price!= journey0.price)
	returning * into journey1
	;

	return journey1;
END
$body$
language plpgsql;

create or replace function funcs.cancel_booking( in_book text, in_user text)
	returns book
-- cancel by rider
as
$body$
DECLARE
	user0 RECORD ;
	book0 RECORD ;
	book1 RECORD ;
	ids	RECORD ;
	journey1 RECORD ;
	rider_id1 uuid;
	jsonrow json;
BEGIN
	SELECT * into book0 FROM funcs.json_populate_record(NULL::book 	, in_book)	;
	SELECT * into user0 FROM funcs.json_populate_record(NULL::usr 	, in_user) ; 

	select b.rider_id into rider_id1
	from book b
	where 	b.book_id = book0.book_id
	and 	b.rider_id = user0.usr_id
	;

	select b.book_id, j.journey_id, t.trip_id, t.driver_id, b.rider_id
	into ids
	from book b
	join journey j 	on ( j.journey_id = b.journey_id)
	join trip t 	on ( t.trip_id = j.trip_id )
	join usr u	on ( u.usr_id=t.driver_id )
	where 	b.book_id	= book0.book_id
	and	b.status_cd 	in ('P', 'B')	
	and	b.rider_id	= user0.usr_id
	;

	
	update book b
	set 	status_cd 		= 'R'
		, penalty_to_rider 	= case when b.status_cd = 'B' 
						then round(b.rider_cost * 0.2 ,2)
						when status_cd = 'P'
						then 0
						end
			, m_ts			= clock_timestamp()
			, rider_cancel_ts 	= clock_timestamp()
	where 	b.book_id=ids.book_id
	returning * into book1
	;

	update journey j	-- return seats to journey
	set seats = least ( seats + book1.seats, 6 ) -- make sure the max seats is 6
	where	j.journey_id = book1.journey_id
	-- and	j.status_code = 'A'			 -- only when the journey is active
	returning * into journey1
	;

	-- return money to rider and apply penalty to rider
	insert into money_trnx ( 
			usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	select 
		 book1.rider_id
		, 'R'
		, book1.rider_cost
		, clock_timestamp()
		, book1.book_id
	;

	insert into money_trnx ( 
			usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	select 
		 book1.rider_id
		, 'P'
		, - book1.penalty_to_rider
		, clock_timestamp()
		, book1.book_id
	where book1.penalty_to_rider > 0
	;

	update usr u
	set balance = 	balance 
			+ book1.rider_cost 
			- book1.penalty_to_rider 
	where	u.usr_id = book1.rider_id
	;

	return book1;
END
$body$
language plpgsql;

create or replace function funcs.reject( in_book text, in_user text)
	returns book
-- reject or cancel by driver 
as
$body$
DECLARE
	user0 RECORD ;
	book0 RECORD ;
	book1 RECORD ;
	ids		RECORD ;
	rider_id1 uuid;
	journey1 RECORD ;
	jsonrow json;
BEGIN
	SELECT * into book0 FROM funcs.json_populate_record(NULL::book , in_book) ;
	SELECT * into user0 FROM funcs.json_populate_record(NULL::usr , in_user) ;

	select b.book_id, j.journey_id, t.trip_id, t.driver_id, b.rider_id
	into ids
	from book b
	join journey j 	on ( j.journey_id = b.journey_id)
	join trip t 	on ( t.trip_id = j.trip_id and t.driver_id=user0.usr_id)
	join usr u	on ( u.usr_id=t.driver_id )
	where 	b.book_id	= book0.book_id
	and	b.status_cd 	in ('P', 'B')	
	;

	update book b
	set 	status_cd 		= case when b.status_cd='P' then 'J'
						when b.status_cd='B' then 'D'
						end
		, penalty_to_driver 	= 
			case when b.status_cd = 'B' 
				then round(b.driver_cost * 0.5 , 2)
				when b.status_cd = 'P'
				then 0
			end
			, m_ts			= clock_timestamp()
			, driver_cancel_ts 	= clock_timestamp()
	where 	b.book_id = ids.book_id
	returning * into book1
	;


	-- apply penalty to driver 
	insert into money_trnx ( 
			usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	select 
		 ids.driver_id
		, 'P'
		, - book1.penalty_to_driver
		, clock_timestamp()
		, book1.book_id
	where book1.penalty_to_driver >0
	;
		
	update usr u
	set 	balance = u.balance - book1.penalty_to_driver
	where	u.usr_id	= ids.driver_id
	and		book1.book_id is not null -- make sure update happened
	;
	
	update journey j	-- return seats to journey
	set seats = least ( j.seats + book1.seats, 6 ) -- make sure the max seats is 6
	where	j.journey_id = book1.journey_id
	-- and	j.status_code = 'A'			 -- only when the journey is active
	returning * into journey1
	;

	-- return money to rider 
	insert into money_trnx ( 
			usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	select 
		 book1.rider_id
		, 'R'
		, book1.rider_cost
		, clock_timestamp()
		, book1.book_id
	;

	update usr u
	set balance = 	balance 
			+ book1.rider_cost 
			-- - book1.penalty_to_rider 
	where	u.usr_id = book1.rider_id
	;

	return book1;
END
$body$
language plpgsql;

create or replace function funcs.confirm( in_book text, in_user text)
	returns book
-- mark the booking is complete to the satisfaction of rider
as
$body$
DECLARE
	user0 RECORD ;
	book0 RECORD ;
	book1 RECORD ;
BEGIN
	SELECT * into book0 FROM funcs.json_populate_record(NULL::book 	, in_book) ;
	SELECT * into user0 FROM funcs.json_populate_record(NULL::usr 	, in_user) ;

	update book b
	set 	status_cd 	= 'B'
			, m_ts		= clock_timestamp()
	from journey j, trip t
	where 	b.book_id	= book0.book_id
	and	j.journey_id	= b.journey_id
	and	t.trip_id	= j.trip_id
	--and 	t.driver_id 	= user0.usr_id	--double sure to defeat hacking
	and	b.status_cd	= 'P'		-- make sure the booking is pending confirmation
	returning b.* into book1
	;

	return book1;
END
$body$
language plpgsql;

create or replace function funcs.finish( in_book text, in_user text)
	returns book
-- mark the booking is complete to the satisfaction of rider
as
$body$
DECLARE
	user0 RECORD ;
	book0 RECORD ;
	book1 RECORD ;
	journey1 RECORD ;
	rider_id1 uuid;
	jsonrow json;
	ids 	RECORD;
BEGIN
	SELECT * into book0 FROM funcs.json_populate_record(NULL::book , in_book) ;
	SELECT * into user0 FROM funcs.json_populate_record(NULL::usr , in_user) ;

	update book b
	set 	status_cd 	= 'F'
			, m_ts		= clock_timestamp()
			, finish_ts	= clock_timestamp()
	where 	b.book_id	=book0.book_id
	and 	b.rider_id 	= user0.usr_id	--double sure to defeat hacking
	and	b.status_cd	='B'		-- make sure the booking is active
	returning * into book1
	;

	update usr 
	set trips_completed = trips_completed+1
	where usr_id=book1.rider_id
	;

	select t.trip_id, j.journey_id	, t.driver_id
	into ids
	from journey j
	join trip t on (t.trip_id=j.trip_id)
	where j.journey_id = book1.journey_id
	;
	

	-- assign money to driver
	insert into money_trnx ( 
			usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	values (ids.driver_id
		, 'F'
		, book1.driver_cost
		, clock_timestamp()
		, book1.book_id
		)
	;

	update usr u
	set balance = 	balance + book1.driver_cost 
	where	u.usr_id 	= ids.driver_id
	;

	return book1;
END
$body$
language plpgsql;

create or replace function funcs.search( in_trip text, in_user text)
	returns setof json
as
$body$
-- if input json string has fields with "" value, change their value to null in order to avoid error when converting empty string to date
	with trip0 as (
		SELECT t.*
			, t.distance/600.0 degree10	-- one tenth of the distance, in degree
			, start_lat	+ (start_lat	- end_lat) 	*0.05 adjusted_start_lat 
			, start_lon	+ (start_lon	- end_lon) 	*0.05 adjusted_start_lon 
			, end_lat	+ (end_lat	- start_lat) 	*0.05 adjusted_end_lat 
			, end_lon	+ (end_lon	- start_lon) 	*0.05 adjusted_end_lon 
		FROM funcs.json_populate_record(NULL::trip , in_trip) t
		where 	t.distance is not null -- make sure the distance is already found at client side
		and	t.distance > 0 -- make sure the distance is already found at client side
	)
	, user0	as ( 
		-- if usr_id is null, populated it with random uuid
		SELECT coalesce(t.usr_id, uuid_generate_v4()) usr_id	
		FROM funcs.json_populate_record(NULL::usr , in_user) t 
	)
	, a as (
		select t.start_display_name, t.end_display_name 
			, t.start_lat
			, t.start_lon
			, t.end_lat
			, t.end_lon
			--, t.distance 
			, t.description
			, t.driver_id				
			, j.journey_id				
 			, j.trip_id				 
 			, j.journey_date		
 			, j.departure_time	
		--	, u.balance
			, trip0.seats
			, funcs.calc_cost(j.price, trip0.distance , trip0.seats , true) rider_cost
			, coalesce (b.seats,0) seats_booked
			, case when u.balance >=	funcs.calc_cost(j.price , trip0.distance , trip0.seats , true)
				then true else false 
				end sufficient_balance
			--, ut.sm_link
			, ut.headline
		from trip0
		join user0 on (1=1)	-- usr0 may not ba available because of not signed in
		join trip t on	(
		 	t.start_lat	between trip0.adjusted_start_lat-trip0.degree10 	
				and 	trip0.adjusted_start_lat+trip0.degree10
			and t.start_lon	between trip0.adjusted_start_lon-trip0.degree10	
				and 	trip0.adjusted_start_lon+trip0.degree10
			and t.end_lat		between trip0.adjusted_end_lat-trip0.degree10 	
				and 	trip0.adjusted_end_lat+trip0.degree10
			and t.end_lon		between trip0.adjusted_end_lon-trip0.degree10
				and 	trip0.adjusted_end_lon+trip0.degree10
			and t.status_code 	= 	'A'
			and t.driver_id 	!= 	user0.usr_id
		)
		join usr 	ut on (ut.usr_id=t.driver_id) -- to get driver sm_link
		join journey 	j	on (
			j.trip_id=t.trip_id
			and	 j.journey_date	between trip0.start_date 
						and coalesce ( trip0.end_date, '3000-01-01')
			and j.status_code='A'
			and j.price <= trip0.price/1.2
			and j.seats >= trip0.seats
		)
		--left outer join user0 on (1=1)	-- usr0 may not ba available because of not signed in
		left outer join usr u on (u.usr_id= user0.usr_id) -- to get bookings
		left outer join book b on (b.rider_id = user0.usr_id 
						and b.journey_id=j.journey_id
						and b.status_cd in ('P', 'B')
					)
		--where t.start_lat	between trip0.adjusted_start_lat-trip0.degree10 	
					--and 	trip0.adjusted_start_lat+trip0.degree10
		--and	 t.start_lon	between trip0.adjusted_start_lon-trip0.degree10	
					--and 	trip0.adjusted_start_lon+trip0.degree10
		--and	 t.end_lat		between trip0.adjusted_end_lat-trip0.degree10 		
					--and 	trip0.adjusted_end_lat+trip0.degree10
		--and	 t.end_lon		between trip0.adjusted_end_lon-trip0.degree10		
					--and 	trip0.adjusted_end_lon+trip0.degree10
		--and	 j.journey_date	between trip0.start_date and coalesce ( trip0.end_date, '3000-01-01')
		where	 ( trip0.departure_time is null	
			or j.departure_time between trip0.departure_time - interval '1 hour' 
									and trip0.departure_time + interval '1 hour'
		)
		--and j.price <= trip0.price/1.2
		--and j.seats >= trip0.seats
		--and j.status_code='A'
		--where t.driver_id != user0.usr_id
	)
	select row_to_json(a) 
	from a
	order by a.journey_date, a.departure_time
	;
$body$
language sql;

create or replace function funcs.search_all( dummy text, in_user text)
	returns setof json
as
$body$
	with user0	as ( 
		-- if usr_id is null, populated it with random uuid
		SELECT coalesce(t.usr_id, uuid_generate_v4()) usr_id	
		FROM funcs.json_populate_record(NULL::usr , in_user) t 
	)
	, a as (
		select t.start_display_name, t.end_display_name 
			, t.start_lat
			, t.start_lon
			, t.end_lat
			, t.end_lon
			--, t.distance 
			, t.description
			, t.driver_id				
			, j.journey_id				
 			, j.trip_id				 
 			, j.journey_date		
 			, j.departure_time	
		--	, u.balance
			, j.seats
			, funcs.calc_cost(j.price, t.distance , 1 , true) || ' per seat' rider_cost
			, coalesce (b.seats,0) seats_booked
			, case when u.balance >=	funcs.calc_cost(j.price , t.distance	, 1 , true)
				then true else false 
				end sufficient_balance
			--, ut.sm_link
			, ut.headline
		from journey j
		join user0 on (1=1)	-- usr0 may not ba available because of not signed in
		join trip t on	( t.trip_id	=	j.trip_id
				and t.driver_id	!= 	user0.usr_id
		)
		join usr 	ut on (ut.usr_id=t.driver_id) -- to get driver sm_link
		left outer join usr u on (u.usr_id= user0.usr_id) -- to get bookings
		left outer join book b on (	b.rider_id = user0.usr_id
						and b.journey_id=j.journey_id
						and b.status_cd in ('P', 'B')
					)
		where j.journey_date between now()::date and (now()::date + 10) 
		and j.status_code='A'
		and j.seats>0
		order by j.journey_date , j.departure_time
		limit 100
	)
	select row_to_json(a) 
	from a
	order by a.journey_date, a.departure_time
	;
$body$
language sql;

create or replace function funcs.search_region( in_criteria text, in_user text)
	returns setof json
as
$body$
	with user0	as ( 
		-- if usr_id is null, populated it with random uuid
		SELECT coalesce(t.usr_id, uuid_generate_v4()) usr_id	
		FROM funcs.json_populate_record(NULL::usr , in_user) t 
	)
	, c0 as (
		-- bounding box
		SELECT		
				least		((t.p1).lat, (t.p2).lat) p1_lat	
			, greatest((t.p1).lat, (t.p2).lat) p2_lat	
			, least		((t.p1).lon, (t.p2).lon) p1_lon
			, greatest((t.p1).lon, (t.p2).lon) p2_lon	
			, coalesce(t.seats		, 1)				 seats
			, coalesce(t.price		, 0.24)/1.2			max_driver_price
			, funcs.rbearing(in_criteria)- 43+4*search_tightness		min_rdir
			, funcs.rbearing(in_criteria)+ 43-4*search_tightness 		max_rdir
			, funcs.rbearing(in_criteria)- 43+4*search_tightness + 360	min_rdir_360
			, funcs.rbearing(in_criteria)+ 43-4*search_tightness + 360	max_rdir_360
			, funcs.rbearing(in_criteria)- 43+4*search_tightness - 360	min_rdir_360_1
			, funcs.rbearing(in_criteria)+ 43-4*search_tightness - 360	max_rdir_360_1
			-- bigger the angle, narrower the sector
			, sin((funcs.rbearing(in_criteria)-39-4*search_tightness)/360*2*pi())		sin_rdir_1 
			, cos((funcs.rbearing(in_criteria)-39-4*search_tightness)/360*2*pi())		cos_rdir_1
			, sin((funcs.rbearing(in_criteria)+39+4*search_tightness)/360*2*pi())		sin_rdir_2
			, cos((funcs.rbearing(in_criteria)+39+4*search_tightness)/360*2*pi())		cos_rdir_2
			, t.rp1
			, t.rp2
			, t.date1
			, t.date2
			, time '0:0' 
				+ greatest (0		, extract (epoch from	coalesce(t.departure_time, time '00:00' ))
								- t.distance/60*3600+3600) * interval '1 second' time1
			, time '0:0' 
				+ least (3600*24-1 	, extract (epoch from	coalesce(t.departure_time, time '23:59' ))
								+ t.distance/60*3600+3600) * interval '1 second' time2
			, t.distance 
			, t.distance /(3-0.2*search_tightness)		min_distance
			, t.distance *(4-0.2*search_tightness)								max_distance
			, 1.0/60*(0.1+0.05*search_tightness)		axes_move
		FROM funcs.json_populate_record(NULL::funcs.criteria , in_criteria) t 
	)
	, a as (
		select t.start_display_name, t.end_display_name 
			, t.start_lat
			, t.start_lon
			, t.end_lat
			, t.end_lon
			--, t.distance 
			, t.description
			, t.driver_id				
			, j.journey_id				
 			, j.trip_id				 
 			, j.journey_date		
 			, j.departure_time	
		--	, u.balance
			, j.seats
			, funcs.calc_cost(j.price, c0.distance , c0.seats , true) rider_cost
			, j.price*1.2 || ' per mile' rider_price
			, coalesce (b.seats,0) seats_booked
			, case when u.balance >=	funcs.calc_cost(j.price ,t.distance	,c0.seats , true)
				then true else false 
				end sufficient_balance
			, case when ut.profile_ind then ut.sm_link else null end sm_link
			, ut.headline
			, c0.rp1
			, c0.rp2
		from journey j
		join user0 on (1=1)	-- usr0 may not ba available because of not signed in
		join c0 on (1=1)
		join trip t on	( 
			t.trip_id	=	j.trip_id
			and t.driver_id	!= 	user0.usr_id
			and t.status_code = 'A'
			-- trip start and end must inside the bounding box
			and t.start_lat between c0.p1_lat and c0.p2_lat
			and t.start_lon between c0.p1_lon and c0.p2_lon
			and t.end_lat between c0.p1_lat and c0.p2_lat
			and t.end_lon between c0.p1_lon and c0.p2_lon
			and t.distance	between c0.min_distance and c0.max_distance
			and ( 	t.dir	 between c0.min_rdir and c0.max_rdir
				or	t.dir	 between c0.min_rdir_360 and c0.max_rdir_360
				or	t.dir	 between c0.min_rdir_360_1 and c0.max_rdir_360_1
				)
			-- this axes rotation is very rudimental. Needs refinement.
			and (t.end_lat	-(c0.rp1).lat)*cos_rdir_1 	- (end_lon	-(c0.rp1).lon)	* sin_rdir_1 
				> c0.distance*c0.axes_move
			and (t.end_lat	-(c0.rp1).lat)*cos_rdir_2	- (end_lon	-(c0.rp1).lon)	* sin_rdir_2 
				> c0.distance*c0.axes_move
			and (t.start_lat-(c0.rp2).lat)*cos_rdir_1 	- (start_lon-(c0.rp2).lon)	* sin_rdir_1 
				< - c0.distance*c0.axes_move
			and (t.start_lat-(c0.rp2).lat)*cos_rdir_2	- (start_lon-(c0.rp2).lon)	* sin_rdir_2 
				< - c0.distance*c0.axes_move
		)
		join usr 	ut on (ut.usr_id=t.driver_id) -- to get driver sm_link
		left outer join usr u on (u.usr_id = user0.usr_id) -- to get bookings
		left outer join book b on (	b.rider_id = user0.usr_id
						and b.journey_id=j.journey_id
						and b.status_cd in ('P', 'B')
					)
		where j.status_code='A'
		and j.seats >= c0.seats
		and j.price <= c0.max_driver_price
		and j.journey_date between c0.date1 and c0.date2
		and j.departure_time between c0.time1 and c0.time2
		order by j.journey_date , j.departure_time
		limit 100
	)
	select row_to_json(a) 
	from a
	order by a.journey_date, a.departure_time
	;
$body$
language sql;


--select * from funcs.search('{"departure_time": null, "distance": 30.7, "end_date": null, "end_display_name": "Millennium Centre, 33, West Ontario Street, Magnificent Mile, Chicago, Cook County, Illinois, 60654, USA", "end_lat": "41.89285925", "end_loc": "33 w ontario st, chicago", "end_lon": "-87.6292175246499", "price": 0.2, "seats": 1, "start_date": null, "start_display_name": "2916, Colton Court, Lisle, DuPage County, Illinois, 60532, USA", "start_lat": "41.7944060204082", "start_loc": "2916 colton ct", "start_lon": "-88.1075615306122"}');

create or replace function funcs.book_count_of_trip ( in_trip_id text)
	returns bigint
as
$body$
	select count(1)	cnt
	from trip t 
	join journey j on ( j.trip_id=t.trip_id)
	join book b on (b.journey_id = j.journey_id)
	where t.trip_id = in_trip_id::uuid
$body$
language sql;

create or replace function funcs.book( in_book text,	in_user text)
	returns book
as
$body$
DECLARE
		user0 RECORD ;
		utj RECORD ;
		user1 RECORD ;
		book0 RECORD ;
		book1 RECORD ;
	factor decimal;
BEGIN
	SELECT * into user0 FROM funcs.json_populate_record(NULL::usr , in_user) ;
	SELECT * into book0 FROM funcs.json_populate_record(NULL::book, in_book) ;

	factor := 1.2 ;
	
	-- make sure enough balance and seats
	select 	u.usr_id, t.trip_id, j.journey_id 
		, j.price driver_price
		, funcs.calc_cost(j.price , book0.distance , book0.seats, false) driver_cost
		, j.price * factor	rider_price
		, funcs.calc_cost(j.price , book0.distance , book0.seats , true) rider_cost
	into 	utj	
	from 	journey j, usr u , trip t
	where	j.journey_id=book0.journey_id
	and	u.usr_id=user0.usr_id
	and	t.trip_id=j.trip_id
	and	u.balance >= funcs.calc_cost(j.price , book0.distance , book0.seats , true)
	and	j.seats >= book0.seats 
	and	book0.distance > 0
	;

	if	utj.journey_id is null then
		return null::book;
	end if;

	insert into book ( 
		journey_id
		, rider_id 
		, pickup_loc					
					, pickup_display_name
					, pickup_lat
					, pickup_lon
					, dropoff_loc
					, dropoff_display_name
					, dropoff_lat
					, dropoff_lon
					, distance							
		, seats, status_cd, driver_price, rider_price, driver_cost, rider_cost )
	select 	utj.journey_id
		, utj.usr_id 
		, book0.pickup_loc
					, book0.pickup_display_name
					, book0.pickup_lat
					, book0.pickup_lon
					, book0.dropoff_loc
					, book0.dropoff_display_name
					, book0.dropoff_lat
					, book0.dropoff_lon					 
					, book0.distance							
		, book0.seats
		, 'P'
		, utj.driver_price
		, utj.rider_price
		, utj.driver_cost
		, utj.rider_cost
	where utj.journey_id is not null
	returning * into book1
	;
	
	update journey j
	set seats = j.seats- book1.seats
	where j.journey_id= book1.journey_id
	;
	
	insert into money_trnx ( 
		usr_id
		, trnx_cd
		, actual_amount
		, actual_ts 
		, reference_no)
	values (book1.rider_id
		, 'B'
		, -book1.rider_cost
		, clock_timestamp()
		, book1.book_id
		)
	;

	update usr u
	set balance = balance - book1.rider_cost
	where u.usr_id=book1.rider_id
	returning * into user1
	;
	
	return book1;
END
$body$
language plpgsql;


create or replace function funcs.get_money_trnx( in_criteria text, in_user text)
	returns setof json
as
$body$
	with u0	as ( 
		SELECT * FROM funcs.json_populate_record(NULL::usr , in_user) 
	)
	, c0 as ( 
		SELECT * FROM funcs.json_populate_record(NULL::funcs.criteria , in_criteria)
	)
	, s1 as (select	
			coalesce(t.actual_ts, t.request_ts) date
			, cd.description
			, t.*
		from u0
		join money_trnx t on ( t.usr_id= u0.usr_id)
		join	c0 on (1=1)	
		left outer join money_trnx_trnx_cd cd on (	cd.cd = t.trnx_cd)
		where (
			t.actual_ts between coalesce(c0.date1, '1970-01-01') 
			and coalesce(c0.date2, '3000-01-01')
			or 
			t.request_ts between coalesce(c0.date1, '1970-01-01') 
			and coalesce(c0.date2, '3000-01-01')
		)
	)
	select row_to_json (s1)	from s1
	order by date desc
	;
$body$
language sql;

create or replace function funcs.withdraw( in_trnx text, in_user text)
	returns money_trnx
as
$body$
DECLARE
		t0 RECORD ;
		u0 RECORD ;
		t1 RECORD ;
BEGIN

	SELECT * into t0 FROM funcs.json_populate_record(NULL::money_trnx, in_trnx) ;
	SELECT * into u0 FROM funcs.json_populate_record(NULL::usr, in_user) ;

	insert into money_trnx ( 
		  usr_id
		, trnx_cd
		, requested_amount
		, request_ts
		, bank_email
		, reference_no	
		)
		values (
		  u0.usr_id
		, 'W'
		, -t0.requested_amount
		, clock_timestamp()
		, t0.bank_email
		, uuid_generate_v4()
		)
		returning * into t1
		;

		return t1;
END
$body$
language plpgsql;

create or replace function funcs.finish_withdraw( in_trnx text, in_user text)
	returns money_trnx
as
$body$
DECLARE
		t0 RECORD ;
		u0 RECORD ;
		t1 RECORD ;
BEGIN

	SELECT * into t0 FROM funcs.json_populate_record(NULL::money_trnx, in_trnx) ;
	--SELECT * into u0 FROM funcs.json_populate_record(NULL::usr, in_user) ;


	update money_trnx m
	set 	  actual_amount = -least(greatest(0,u.balance), -m.requested_amount)
			, actual_ts		= clock_timestamp()	
	from 	usr u
	where 	u.usr_id=m.usr_id
	and		m.money_trnx_id=t0.money_trnx_id
	returning m.* into t1
	;

	update usr 
	set balance = balance + t1.actual_amount
	;

	return t1;
END
$body$
language plpgsql;

create or replace function funcs.deposit( trnx text)
	returns money_trnx
as
$body$
DECLARE
		s0 RECORD ;
		i1 RECORD ;
BEGIN
	SELECT * into s0 FROM funcs.json_populate_record(NULL::funcs.criteria, trnx) ;

	insert into money_trnx ( usr_id, trnx_cd, actual_amount, actual_ts, reference_no) 
	select u.usr_id, 'D', s0.actual_amount, clock_timestamp(), s0.reference_no
	from usr u
	where deposit_id = s0.deposit_id
	returning * into i1 
	;

	update usr u
	set balance = u.balance+ i1.actual_amount
	where u.usr_id = i1.usr_id;

		return i1;
END
$body$
language plpgsql;


create or replace function funcs.upd_money_trnx( trnx text)
	returns money_trnx
as
$body$
DECLARE
		s0 RECORD ;
		i1 RECORD ;
		u1 RECORD ;
BEGIN
	SELECT * into s0 FROM funcs.json_populate_record(NULL::money_trnx, trnx) ;

	insert into money_trnx ( usr_id, trnx_cd) 
	select	s0.usr_id, s0.trnx_cd
	where s0.money_trnx_id is null
	returning * into i1 
	;

		update money_trnx t
		set 
						trnx_cd						= coalesce(s0.trnx_cd						, t.trnx_cd				 )	 
				, requested_amount	 = coalesce(s0.requested_amount	 , t.requested_amount	)
				, actual_amount			= coalesce(s0.actual_amount			, t.actual_amount		 )
				, request_ts				 = case when s0.requested_amount	is null then t.request_ts				else clock_timestamp()		end
				, actual_ts					= case when s0.actual_amount		 is null then t.actual_ts				 else clock_timestamp()		end
				, bank_email				 = coalesce(s0.bank_email				 , t.bank_email				)
				, reference_no			 = coalesce(s0.reference_no			 , t.reference_no			)
				, cmnt							 = coalesce(s0.cmnt							 , t.cmnt							)
				, c_ts							 = coalesce(s0.c_ts							 , t.c_ts							)
				, m_ts							 = coalesce(s0.m_ts							 , t.clock_timestamp() )
		where t.money_trnx_id in ( s0.money_trnx_id, i1.money_trnx_id)
		returning t.* into u1 
		;
	
		return u1;
END
$body$
language plpgsql;


create or replace function funcs.activity(in_criteria text, in_user text)
	returns setof json
as
$body$
-- in_trip has start_date and end_date
-- if input json string has fields with "" value, change their value to null in order to avoid error when converting empty string to date
	with c0 as (
		SELECT * FROM funcs.json_populate_record(NULL::funcs.criteria , in_criteria)
	)
	, user0	as ( 
		SELECT * FROM funcs.json_populate_record(NULL::usr , in_user)
	)
	, ids as (
		select	t.trip_id, j.journey_id, b.book_id, t.driver_id, b.rider_id, u0.usr_id
		from user0 	u0
		join c0	 	on (1=1)
		join trip 	t 	on ( t.driver_id=u0.usr_id )
		join journey 	j	on (t.trip_id=j.trip_id
			and	j.journey_date between coalesce(c0.date1	, '1970-01-01') 
						and coalesce(c0.date2	, '3000-01-01')
			)
		join book 	b	on (b.journey_id=j.journey_id )
		-- join book_status s on (s.status_cd= b.status_cd)
		union
		select	t.trip_id, j.journey_id, b.book_id, t.driver_id, b.rider_id, u0.usr_id
		from user0 	u0
		join c0 	on (1=1)
		join book 	b 	on ( b.rider_id= u0.usr_id)
		join journey 	j 	on ( j.journey_id = b.journey_id
			and	j.journey_date between coalesce(c0.date1	, '1970-01-01') 
						and coalesce(c0.date2	, '3000-01-01')
			)
		join trip 	t 	on ( t.trip_id = j.trip_id)
		union 
		-- get bookable journeys to allow its driver to change seats and price
		select	t.trip_id, j.journey_id, null book_id, t.driver_id, null rider_id, u0.usr_id
		from user0	u0
		join c0	 	on ( 1=1)
		join trip 	t 	on ( t.driver_id=u0.usr_id )
		join journey	j	on (t.trip_id=j.trip_id
			and	j.journey_date between coalesce(c0.date1	, '1970-01-01') 
						and coalesce(c0.date2	, '3000-01-01')
			and j.status_code = 'A'
			)
	)
	, a as (
		select 
			ids.trip_id
			, ids.driver_id
			, ids.rider_id
			, ids.journey_id
			, ids.book_id 
			, t.start_display_name
			, t.start_lat
			, t.start_lon
			, t.end_display_name
			, t.end_lat
			, t.end_lon
			, t.description
			-- , t.distance
			, j.journey_date
			, j.departure_time
			, j.status_code
			, case 
				when ids.usr_id = t.driver_id	then coalesce(b.driver_price, j.price)
				when ids.usr_id	= b.rider_id 	then b.rider_price	
				else null
				end price
			, case 
				when ids.usr_id = t.driver_id	then b.driver_cost 
				when ids.usr_id = b.rider_id	then b.rider_cost	
				else null
				end unified_cost -- either driver's cost or rider's cost
			, coalesce(b.seats , j.seats) seats	-- either seats available or seats booked
			--, case when ids.usr_id = t.driver_id then b.driver_cost else null end driver_cost
			--, case when ids.usr_id = b.rider_id then b.rider_cost else null end rider_cost
			, b.status_cd 
			, case when s.description is null then 'Published'
				else s.description
				end book_status_description
			--, case when ids.usr_id = ids.driver_id then true else false end is_driver
			--, case when ids.usr_id = ids.rider_id then true else false end is_rider
			, case when ids.usr_id = t.driver_id then true else false end is_driver
			, case when ids.usr_id = b.rider_id	then true else false end is_rider
			, b.pickup_display_name
			, b.pickup_lat
			, b.pickup_lon
			, b.dropoff_display_name
			, b.dropoff_lat
			, b.dropoff_lon
			, case 	when ids.usr_id = t.driver_id then ur.headline else ud.headline end headline
			, case 	when ids.usr_id = t.driver_id and ur.profile_ind then ur.sm_link	
					when ids.usr_id = b.rider_id  and ud.profile_ind then ud.sm_link	
					else null
			  end sm_link
		from ids 
		join trip 		t 	on ( t.trip_id=ids.trip_id )
		join journey 		j 	on (j.journey_id= ids.journey_id) 
		join usr		ud 	on ( ud.usr_id=ids.driver_id)
		left outer join usr	ur 	on ( ur.usr_id=ids.rider_id)
		left outer join book 	b 	on (b.book_id= ids.book_id )
		left outer join book_status s 	on (s.status_cd= b.status_cd)
	)
	select row_to_json(a) 
	from a
	order by a.journey_date , a.departure_time
	;
$body$
language sql;

create or replace function funcs.msgs(in_book text, in_user text)
	returns setof json
as
$body$
	with b0 as (
		SELECT * FROM funcs.json_populate_record(NULL::book , in_book)
	)
	, u0	as ( 
		SELECT * FROM funcs.json_populate_record(NULL::usr , in_user)
	)
	, a as (
		select m.*
			,	case when u0.usr_id = m.usr_id then 'Me'
				 	when u0.usr_id != m.usr_id and m.usr_id = b.rider_id then 'Rider'
				 	else 'Driver'
				 end user_is
		from u0
		join b0 on (1=1)
		join book b 	on ( b.book_id= b0.book_id ) 
		join msg m 	on ( m.book_id= b.book_id and m.c_ts > b0.c_ts )
	)
	select row_to_json(a) 
	from a
	order by a.c_ts 
	;
$body$
language sql;

create or replace function funcs.save_msg( in_msg text, in_user text)
	returns msg
as
$body$
DECLARE
	m0 RECORD; 
	u0 RECORD ;
	m1 msg ;
	m2 RECORD ;
BEGIN
	SELECT * into m0 from funcs.json_populate_record(NULL::msg, in_msg) ;
	SELECT * into u0 from funcs.json_populate_record(NULL::usr, in_user) ;
	
	insert into msg ( book_id, usr_id, msg) 
		values	( m0.book_id, u0.usr_id, m0.msg)
	returning * into m1
	;

	return m1;
END
$body$
language plpgsql;
