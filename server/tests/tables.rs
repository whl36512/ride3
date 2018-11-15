#[macro_use] extern crate log;
extern crate server;

mod common ;

#[test]
fn tables_test ()  {
    common::setup();

    use server::tables::Usr;
    use server::db;
    let pool = db::db_pool(None) ;
    let sql= "select row_to_json(a, true) from usr a limit 2" ;
    let js_vec = db::runsql(&pool, &sql  , &[]) ;

    let objs : Vec<Usr> = Usr::from_js_vec(&js_vec) ;
    for obj in &objs {
        info!("201808061234 test() obj = {:?}" , obj) ;
        info!("201808081230 obj.to_string= {}" , obj.to_string() ) ;
    }
}
