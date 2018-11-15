extern crate server;

mod common;

#[test]
fn db_test ()  {
    common::setup();

    use server::db;
    let pool = db::db_pool(None) ;
    let sql= "select row_to_json(a, true) from usr a limit 2" ;
    let ret = db::runsql(&pool, &sql  , &[]) ;
}
