//#[macro_use] extern crate log;
//extern crate simplelog;
extern crate server;

pub fn setup ()  {
    use server::util::logger_init;
    logger_init();
}

