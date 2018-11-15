import { Injectable } from '@angular/core';

import {DBService} from './remote.service'
import { C} from './constants';


//in order for require to work, change	src/tsconfig.app.json to read 
//	 "types": ["node"]

var forge = require('node-forge');

@Injectable({
	providedIn: 'root'
})
export class GuiService {

	constructor() { } ;
}

export class Status {
	static is_in_map_search = false;
	static search_result = [];
	static search_criteria :any|null = null;
	static rider_criteria : any | null = null
}

export class UserService {
	constructor(	) {};

	static is_signed_in ():boolean
	{
		let profile =	UserService.get_profile_from_session();
		let jwt = UserService.get_jwt_from_session();
		if ( profile == null	|| jwt == null)
		{
			return false;
		}
		return true;
		}

	static get_profile_from_session(): object|null {
		let encrypted_profile = StorageService.getSession(C.PROFILE);
		let profile = CryptoService.decrypt(encrypted_profile);
		if ( profile == null) {return null;} ;
		return JSON.parse(profile);
	}

	static get_jwt_from_session(): object|null {
		let jwt = StorageService.getSession(C.JWT);
		if (jwt == undefined || jwt==null || jwt=='' ) { return null;} ;
		return {'jwt' : jwt}
	}
}

export class Util {
	
	constructor(	) {};
	static sleepFor( sleepDuration: number ){
		var now = new Date().getTime();
		while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
	}

	static deep_copy(obj : any): any {
		if( typeof( obj ) == 'string' )
		{
			let obj1 = {value: obj};
			return JSON.parse(C.stringify(obj)).value;
			
		}
		else {
			return JSON.parse(C.stringify(obj));
		}
	}

/*	not working. error TS2339: Property 'chrome' does not exist on type 'Window'.
	get_browser_vender() {
	// https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
		let isChromium = window.chrome;
		let winNav = window.navigator;
		let vendorName = winNav.vendor;
		let isOpera = typeof window.opr !== "undefined";
		let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
		let isIOSChrome = winNav.userAgent.match("CriOS");
		vender: string;


		if (isIOSChrome) {
				// is Google Chrome on IOS
			vender ='IOSChrome';
			
		} else if (isOpera) {
			vender = 'Opera' ;
		} else if (isIEedge) {
			vender = 'Edge' ;
		} else if(
				isChromium !== null &&
				typeof isChromium !== "undefined" &&
				vendorName === "Google Inc." &&
				isOpera === false &&
				isIEedge === false
			) {
				// is Google Chrome
			vender='Google Chrome'
		} else { 
				// not Google Chrome 
			vender = 'Generic Chromium';
		}
	}
*/


	static hide_map() {
		let map = document.getElementById('map');
	let button = document.getElementById('map-close-button');
		if(map) map.style.zIndex = C.MAP_Z_INDEX_HIDE + '';
		if(button) button.style.zIndex = C.MAP_Z_INDEX_HIDE + '';
	}

	static show_map() {
		let map = document.getElementById('map');
	let button = document.getElementById('map-close-button');
		if(map) map.style.zIndex = C.MAP_Z_INDEX_SHOW + '';
		if(button) button.style.zIndex = (C.MAP_Z_INDEX_SHOW +1) +'';
	}

	static toggle_map() {
		if (Util.get_z_index('map') == C.MAP_Z_INDEX_SHOW) Util.hide_map();
		else	Util.show_map();
	}

	static get_z_index(elem_id :string) : number|null {
		let elem= document.getElementById(elem_id);
		if (elem) {
			return Number(elem.style.zIndex);
		}
		return null;
	}

	static list_global_objects () {
			var keys=Object.keys( window ).sort();
			for (var i in keys)
			{
				if (typeof window[keys[i]] != 'function')
					console.debug('2018270951 Util.list_global_objects()', keys[i], window[keys[i]]);
			}
	}

	static map_search_start() {
		Status.is_in_map_search = true;
	}

	static map_search_stop() {
		Status.is_in_map_search = false;
	}

	static is_in_map_search() :boolean {
		if (!Status.is_in_map_search) return false;
		if( Util.get_z_index('map') == C.MAP_Z_INDEX_SHOW ){
			// map search only happens when map is in the backround. So if the map's z-index is high
			// it is NOT in map search
			Status.is_in_map_search = false;
		}
		return Status.is_in_map_search ;
	}

