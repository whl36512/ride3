use iron::prelude::*;
use iron::status ;
use iron::response::Response ;
use iron::request::Request ;
//use hyper::client ;
use url::Url;
use hyper::client ;


const state: &str = "aekjfafoeriugarherug0iglwup34pfuqp3aeoq3ue3"  ;
#[derive(Debug)]
#[derive(Serialize, Deserialize)]
pub struct Auth_msg {
    // query string from linkedin
      code              : Option<String>   
    , state             : Option<String>
    , error             : Option<String>
    , error_description : Option<String>

    // json payload from linkedin
    , access_token      : Option<String>
    , expires_in        : Option<String>
}

#[derive(Debug)]
#[derive(Serialize, Deserialize)]
pub struct profile {
    //{
      //"firstName": "Frodo",
      //"headline": "Jewelery Repossession in Middle Earth",
      //"id": "1R2RtA",
      //"lastName": "Baggins",
      //"siteStandardProfileRequest": {
      //"url": "https://www.linkedin.com/profile/view?id=…"
      //}
      first_name           : Option<String>
    , headline             : Option<String>
    , id                   : Option<String>
    , last_name            : Option<String>
    , siteStandardProfileRequest : Option<String>
}


impl Auth_msg {
    pub fn linkedin_callback (request: & mut Request ) -> IronResult<Response>
    {
        // ths code is noy complete
        // LinkedIn server complaining BAS REQUEST. Don't know why.
        // Use LinkedIn cleint side Javascript API instead
        use reqres;
        use serde_json::{ from_str}  ;
        use iron::modifiers::Redirect;
        use iron::Url;

        debug!("201808091546 linkedin_callback request= {:?}", request) ;
        let json_string = reqres::params_to_json(request) ;
        let auth_msg: Auth_msg = from_str(& json_string).unwrap() ;
        debug!("201808091546 linkedin_callback auth_msg = {:?}", auth_msg) ;
        if ( (auth_msg.state, auth_msg.error) == ( Some(state.to_string()), None ) )
        {
            info!("201808091958 linkedin auth passed. getting access_code ...") ;
            Auth_msg::get_access_code(auth_msg.code) ;
            let url = Url::parse("http://rideshare.beegrove.com:4200/").unwrap();
            Ok(Response::with((status::TemporaryRedirect, Redirect(url.clone()))))

            //Ok(Response::with((status::Ok, "got it"  ) )) 
        }
        else {
            Ok(Response::with((status::Ok, "Some thing wrong"  ) ))
        }
    }

    pub fn get_access_code(code: Option<String> )  {
        // ths code is noy complete
        // LinkedIn server complaining BAS REQUEST. Don't know why.
        // Use LinkedIn cleint side Javascript API instead
        use hyper::client::Response ;
        // POST /oauth/v2/accessToken HTTP/1.1
        // Host: www.linkedin.com
        // Content-Type: application/x-www-form-urlencoded

        // grant_type=authorization_code&code=987654321&redirect_uri=https%3A%2F%2Fwww.myapp.com%2Fauth%2Flinkedin&client_id=123456789&client_secret=shhdonottell
        let redirect_uri    ="http://rideshare.beegrove.com:4201/linkedin/accesstoken";
        let client_id       = "86xvjldqclucd9";
        let client_secret   = "G3ihVrYkqIu0FWWd" ;

        use url::form_urlencoded;
        use hyper::Client;
        use hyper::net::HttpsConnector;
        use hyper_native_tls::NativeTlsClient;
        use hyper::header::{Headers, ContentType};

        let encoded: String = form_urlencoded::Serializer::new(String::new())
                .append_pair("grant_type", "authorization_code")
                .append_pair("code", &code.unwrap())
                .append_pair("redirect_uri", &redirect_uri)
                .append_pair("client_id", &client_id)
                .append_pair("client_secret", &client_secret)
                .append_pair("state", &state.to_string())
                .finish();

        info!("201808092118 content to send to linkedin: {}", encoded);


        let path = "https://www.linkedin.com/oauth/v2/accessToken" ;  // must use https
        //let path = "http://rideshare.beegrove.com:4201/echo" ;  
        //let client = Client::new();
        let ssl = NativeTlsClient::new().unwrap();
        let connector = HttpsConnector::new(ssl);
        let client = Client::with_connector(connector);
        let response_result= client.post(path) .header(ContentType::form_url_encoded()) .body(&encoded) .send() ;

        debug!("201808091559 get_access_code response_result= {:?}", response_result) ;
        
        let response : Response = response_result.unwrap();

        debug!("201808091559 get_access_code response= {:?}", response) ;
        debug!("201808081844 linkedin_callback message= {:?}", response.get_ref()) ;
        //Auth_msg::run_curl(path, & encoded) ;
    }

    pub fn run_curl(path:  & str, url_encoded:  & String)
    {
        // this piece of code is not complete. Linkedin complain grant_type is missing. I cannot
        // figure out why.
        // Use LinkedIn 's javascrpt API instead.
        use std::process::Command;
        debug!("201808101402 url_encoded = '{}'", url_encoded) ;
        let os_comm= "curl" ;
        let mut command = Command::new("curl");
        let command = command.arg("--data")
        .arg(url_encoded)
        .arg("-H")
        .arg("Content-Type: application/x-www-form-urlencoded")
        .arg(path);
        debug!("201808101209 commend = {:?}" , command);
        let output=command .output()
        .expect("failed to execute process");

        debug!("201808101336 status: {}", output.status);
        debug!("201808101336 stdout: {}", String::from_utf8_lossy(&output.stdout));
        debug!("201808101336 stderr: {}", String::from_utf8_lossy(&output.stderr));
    }
}




