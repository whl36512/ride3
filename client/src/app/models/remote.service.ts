import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http'; 
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

import { pipe, range, timer, zip, of } from 'rxjs';
//import { ajax } from 'rxjs/ajax';
import { retryWhen, map, mergeMap } from 'rxjs/operators';

//import {CookieService} 	from './gui.service' ;
import {StorageService} 	from './gui.service' ;
import {CryptoService} 	from './gui.service' ;
import {Util} 		from './gui.service' ;
import {UserService} 		from './gui.service' ;
import {C} 	from './constants' ;

// code sample from https://angular.io/guide/http


@Injectable({
  providedIn: 'root'
})
export class HttpService {
//documentation : https://angular.io/api/common/http/HttpClient
	body : any ={};
	completed : boolean= false;
	constructor(private httpClient: HttpClient) { }

	//private static httpClient= HttpClient; 
	//constructor() { }

	request( method: string, url: string, payload: string) : Observable<any>
	{
		var response: Observable<HttpResponse<string>> ; 
		let httpHeaders = new HttpHeaders({
			'Content-Type' : 'application/json',
			'Cache-Control': 'no-cache'
		});    

		//let params= new HttpParams().set('format', 'json').set('polygon', '0').set('addressdetails','0);

		let options = {
			//body: null,
			//headers: null ,
			headers: httpHeaders ,
			//params : params ,
			observe: 'response',  //observe : 'response' for complete response. 
			//observe : 'body' , //for response with body. this is default
			//observe : 'events' , // for response with events. 
			responseType: 'text'  // The values of responseType are arraybuffer, blob, json and text. json is default
			//responseType: 'json' , // The values of responseType are arraybuffer, blob, json and text. json is default
			//reportProgress: false,
			//withCredentials: false
		};        
		console.info("201808182256 HttpService.request() url=" + url);
		// documentattion :  https://angular.io/api/common/http/HttpClient
		if (payload == null) {
			//let response : Observable<HttpResponse<string>> = this.httpClient.request('GET', url, options)  ; //this cause assignment error. Not assignable. Why?
			//response = HttpService.httpClient.request(method, url, {observe: 'response',responseType: 'text'})  ;
			response = this.httpClient.get( url, {observe: 'response',responseType: 'text'})  ;
		}
		else 
		{
			console.info("201808190202 HttpService.request() payload=\n" 
				, C.stringify(JSON.parse(payload)));
			//response = this.httpClient.request(method, url, {body: payload, observe: 'response',responseType: 'text', headers: httpHeaders});
			response  = this.httpClient.post( url, payload, {observe: 'response',responseType: 'text', headers: httpHeaders});
		}
		//return response.pipe(this.backoff(3,250));

		let json_response = response
			.pipe (
				retry(3), // retry a failed request up to 3 times
				tap( // Log the result or error
					res => {
							//this.log(filename, data),
							console.log( "201808200808 HttpService.request tap res =\n" , C.stringify(res) )
						} ,
					error =>{
							//this.logError(filename, error)
							console.log( "201808200808 HttpService.request tap error =\n" , C.stringify(error) )
						}
				), 
				catchError(this.handleError),
				map(res => JSON.parse(res.body))    //convert Observable<HttpResponse<string>> to Observable<any>. map must be inside pipe for angular 6
			);

			return json_response; //  this is Observable<Json object>
	}

/*
	subscribe(response: Observable<HttpResponse<string>> ) 
	{
		response.subscribe(
		       res => 	{ 
					console.info("201808151825 httpClient subscribe() res.body=\n");
					console.info(res.body);
					//console.log(res.headers.get('Content-Type'));		
					this.body= JSON.parse(res.body);
				},
			(err: HttpErrorResponse) => {
				if (err.error instanceof Error) {
				//A client-side or network error occurred.				 
					console.error('201808152105 An error occurred:', err.error.message);
					this.body = {"error": err.error.message} ;
					
				} 
				else 
				{
					//Backend returns unsuccessful response codes such as 404, 500 etc.				 
					console.error('201808152106 Backend returned status code: ', err.status);
					console.error('201808152106 Response body:', err.error);
					this.body = {"error": err.error.message} ;
				}
			},
			()	=> 
			{
					console.log("onCompleted" );     //onCompleted
					this.completed=true;
			}
		);

		for (var i=0; i<10 ; i++)
		{
			let interval = 200 ;
			console.log("201808200850 HttpService.subscribe() this.completed= ", this.completed);
			if (!this.completed) {
				Util.sleepFor(interval );
				console.log(`201808200850 HttpService.subscribe() waited ${interval} ms x ${i} `);
			}
			else break;

		}
		console.log("201808200856  HttpService.subscribe() return this.body=\n" 
			, C.stringify(this.body) ); 

		
	}
*/

	/*
	backoff(maxTries, ms) {
		return 
			pipe(
	    			retryWhen(attempts => range(1, maxTries)
	         				.pipe(
		        				zip(attempts, (i) => i),
			       				map(i => i * i),
			              			mergeMap(i =>  timer(i * ms))
				           	)
				)
		      	);
	}
	*/

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('201808200752 HttpService.handleError() An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error( ` 201808200750 HttpService.handleError() Backend returned code ${error.status}, body was: ${error.error}`);
		}
			// return an observable with a user-facing error message
		return throwError( '201808200751 HttpService.handleError() Something bad happened; please try again later.');
	};
}

@Injectable({
  providedIn: 'root'
})


export class DBService {
	private static root_url  = window.location.protocol + C.URL_SERVER  ;

