use chrono::Utc;
use jwt::{encode, decode, Header, Algorithm, Validation};
use jwt::errors::{ErrorKind};
use tables::Usr ;

#[derive(PartialEq)]
#[derive(Debug)]
#[derive(Serialize, Deserialize)]
pub struct Claims {
    exp:        i64 ,
    usr_id:     Option<String> ,
    oauth_id:   Option<String> ,
    email:      Option<String> ,
}

pub trait JwtToken {
    fn to_jwt(&self, key: & [u8]) -> String ;
    fn from_jwt(token : &str, key: & [u8]) -> Self;
}

#[derive(Debug)]
#[derive(PartialEq)]
#[derive(Serialize, Deserialize)]
pub struct Token {
    pub jwt: String
}

#[derive(Debug)]
#[derive(PartialEq)]
#[derive(Serialize, Deserialize)]
pub struct TokenOption {
    pub jwt: Option<String>
}


impl JwtToken for Usr {
    fn to_jwt(&self, key: & [u8]) -> String {
        let mut header = Header::default();
        header.kid = Some("signing_key".to_owned());
        header.alg = Algorithm::HS512;

        let claims = Claims {
            exp: Utc::now().timestamp() ,
            usr_id: self.usr_id.to_owned()        ,
            oauth_id: self.oauth_id.to_owned()        ,
            email: self.email.to_owned()        ,
        } ;

        let token = match encode(&header, &claims, key) {
            Ok(t) => t,
            Err(_) => panic!() // in practice you would return the error
        };
        debug!("201808171423 to_jwt() token={:?}", token);
        token
    }

    fn from_jwt(token : &str, key: & [u8]) -> Self
    {
        use serde_json::{ to_string}  ;
        let validation = Validation {
            algorithms: [Algorithm::HS512].to_vec() ,
            leeway: 36000i64,
            validate_exp: true,
            ..Validation::default()
        } ;

        let token_data = match decode::<Claims>(token, key, &validation) {
            Ok(c) => c,
            Err(err) => match *err.kind() {
                ErrorKind::InvalidToken => panic!(), // Example on how to handle a specific error
                _ => panic!()
            }
        };
        debug!("201808171444 from_jwt() token_data.claims={:?}", token_data.claims);
        debug!("201808171444 from_jwt() token_data.header={:?}", token_data.header);
        Usr::from_js_string(&Some(to_string(&token_data.claims).unwrap())).unwrap()
    }
}



#[cfg(test)]
mod tests {
    // to unit test, use
    // cargo test --lib -- --nocapture
    
    use chrono::Utc;
    use jwt::{encode, decode, Header, Algorithm, Validation};
    use jwt::errors::{ErrorKind};
    use util;

    #[test]
    fn jwt_test() {
        util::logger_init();
        #[derive(Debug, Serialize, Deserialize)]
        #[derive(PartialEq)]
        struct Claims {
            exp: i64 ,
            sub: String,
            company: String
        }

        let my_claims = Claims {
            exp:Utc::now().timestamp() ,
            sub: "b@b.com".to_owned(),
            company: "ACME".to_owned()
        };
        
        let key="secret";
    
        let mut header = Header::default();
        header.kid = Some("signing_key".to_owned());
        header.alg = Algorithm::HS512;

        let key :&[u8]= key.as_ref() ;
    
        let token = match encode(&header, &my_claims, key) {
            Ok(t) => t,
            Err(_) => panic!() // in practice you would return the error
        };
        println!("{:?}", token);
    
    
        let validation = Validation {
            algorithms: [Algorithm::HS512].to_vec() ,
            sub: Some("b@b.com".to_string()),
            leeway: 10i64,
            validate_exp: true,
            ..Validation::default()
        } ;


    
        let token_data = match decode::<Claims>(&token, key, &validation) {
            Ok(c) => c,
            Err(err) => match *err.kind() {
                ErrorKind::InvalidToken => panic!(), // Example on how to handle a specific error
                _ => panic!()
            }
        };
        info!("{:?}", token_data.claims);
        info!("{:?}", token_data.header);
        assert_eq!(my_claims, token_data.claims) ;
    }

    #[test]
    fn user () 
    {
        use tables::Usr;
        use token::JwtToken ;
        static SECRET : &str ="an ultra secretstr" ;

        let user_json = r##"{"usr_id":"ahiauyiawfad", "oauth_id":"bbbbbbbb", "email":"weihan@beegrove.com"}"## ;
        let user = Usr::from_js_string(&Some(user_json.to_string())).unwrap();

        let token = user.to_jwt(SECRET.as_ref());
        let user_from_jwt = Usr::from_jwt(&token, SECRET.as_ref());
        assert_eq!(user, user_from_jwt);

    }
}

