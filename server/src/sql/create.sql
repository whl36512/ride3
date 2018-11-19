-- to run this script
-- su postgres -c psql < src/sql/create.sql
drop database if exists ride;
create database ride; 
drop user if exists ride;
create user ride with password 'ride';
-- alter database ride owner to ride;
GRANT ALL PRIVILEGES ON DATABASE ride to ride;
\c ride
grant all on all tables in schema public to ride;
CREATE EXTENSION pgcrypto;
CREATE EXTENSION	"uuid-ossp";


-- IMPORTANT:
-- All columns must be not null because play cannot handle null when converting JSON to case class

CREATE DOMAIN email AS TEXT 
CHECK(
	VALUE ~ '^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-]{1,30}\.){1,4}([a-zA-Z]{2,5})$' 
);


--slick cannot handle uuid 
CREATE DOMAIN sys_id as uuid default uuid_generate_v4() ;
CREATE DOMAIN textwithdefault as text default '' ;
CREATE DOMAIN sys_ts timestamp with time zone default clock_timestamp();
CREATE DOMAIN tswithepoch timestamp with time zone default '1970-01-01 00:00:00Z' ;
CREATE DOMAIN score integer	CHECK ( value in (1,2,3,4,5));
CREATE DOMAIN ridemoney decimal(10,4) ;

CREATE TYPE location AS
	(
		loc			text 	-- user input address
	, lat			decimal(18,14)
	, lon			decimal(18,14)
	, display_name	text		-- reverse geocoded
);

create table usr
(
	usr_id 			sys_id not null
	, first_name	text
	, last_name		text
	, headline		text
	, email 		email 
	, bank_email 		email
	, member_since 		sys_ts not null
	, trips_posted 		integer not null default 0
	, trips_completed 	integer not null default 0
	, rating		decimal (5,2) not null default 0
	, balance		ridemoney not null default 0
	, oauth_id		text not null
	, oauth_host		text not null default 'linkedin'
	, deposit_id		sys_id not null
	, sm_link		text	-- social media link
	, profile_ind	boolean not null default false
	, c_ts 			sys_ts not null
	, m_ts 			sys_ts not null
	, constraint pk_usr PRIMARY KEY (usr_id)
	, constraint uk_usr unique	(oauth_id)
) ;

create index ix_usr_oauth_id on usr(oauth_id);

CREATE TABLE trip
(
	trip_id		 sys_id not null
	, driver_id		sys_id not null
	, start_date		date	not null
	, end_date		date	-- last date if recurring, null otherwise
	, departure_time		time	not null default current_time
	, start_loc		textwithdefault not null
	, start_display_name	textwithdefault not null
	, start_lat		decimal(18,14) not null default 0
	, start_lon		decimal(18,14) not null default 0
	, end_loc		textwithdefault not null
	, end_display_name	textwithdefault not null
	, end_lat		decimal(18,14) not null default 0
	, end_lon		decimal(18,14) not null default 0
	, distance		decimal(8,2)	not null default 0
	, dir			double precision				not null
	, price		 	ridemoney	not null default 0.1 -- price per mile
	, recur_ind		boolean not null default false
	, status_code		char(1) not null default	'A' -- Pending, Active,	Cancelled,	Expired
	, description		text
	, seats		 	integer not null default 3
	, day0_ind		boolean not null default false		-- sunday
	, day1_ind		boolean not null default false
	, day2_ind		boolean not null default false
	, day3_ind		boolean not null default false
	, day4_ind		boolean not null default false
	, day5_ind		boolean not null default false
	, day6_ind		boolean not null default false
	, c_ts			sys_ts not null
	, m_ts			sys_ts not null
	, c_usr 		text
	, constraint pk_trip PRIMARY KEY (trip_id)
	, constraint fk_trip2user foreign key ( driver_id) REFERENCES	usr ( usr_id)
);
create index ix_trip_driver_id on trip(driver_id);
create index ix_trip_dir_duistance on trip(dir, distance);
alter table trip add constraint ck_trip_status_code check (status_code in ('A','E') );

