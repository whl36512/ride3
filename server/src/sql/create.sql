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

CREATE TABLE trip  as
(
		trip_id		sys_id		not null
	,	trip_pid	sys_id		-- -- if trip_pid is null, the row is an offer, otherwise it is a booking
	,	role		char(1)		-- Driver Rider
	,	usr_id		sys_id not null
	,	p1			location
	,	p2			location
	,	dir			real
	,	price		ridemoney
	,	cost		ridemoney
	,	distance	decimal(8,2)    not null default 0
	,	seats		smallint
	,	penalty		ridemoney
	,	score		smallint
	,	cmt			text
	,	book_ts		sys_ts
	,	confirm_ts	sys_ts
	,	cancel_ts	sys_ts
	,	finish_ts	sys_ts
	,	status_cd	text 	-- for offer Active, Expired, No more Booking
							-- for booking, Pending confirmation, Booked, trip Started,
							-- Cancelled by Offerer, Cancelled by Booker, Finished, Rejected by driver
	,	description text
	,	c_ts		sys_ts not null
	,	m_ts		sys_ts not null
	,	c_usr 		text
	,	constraint pk_trip		PRIMARY KEY (trip_id)
	,	constraint fk_trip2trip 	foreign key (trip_pid)	REFERENCES	trip 	( trip_id)
	,	constraint fk_trip2usr 	foreign key (usr_id)	REFERENCES	usr 	( usr_id)
);

create index ix_trip_usr_id on trip(usr_id);
create index ix_trip_dir_distance on trip(dir, distance) where status_cd = 'A' and seats > 0;
alter table trip add constraint ck_trip_status_code 
	check (status_cd in ('A','E', 'NB', 'P', 'B', 'CO', 'CB', 'R' ) );

create table money_tran (
	money_tran_id		sys_id not null
	, usr_id		sys_id not null
	, trnx_cd		text not null 
				-- Deposit, Withdraw, Penalty, trip Finished, Booking
	, status_cd		text not null default 'K' --
	, requested_amount	ridemoney 
	, actual_amount		ridemoney
	, balance			ridemoney 	-- balance after trnasaction
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
--, ('BK', 'I', 'Insufficient balance')
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
, ('TRIP', 'NB', 'No more booking allowed')
--, ('JN'	, 'A', 'Active')
--, ('JN'	, 'E', 'Expired')
, ('TRAN_STATUS', 'K', 'OK, Success')
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

create view trip_status as select cd status_cd, description 
from code where code_type ='TRIP';

create view book_status as select cd status_cd, description 
from code where code_type ='BK';

create view money_trnx_trnx_cd as select cd , description 
from code where code_type='TRAN';

--grant all on public.criteria to ride;
grant all on public.usr to ride;
grant all on public.trip to ride;
--grant all on public.journey to ride;
--grant all on public.book to ride;
--grant all on public.book_status to ride;
grant all on public.money_trnx to ride;
grant all on public.msg to ride;
grant all on public.code to ride;
grant all on public.trip_status to ride;
grant all on public.book_status to ride;
grant all on public.money_trnx_trnx_cd to ride;

