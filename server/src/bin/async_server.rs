extern crate ridews;
extern crate server;
use ridews::util;
use ridews::socket;
use ridews::constants::LOG_DIR;
use server::constants::URL_WEBSOCKET_SERVER ;


fn main()  {
    util::logger_init(LOG_DIR)  ;
    socket::websocket_async_server(URL_WEBSOCKET_SERVER);
}