	static create_rider_criteria () : any{

			return	{
			  version				: C.VERSION_FORM_SEARCH
			, departure_time		: ''
			, distance				: C.ERROR_NO_ROUTE
			, seats		 			: 1
			, price		 			: C.MAX_PRICE_RIDER
			, search_tightness		: 0
			, p1:	{ loc			: ''
					, lat			: null
					, lon			: null
					, display_name	: null
				}
			, p2:	{ loc			: ''
					, lat			: null
					, lon			: null
					, display_name	: null
				}
			, date1		 			: C.TODAY()
			, date2		 			: C.TODAY()
			}
	}

	static create_empty_trip () : any{

			return	{
			  version 				: 1
			, departure_time		: ''
			, distance				: C.ERROR_NO_ROUTE
			, seats		 			: 1
			, price		 			: C.MAX_PRICE
			, p1	:{ 	loc			: ''
					, 	lat			: null
					, 	lon			: null
					, 	display_name: null
				}
			, p2:	{ 	loc			: ''
					, 	lat			: null
					, 	lon			: null
					, 	display_name: null
				}
			, date1		 			: C.TODAY()
			, date2		 			: C.TODAY()
			, recur_ind				: false
			, day0_ind				: false
			, day1_ind				: false
			, day2_ind				: false
			, day3_ind				: false
			, day4_ind				: false
			, day5_ind				: false
			, day6_ind				: false
			, description			: ''
			}
	}

	static onError(error) {
			console.log(`Error: ${error}`);
	}

	static reset_zoom() {
		console.debug('201810272157 Util.reset_zoom enter');
		let browser=window['chrome'] ;
		if ( browser ) {
			if(browser.tabs) {
			let func_var = Util.onGot_reset;
			let gettingZoom = browser.tabs.getZoom(function(zoom) { func_var(zoom)});
			//gettingZoom.then(Util.onGot_reset, Util.onError);
			} else {
				console.debug('201810272157 Util.reset_zoom browser.tabs==null');
			}
			
		}
		else {
			console.debug('201810272157 Util.reset_zoom browser == null');
		}
		
	}

	static onGot_reset(zoom) {
		console.debug('201810272157 Util.onGot_reset zoom=', zoom);
		if (zoom==1) return;
		let browser=window['chrome'] ;
		if ( browser) {
			var setting = browser.tabs.setZoom(1.0);
		//	setting.then(null, Util.onError);
			//	console.log(zoom);
		}
	}

	static convert_pair_to_trip(pair): any| null {
		if(!pair) return null;
		let p1=pair.p1;
		let p2=pair.p2;
			
		if(p1) {
			pair.start_loc			=p1.loc
			pair.start_lat			=p1.lat
			pair.start_lon			=p1.lon
			pair.start_display_name	=p1.display_name ;
		}
		if(p2) {
			pair.end_loc			=p2.loc
			pair.end_lat			=p2.lat
			pair.end_lon			=p2.lon
			pair.end_display_name	=p2.display_name ;
		}
		if(pair.date1)	pair.start_date	=pair.date1;
		if(pair.date2)	pair.end_date	=pair.date2;
		return pair;
	}

	static convert_pair_to_book(pair): any| null {
		if(!pair) return null;
		let p1=pair.p1;
		let p2=pair.p2;
			
		if(p1) {
			pair.pickup_loc=p1.loc
			pair.pickup_lat=p1.lat
			pair.pickup_lon=p1.lon
			pair.pickup_display_name=p1.display_name ;
		}
		if(p2) {
			pair.dropoff_loc=p2.loc
			pair.dropoff_lat=p2.lat
			pair.dropoff_lon=p2.lon
			pair.dropoff_display_name=p2.display_name ;
		}
		return pair;
	}

    static convert_book_to_pairs(book: any): any|null {
        if(!book) return null;
		if (!book.p1 || ! book.p1.lat) {
        	book.p1 ={
                  loc      : book.start_loc
                , lat      : book.start_lat
                , lon      : book.start_lon
                , display_name  : book.start_display_name
                //, marker_text   : book.pickup_marker_text
                //, icon_type     : book.pickup_icon_type
                //, color    : book.pickup_color
            };
		}
		if (!book.p2 || ! book.p2.lat) {
        	book.p2 ={
                  loc      : book.end_loc
                , lat      : book.end_lat
                , lon      : book.end_lon
                , display_name  : book.end_display_name
                //, marker_text   : book.dropoff_marker_text
                //, icon_type     : book.dropoff_icon_type
                //, color    : book.dropoff_color
            };
		}
		if (!book.rp1 || ! book.rp1.lat) {
        	book.rp1 ={
                  loc      : book.pickup_loc
                , lat      : book.pickup_lat
                , lon      : book.pickup_lon
                , display_name  : book.pickup_display_name
                //, marker_text   : book.pickup_marker_text
                //, icon_type     : book.pickup_icon_type
                //, color    : book.pickup_color
            };
		}
		if (!book.rp2 || ! book.rp2.lat) {
        	book.rp2 ={
                  loc      : book.dropoff_loc
                , lat      : book.dropoff_lat
                , lon      : book.dropoff_lon
                , display_name  : book.dropoff_display_name
                //, marker_text   : book.dropoff_marker_text
                //, icon_type     : book.dropoff_icon_type
                //, color    : book.dropoff_color
            };
		}
        return book;
    }
}