CREATE TABLE journey
(
	journey_id			sys_id	not null
	, trip_id			sys_id 	null
	, journey_date		date	not null
	, departure_time	time	not null default current_time
	, j_epoch			integer not null --departure date and time since epoch
	, status_code		char(1) not null default	'A' -- Pending, Active, Cancelled,	Expired
	, price		 		ridemoney	not null default 0.1 -- price per mile
	, seats		 		integer not null default 3 
	, c_ts				sys_ts	not null
	, m_ts				sys_ts	not null
	, c_usr 			text
	, constraint pk_journey PRIMARY KEY (journey_id)
	, constraint fk_jn2trip foreign key ( trip_id) REFERENCES	trip ( trip_id)
);
create index ix_jn_trip_id on journey(trip_id);
create index ix_jn_j_epoch on journey(j_epoch) where status_code = 'A' and seats > 0;


--create table book_status(
	--status_cd 	char(1) not null
	--, description	textwithdefault not null
	--, constraint pk_book_status PRIMARY KEY (status_cd)
--);

--insert into book_status 
--values 
	--('P', 'Pending confirmation')
--, ('I', 'Insufficient balance')
--, ('B', 'Confirmed')
--, ('S', 'trip started')
--, ('R', 'cancelled by Rider')
--, ('D', 'cancelled by Driver')
--, ('F', 'Finished')
--, ('J', 'Rejected by driver')
--;

create table book
(
	book_id			sys_id not null
	, journey_id		sys_id not null
	, rider_id		sys_id	not null
	, pickup_loc		textwithdefault not null
	, pickup_display_name	textwithdefault not null
	, pickup_lat		decimal(18,14) not null default 0
	, pickup_lon		decimal(18,14) not null default 0
	, dropoff_loc		textwithdefault not null
	, dropoff_display_name	textwithdefault not null
	, dropoff_lat		decimal(18,14) not null default 0
	, dropoff_lon		decimal(18,14) not null default 0
	, distance		decimal(8,2)	not null default 0
	, seats			integer not null default 1
	, driver_price		ridemoney not null default 0
	, driver_cost		ridemoney not null default 0
	, rider_price		ridemoney not null default 0
	, rider_cost		ridemoney not null default 0
	, penalty_to_driver	ridemoney not null default 0	
	, penalty_to_rider	ridemoney not null default 0
	, status_cd		char(1) not null default	'P' 
-- Pending confirmation, Booked, trip Started, cancelled by Rider, cancelled by Driver, Finished, Rejected by driver
	, rider_score		smallint	CHECK ( rider_score in (1,2,3,4,5))
	, driver_score		smallint	CHECK ( rider_score in (1,2,3,4,5))
	, rider_comment		text
	, driver_comment	text
	, c_ts			sys_ts not null
	, m_ts			sys_ts not null
	, book_ts		sys_ts not null
	, driver_cancel_ts	timestamp with time zone
	, rider_cancel_ts	timestamp with time zone
	, finish_ts		timestamp with time zone
	, constraint pk_book PRIMARY KEY (book_id)
	, constraint fk_book2jn foreign key ( journey_id) REFERENCES	journey ( journey_id)
	, constraint fk_book2usr foreign key ( rider_id) REFERENCES	usr ( usr_id)
);
create index ix_book_journey_id on book(journey_id);
create index ix_book_rider_id on book(rider_id);
alter table book add constraint ck_book_status_cd check (status_cd in ('P','B','S','R','D','F','J') );

