//extern crate serde_json;
extern crate server;
extern crate ridews;

use std::thread;

use server::util ;
use server::router_util ;
use server::constants::LOG_FILE ;

use ridews::socket;
use server::constants::URL_WEBSOCKET_SERVER ;

fn main() {
    util::logger_init(LOG_FILE);
	thread::spawn(move || {
    	router_util::router_start(4201);
	});
    socket::websocket_async_server(URL_WEBSOCKET_SERVER);
}