/*
export class CookieService {
		constructor() { } ;
	
	static setCookie (cname, cvalue, exhours) {
			let d = new Date();
		d.setTime(d.getTime() + (exhours*60*60*1000));
			let expires = "expires="+ d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	static getCookie (cname) : string {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) === ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
}
*/


export class CryptoService {
//private static forge = new Forge();

	private static salt_hex ="d043f85493366994d4e73441e2bd387be856c815a924ffb295ee53125df26d8b";
	private static salt = forge.util.hexToBytes(CryptoService.salt_hex);
	//rideCrypt.salt = forge.random.getBytesSync(32);
	private static numIterations = 10;
	private static key = forge.pkcs5.pbkdf2('password', CryptoService.salt, CryptoService.numIterations, 16);
	private static iv = forge.util.hexToBytes(CryptoService.salt_hex);

	constructor(	) {
	}


	// generate a random key and IV
	// Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256

	/* alternatively, generate a password-based 16-byte key
	var salt = this.forge.random.getBytesSync(128);
	var key = this.forge.pkcs5.pbkdf2('password', salt, numIterations, 16);
	*/

	// encrypt some bytes using CBC mode
	// (other modes include: ECB, CFB, OFB, CTR, and GCM)
	// Note: CBC and ECB modes use PKCS#7 padding as default

	static encrypt	(content : string) : string {
		let cipher = forge.cipher.createCipher('AES-CBC', CryptoService.key);
		cipher.start({iv: CryptoService.iv});
		cipher.update(forge.util.createBuffer(content));
		cipher.finish();
		let encrypted = cipher.output;
		let hex = encrypted.toHex() ;
		console.info('201808171902 CryptoService.encrypt() encrypted_hex=' + hex);
		return hex;
	};

	static decrypt(encrypted_hex: string): string|null
	{
		if (encrypted_hex== undefined || encrypted_hex== null || encrypted_hex=="") return null ;
		// decrypt some bytes using CBC mode
		// (other modes include: CFB, OFB, CTR, and GCM)
		let encrypted = forge.util.hexToBytes(encrypted_hex) ;
		let buffer	= forge.util.createBuffer(encrypted);

		let decipher = forge.cipher.createDecipher('AES-CBC', CryptoService.key);
		decipher.start({iv: CryptoService.iv});
		decipher.update(buffer);
		let result = decipher.finish(); // check 'result' for true/false
		// outputs decrypted hex
		let decrypted = decipher.output.toString('utf8') ;
		console.info("201808171500 CryptoService.decrypt() decrypted=" + decrypted);
		return decrypted;
	}

	private byteToHexString (uint8arr: Uint8Array) {
		if (!uint8arr) {
			return '';
		}
			
		var hexStr = '';
		for (var i = 0; i < uint8arr.length; i++) {
			var hex = (uint8arr[i] & 0xff).toString(16);
			hex = (hex.length === 1) ? '0' + hex : hex;
			hexStr += hex;
		}
			
		return hexStr.toUpperCase();
	}
	
	private hexStringToByte (str: String): Uint8Array {
		if (!str) {
			return new Uint8Array();
		}
		var a = [];
		for (var i = 0, len = str.length; i < len; i+=2) {
			a.push(parseInt(str.substr(i,2),16));
		}
		return new Uint8Array(a);
	}
}

export class StorageService {
	static setLocal(key: string, value: any): void{
		localStorage.setItem(key, value);
	}
	static getLocal(key: string): any{
		let value=localStorage.getItem(key);
		return value;
	}
	static setSession(key: string, value: any): void{
		sessionStorage.setItem(key, value);
	}
	static getSession(key: string): any{
		let value=sessionStorage.getItem(key);
		return value;
	}

	static storeForm(key : string, json_value) : void {
		StorageService.setLocal(key, C.stringify(json_value));
	}

	static getForm(key) : any{
		console.debug('StorageService.getForm() 201809241133 key =' + key);
		let form_value= StorageService.getLocal (key);
		if (form_value== undefined || form_value == null) return null;
		console.debug('StorageService.getForm() 201809241133 form_value =' + form_value);
		let form_value1 = JSON.parse(form_value);

		//console.info('201809241146 form_value1 =' + C.stringify(form_value1));
		return form_value1;
	}
}
