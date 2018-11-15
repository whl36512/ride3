#[macro_use] extern crate log;
extern crate simplelog;

#[macro_use]
extern crate serde_derive;
//#[macro_use]
extern crate serde_json;
extern crate serde;
//extern crate rustc_serialize;


extern crate r2d2;
extern crate r2d2_postgres;

extern crate iron;
extern crate router;
extern crate params;  // parse get and post to a map
extern crate url;
//extern crate hyper;
extern crate hyper_native_tls;
extern crate secure_session;
extern crate typemap;
//extern crate json;
//extern crate reqwest;
//
extern crate iron_postgres_middleware as pg_middleware;
extern crate iron_cors ;
extern crate unicase;

//extern crate crypto;
extern crate rand;
extern crate data_encoding;
extern crate jsonwebtoken as jwt;
extern crate chrono;
extern crate db as db_postgres;


//pub mod db;
pub mod util;
pub mod tables;
pub mod reqres;
//pub mod linkedin;
pub mod router_util;
//pub mod crypt;
pub mod handlers;
pub mod token;
pub mod constants;