create table money_trnx (
	money_trnx_id		sys_id not null
	, usr_id		sys_id not null
	, trnx_cd		text not null 
				-- Deposit, Withdraw, Penalty, trip Finished, Booking
	, status_cd		text not null default 'K' --
	, requested_amount	ridemoney 
	, actual_amount		ridemoney
	, request_ts		timestamp with time zone
	, actual_ts		timestamp with time zone
	, bank_email		email
	, reference_no		text
	, cmnt 			text
	, c_ts			sys_ts not null
	, m_ts			sys_ts not null
	, constraint pk_money_trnx PRIMARY KEY (money_trnx_id)
	, constraint fk_tran2usr foreign key ( usr_id) REFERENCES	usr ( usr_id)
);
create index ix_money_trnx_usr_id on money_trnx(usr_id);
alter table money_trnx add constraint ck_money_trnx_trnx_cd 
	check (trnx_cd in ('D', 'W', 'P', 'F', 'B', 'R') );
alter table money_trnx add constraint ck_money_trnx_status_cd 
	check (status_cd in ('K', 'F') );


create table msg (
		msg_id 	sys_id 	not null
	, book_id 	sys_id 	not null
	, usr_id	sys_id 	not null
	--, sender_id	sys_id	not null
	--, receiver_id	sys_id	not null
	, c_ts		sys_ts 	not null
	, msg		text 	not null
	, constraint fk_msg2usr foreign key ( usr_id) REFERENCES	usr ( usr_id)
	, constraint fk_msg2book foreign key ( book_id) REFERENCES	book ( book_id)
);
create index ix_msg_book_id on msg(book_id);

create table code (
	code_type	text not null
	, cd	text not null
	, description	text not null
	, constraint pk_code PRIMARY KEY (code_type, cd)
)
;

insert into code values
	('BK', 'P', 'Pending confirmation')
, ('BK', 'I', 'Insufficient balance')
, ('BK', 'B', 'Confirmed')
, ('BK', 'S', 'trip started')
, ('BK', 'R', 'cancelled by Rider')
, ('BK', 'D', 'cancelled by Driver')
, ('BK', 'F', 'Finished')
, ('BK', 'J', 'Rejected by driver')
, ('TRAN', 'D', 'Deposit')
, ('TRAN', 'W', 'Withdraw')
, ('TRAN', 'P', 'Penalty')
, ('TRAN', 'B', 'Booking')
, ('TRAN', 'R', 'Return')
, ('TRAN', 'F', 'Trip Finished')
, ('TRIP', 'A', 'Active')
, ('TRIP', 'E', 'Expired')
, ('JN'	, 'A', 'Active')
, ('JN'	, 'E', 'Expired')
, ('TRAN_STATUS', 'K', 'Success')
, ('TRAN_STATUS', 'F', 'Failed')
;


--alter table trip add FOREIGN KEY (driver_id) REFERENCES usr (usr_id);
--alter table journey add FOREIGN KEY (trip_id) REFERENCES trip (trip_id);
--alter table book add FOREIGN KEY (rider_id) REFERENCES usr (usr_id);
--alter table book add FOREIGN KEY (journey_id) REFERENCES journey (journey_id);
--alter table money_trnx add FOREIGN KEY (usr_id) REFERENCES usr (usr_id);
--alter table book add FOREIGN KEY (status_cd) REFERENCES book_status (status_cd);
--alter table msg add FOREIGN KEY (book_id) REFERENCES book (book_id);
--alter table msg add FOREIGN KEY (usr_id) REFERENCES usr (usr_id);

create view book_status as select cd status_cd, description 
from code where code_type ='BK';

create view money_trnx_trnx_cd as select cd , description 
from code where code_type='TRAN';

--grant all on public.criteria to ride;
grant all on public.usr to ride;
grant all on public.trip to ride;
grant all on public.journey to ride;
grant all on public.book to ride;
--grant all on public.book_status to ride;
grant all on public.money_trnx to ride;
grant all on public.msg to ride;
grant all on public.code to ride;
grant all on public.book_status to ride;
grant all on public.money_trnx_trnx_cd to ride;

