use simplelog::*;
//use std::fs::File;
use std::fs::OpenOptions;
use serde_json::Value;

// url::form_urlencoded::parse()
//
pub fn logger_init (log_file: &str) {
	CombinedLogger::init(
	    vec![
			TermLogger::new(LevelFilter::Debug, Config::default()).unwrap(),
			WriteLogger::new(LevelFilter::Debug, Config::default(),
			    OpenOptions::new()
				//.read(true)
				//.write(true)
				.append(true)
				.create(true)
				.open(log_file).unwrap()
				//File::create("my_rust_binary.log").unwrap()
			),
		]
	).unwrap();
}

pub fn merge(a: &mut Value, b: &Value) {
    match (a, b) {
	(&mut Value::Object(ref mut a), &Value::Object(ref b)) => {
	    for (k, v) in b {
		merge(a.entry(k.clone()).or_insert(Value::Null), v);
	    }
	}
	(a, b) => {
	    *a = b.clone();
	}
    }
}

#[cfg(test)]
mod tests {
    #[test]

    fn test_merge() {
	use util::merge ;
	let mut a = json!({
	    "title": "This is a title",
	    "person" : {
		"firstName" : "John",
		"lastName" : "Doe"
	    },
	    "cities":[ "london", "paris" ]
	});

	let b = json!({
	    "title": "This is another title",
	    "person" : {
		"firstName" : "Jane"
	    },
	    "cities":[ "colombo" ]
	    });

	merge(&mut a, &b);
	println!("{:#}", a);
    }
}

