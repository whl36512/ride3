extern crate server;

mod common;

#[test]
fn router_util_test() {
    common::setup();
    use server::router_util::router_start ;
    router_start(4201);
}

