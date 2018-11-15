//use reqres :: SessionKey;
use iron::status;
use reqres::RideRequest;
//use reqres::RequestComponent;
use db_postgres::db;
//use db;
use iron::request::Request;
use iron::response::Response;
use iron::IronResult;
use iron::headers::ContentType;
use pg_middleware::PostgresReqExt;
//use rustc_serialize::json::Json;
use serde_json;
//use json;


use tables::Usr ;
//use tables::Trip ;
use token::JwtToken;
use token;
//use reqres::SecurityStatus;
use constants;

type Json = serde_json::Value;

pub fn request_sql(req: & mut Request, sql : &str, expected_rows: u32) -> IronResult<Response> {
    // user_from_session and user_from_cookie must match
    let request_component = req.inspect();
    let db_conn= req.db_conn() ;

    if  expected_rows == 1 {
    	debug!("201811052005 handlerS::request_sql expected_rows= {} sql={}", expected_rows, &sql) ;
		let row : Option<Json> 
         	= db::runsql_one_row (
			&db_conn
                , sql
            	, &[&request_component.params.to_string(),  &request_component.user_from_token_string ]) ; 
    	return Ok(Response::with((status::Ok, serde_json::to_string(&row.unwrap()).unwrap()))) ;
    }
    else {
    	debug!("201811052005 handlerS::request_sql expected_rows= {} sql={}", expected_rows, &sql) ;
    	let rows :Vec<Json>  
        	= db::runsql_conn (&db_conn
            	, sql 
            	, &[&request_component.params.to_string(),  &request_component.user_from_token_string ], 2) ; 
    	return Ok(Response::with((status::Ok, serde_json::to_string(&rows).unwrap()))) ;
    }
}

pub fn get_session (req : &mut Request) -> IronResult<Response> {
    //user 3party auth info comes in a json payload
    let request_component = req.inspect();
    
    let db_conn= req.db_conn() ;
    let response = match request_component.user_from_cookie {
        Some(user)  => {
            let user_json_from_db: Option<Json>  
                = db::runsql_one_row (&db_conn
                                      , constants::SQL_UPD_USER
                                      , &[&user.to_string(), &constants::EMPTY_JSON_STRING.to_string() ]) ; //user_vec is an Option
            debug!(" 201808121053 get_session() user_json_from_db=\n{:?}", user_json_from_db) ;
            let user_from_db = Usr::from_js(& user_json_from_db);
            //req.set_session(user_from_db); 
            let token = token::Token { jwt: user_from_db.unwrap().to_jwt(constants::SECRET.as_ref()) };
            debug!("201808171508 get_session() token = {}", serde_json::to_string_pretty(&token).unwrap());

            let mut response= Response::with((status::Ok, format!("{}" ,serde_json::to_string_pretty(&token).unwrap()  ) )) ;
            //response.headers.set(ContentType::plaintext());
            response.headers.set(ContentType::json());
            //response.headers.set(ContentType::html());
            //response.headers.set(ContentType::form_url_encoded());
            response
        }
        None        => {
            //req.set_session(None); //clear session
            let response= Response::with((status::NotFound, r#"{"jwt": ""}"# )) ;
            response
        }
    } ;
    Ok(response) 
}

pub fn get_user(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_GET_USER, 1)
}

pub fn upd_user(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_UPD_USER, 1)
}
pub fn ins_trip(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_INS_TRIP, 1)
}
pub fn search(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_SEARCH, 2)
}
pub fn search_all(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_SEARCH_ALL, 2)
}
pub fn search_region(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_SEARCH_REGION, 2)
}
pub fn activity(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_ACTIVITY, 2)
}
pub fn myoffers(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_MYOFFER, 2)
}
pub fn upd_journey(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_UPD_JOURNEY, 1)
}
pub fn book(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_BOOK, 1)
}
pub fn mybooking(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_MYBOOKING, 2)
}

pub fn cancel_booking(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_CANCEL_BOOKING, 1)
}
pub fn finish(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_FINISH, 1)
}
pub fn confirm(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_CONFIRM, 1)
}
pub fn reject(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_REJECT, 1)
}
pub fn msgs(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_MSGS, 2)
}
pub fn save_msg(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_SAVE_MSG, 1)
}
pub fn withdraw(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_WITHDRAW, 1)
}
pub fn thist(req: &mut Request) -> IronResult<Response> {
	request_sql(req, constants::SQL_THIST, 2)
}

pub fn echo(request: &mut Request) -> IronResult<Response> {
    let request_dump  = format!("{:?}", request);
    debug!("201808101134 request_dump=\n{}", request_dump) ;
    Ok(Response::with((status::Ok, request_dump)))
}

pub fn post_page(_: &mut Request) -> IronResult<Response> {
    Ok(Response::with((status::Ok, "{'page':'not found'}")))
}

pub fn redi(_: &mut Request) -> IronResult<Response> {
    use iron::modifiers::Redirect;
    use iron::{status, Url};

    let url = Url::parse("http://rideshare.beegrove.com:4200").unwrap();
    Ok(Response::with((status::TemporaryRedirect, Redirect(url.clone()))))
}

