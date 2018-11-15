extern crate serde_json;
extern crate server;

use server::util ;
use server::router_util ;
use server::constants::LOG_FILE ;

fn main() {
    util::logger_init(LOG_FILE);
    router_util::router_start(4201);
}