	constructor(private httpService: HttpService){
		console.debug('201811180021 DBService.constructor() root_url=', DBService.root_url);

	}

	call_db(relative_url: string, payload: any) : Observable<any> {  
		let combined_payload = this.package_payload(payload);
		let complete_url = DBService.root_url + relative_url ;
		let response_body = this.httpService.request(C.POST, complete_url , C.stringify(combined_payload));
		return response_body;
	}

	package_payload(payload) : any {
		let jwt=  UserService.get_jwt_from_session();
		let profile = UserService.get_profile_from_session()
		// add profile into the payload. server side must compare jwt and profile to make sure they match
		let combined_payload = {...payload, ...profile, ...jwt };  
		console.info("201808190206 DBService.package_payload() after adding jwt and profile"
			, "combined_payload=\n" 
			, C.stringify(combined_payload));
		return combined_payload;
	}

/*
	get_user_from_db(user: any): Observable<any> {
		return this.call_db(C.GET_USER_URL, user);
	}

	save_user_to_db(user: any) : any {
		return this.call_db(C.SAVE_USER_URL, user);
	}

	upd_trip(trip: any) :  Observable<any> {
		return this.call_db(C.UPD_TRIP_URL, trip);
	}

	get_journeys_from_db(trip:any): Observable<any> {
		return this.call_db(C.URL_MYOFFERS, trip);
	}
*/



/*
	private add_token( relative_url: string, payload: any): any
	{
		var combined_payload: any;
		console.debug("201808190219 DBService.add_token() typeof(payload)="+ typeof(payload)) ;
		if (typeof(payload) == 'string' ) payload = JSON.parse(payload);
		console.debug("201808190230 DBService.add_token after JSON.parse. payload=\n" ,
			, C.stringify(payload));
		let jwt=  UserService.get_jwt_from_session();
		let profile = UserService.get_profile_from_session()
		combined_payload = {...payload, ...profile, ...jwt };  // add profile into the payload. server side must compare jwt and profile to make sure they match
		console.debug("201810062319 DBService.add_token after combining. combined_payload=\n"
			, C.stringify(combined_payload));
		return combined_payload;
	}
*/
}

@Injectable({
  providedIn: 'root'
})
export class GeoService {
	//private static httpClient: HttpClient = HttpClient
	private protocol = window.location.protocol;

	constructor(private httpService: HttpService){}

	private routingUrl(start_lat, start_lon, end_lat, end_lon){
		//let url= "https://router.project-osrm.org/route/v1/driving/" ;
		let points=start_lon+","+ start_lat + ";" + end_lon+ ","+ end_lat  ;
		let query="?overview=false"  ;
		let encodedUrl=this.protocol+C.URL_ROUTING+points+query ;
		return encodedUrl;
	}

	routing(start_lat, start_lon, end_lat, end_lon) : Observable<any> {
		// curl 'http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=false'
		// response: {"routes":[{"legs":[{"summary":"","weight":534.5,"duration":354.1,"steps":[],"distance":1880.2},{"summary":"","weight":679.8,"duration":483.4,"steps":[],"distance":2947.6}],"weight_name":"routability","weight":1214.3,"duration":837.5,"distance":4827.8}],"waypoints":[{"hint":"09sJgLtb54QkAAAADwAAAAMAAAAAAAAAeOI0QY6li0FoZYRAAAAAACQAAAAPAAAAAwAAAAAAAACyowAAAEzMAKlYIQM8TMwArVghAwEA3wqcmk-F","name":"Friedrichstraße","location":[13.3888,52.517033]},{"hint":"KpYTgKABvYEMAAAACgAAANYBAAAAAAAA4pzIQFu_j0CGdCVDAAAAAAwAAAAKAAAAXgEAAAAAAACyowAAf27MABiJIQOCbswA_4ghAwQAnxCcmk-F","name":"Torstraße","location":[13.397631,52.529432]},{"hint":"9n8YgP___38cAAAA2AAAACIAAABQAAAAsowKQkpQX0Lx6yZC8esmQhwAAABsAAAAIgAAACkAAACyowAASufMAOdwIQNL58wA03AhAwMAvxCcmk-F","name":"Platz der Vereinten Nationen","location":[13.428554,52.523239]}],"code":"Ok"}
		let encodedUrl = this.routingUrl(start_lat, start_lon, end_lat, end_lon);

		let response_body= this.httpService.request(C.GET, encodedUrl, null) ;
		return response_body;
	}

	geocode(address: string) : Observable<any>     {
		//request:   https://nominatim.openstreetmap.org/search/135%20pilkington%20avenue,%20birmingham?format=json&polygon=0&addressdetails=0
		//response:   [{"place_id":"91015286","licence":"Data © OpenStreetMap contributors, ODbL 1.0. https:\/\/osm.org\/copyright","osm_type":"way","osm_id":"90394480","boundingbox":["52.5487473","52.5488481","-1.816513","-1.8163464"],"lat":"52.5487921","lon":"-1.8164308339635","display_name":"135, Pilkington Avenue, Sutton Coldfield, Birmingham, West Midlands Combined Authority, West Midlands, England, B72 1LH, United Kingdom","class":"building","type":"yes","importance":0.411}]

		//	address = 135%20pilkington%20avenue,%20birmingham ;

		let query="?format=json&polygon=0&addressdetails=0" ;
		let encodedUrl = this.protocol + C.URL_GEOCODE + encodeURIComponent(address) +query;
		console.debug("20180815 geocode() encodedUrl="+encodedUrl) ;
		let response_body= this.httpService.request(C.GET, encodedUrl, null) ;
		return response_body ;
	}
}
