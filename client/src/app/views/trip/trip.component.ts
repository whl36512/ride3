// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component} from '@angular/core';
import { OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl} from '@angular/forms';
//import { Subscription }	from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { Router			 }   from '@angular/router';


//import { EventEmitter, Input, Output} from '@angular/core';

import { GeoService} from '../../models/remote.service' ;
import { DBService} from '../../models/remote.service' ;
import { CommunicationService} from '../../models/communication.service' ;
import { AppComponent } from '../../app.component';
import { C} from '../../models/constants';
import { StorageService } from '../../models/gui.service';
import { Util } from '../../models/gui.service';
import { BaseComponent } from '../base/base.component' ;
import { MapService			 }   from '../../models/map.service';



@Component({
  selector	: 'app-trip'			,
  templateUrl	: './trip.component.html'	,
  styleUrls	: ['./trip.component.css']	,
  // prevent change detection unless @Input reference is changed
  changeDetection: ChangeDetectionStrategy.OnPush ,  

})

export class TripComponent extends BaseComponent {
	// when *ngIf is true, both constructor() and ngOnInit() are called. constructor is called first then ngOnInit
	// the html needs  trip to populate its input fields. If trip==undefined, angular will keep calling constructor. 
	// By initialize trip to an empty structure, repeated calling of constructor can be avoided
		form_saved_to_db: boolean=false;

	trip:any;
	step=1;
	today = C.TODAY();
	button_label = 'Publish';
	user_from_db: any = {};
	show_form	=C.BODY_NOSHOW;

	constructor( public changeDetectorRef   : ChangeDetectorRef
				, public mapService			 : MapService
				, public communicationService   : CommunicationService
				, public dbService			  : DBService
				, public geoService			 : GeoService
				, public form_builder		   : FormBuilder
				, public router				 : Router )  {
		super(changeDetectorRef,mapService, communicationService, dbService
				, geoService, form_builder, router );

		this.page_name= C.PAGE_TRIP;
  		console.log("201811011725", this.class_name, '.constructor() exit')  ;
  	} 

	ngoninit():void {
		this.setup_form();
		let data_from_db_observable	 = this.dbService.call_db(C.URL_GET_USER, {});
		data_from_db_observable.subscribe(
			user_from_db => {
				console.debug("201808201201 TripComponent.ngoninit() user_from_db =" 
					, C.stringify(user_from_db));
				this.user_from_db =user_from_db;
				if (this.user_from_db.balance==undefined || this.user_from_db.balance < 0 ) {
					this.error_msg
						='You cannnot publish any trip when your account balance is negative.<br/>'
							+ 'Please bring your account balance to 0 or positive by deposit money<br/>'
							+ 'into your account.';
					this.changeDetectorRef.detectChanges() ;
				}
				else {
					console.debug("201808201201 TripComponent.ngoninit() show form " );
					this.reset_msg() ;
					this.show_form=C.BODY_SHOW;
					this.changeDetectorRef.detectChanges() ;
				}
			},
			error => {
				this.error_msg=error;
				this.changeDetectorRef.detectChanges() ;
			}
		)
		this.changeDetectorRef.detectChanges() ;
	}

	setup_form()
	{

		let trip = StorageService.getForm(C.KEY_FORM_TRIP);
		if ( !trip ) {
			trip = this.Util.create_empty_trip();
		}
		console.debug("201810291814", this.class_name, ".ngOnInit() trip=",
			C.stringify(trip));
	
		trip.date1 =  this.today > trip.date1 ? this.today: trip.date1 ;
	
		trip.date2 = trip.date1 > trip.date2 ? trip.date1: trip.date2 ;
	
		this.trip=trip;
		StorageService.storeForm(C.KEY_FORM_TRIP, trip);

		this.form= this.form_builder.group(
			{
				//sync validators must be in an array
				p1_loc				: [trip.p1.loc, [Validators.required]], 
				//start_lat	: ['', []],	 
				//start_lon	: ['', []],	 
				//start_display_name	: ['', []], 
				p2_loc				: [trip.p2.loc, [Validators.required]], 
				//end_lat			: ['', []], 
				//end_lon			: ['', []],
				//end_display_name	: ['', []],
				date1				: [trip.date1, [Validators.required, Validators.min]], 
				departure_time		: [trip.departure_time, [Validators.required]], 
				seats				: [trip.seats, [Validators.required]], 
				price				: [trip.price, [Validators.required]], 
				recur_ind			: [trip.recur_ind, []], 
				date2				: [trip.date2,[Validators.min] ], 
				day0_ind			: [trip.day0_ind, ], 
				day1_ind			: [trip.day1_ind, ], 
				day2_ind			: [trip.day2_ind, ], 
				day3_ind			: [trip.day3_ind, ], 
				day4_ind			: [trip.day4_ind, ], 
				day5_ind			: [trip.day5_ind, ], 
				day6_ind			: [trip.day6_ind, ], 
				description			: [trip.description, ], 
			},	 
			{ 
				validator		: this.validate_trip
			}
		);
	
		this.show_map();
  	}

	form_change_action(){
		let changed_field=this.form_loc_change_detect();
		if ( changed_field) this.geocode(changed_field, this.trip, this.form) ;
	}

	onSubmit() {
		this.reset_msg() ;
			console.warn("201808201534", this.class_name, ".onSubmit() this.form.value=" 
			, C.stringify(this.form.value) );
		// save trip to db
		// combining data
		this.trip = { ...this.trip, ...this.form.value};
		this.trip.p1.loc = this.form.value.p1_loc;
		this.trip.p2.loc = this.form.value.p2_loc;
		delete this.trip.p1_loc;
		delete this.trip.p2_loc;
		StorageService.storeForm(C.KEY_FORM_TRIP, this.trip);

		let trip_to_db = Util.deep_copy( this.trip);
		// convert p1,p2, date1, date2 to column names in db 
		Util.convert_pair_to_trip(trip_to_db);

		let trip_from_db_observable	 = this.dbService.call_db(C.UPD_TRIP_URL, trip_to_db);
		trip_from_db_observable.subscribe(
				trip_from_db => {
					console.info("201808201201 TripComponent.constructor() trip_from_db =" 
						, C.stringify(trip_from_db));
					if (trip_from_db.trip_id) {
						this.form_saved_to_db=true;
						this.info_msg
							='The trip is published. Other users can start to book the trip.';
						this.button_label='Publish Another';
						this.changeDetectorRef.detectChanges() ;
					}
					else {
						this.error_msg ='Invalid data. Request to publish rejected.';
						this.changeDetectorRef.detectChanges() ;
					}
			},
			error => {
				this.error_msg=error;
				this.changeDetectorRef.detectChanges() ;
			}
		)
	}

	show_map(){
		console.debug('201810242001 TripComponent.show_map()');
		//this.communicationService.send_msg(C.MSG_KEY_MAP_BODY_SHOW, {});
		let pair = Util.deep_copy(this.trip);
		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});
		this.communicationService.send_msg(C.MSG_KEY_MARKER_PAIR, pair);
		this.communicationService.send_msg(C.MSG_KEY_MARKER_FIT, pair);
	};


	validate_trip(fg: FormGroup): ValidationErrors | null {
		console.debug('DEBUG 2018009080943 TripComponent.validate_trip() fg.value=\n' ) ; 
		console.debug(fg.value ) ; 
		//	console.debug("INFO 2018009080943 validate_trip this.trip=" + this.trip ) ;  
		/*
		if( isNaN( this.trip.distance )	|| this.trip.distance <=0 ) {
			console.log("ERROR 201807142049 validate_trip() distance unset, not routable") ; 
			return {"distance":"not routable"} ;
		}
		*/
		if (fg.value.recur_ind ===true && fg.value.date2==null ) 
		{
			console.log("ERROR 201807142049 validate_trip() recurring but end_date unset") ; 
			return {"date2":"is not set"} ;
		}
		else if (fg.value.recur_ind ===true && (fg.value.date2 <= fg.value.date1)	) 
		{
			console.log("ERROR 201807142020 validate_trip() date2 <= date1 " );
			return {"date2":"is before date1"} ;
		}
		/*
		else if (fg.value.recur_ind ===true && fg.value.date2 > this.next_n_days(fg.value.date1, 92) ) 
		{
			console.log("ERROR 201807142301  date2 - date1 = " + (fg.value.date2 - fg.value.date1) + " > 92" );
			return {"end_date":"is 92 days after start_date"} ;
		}
		*/
		else if (fg.value.recur_ind ===true && fg.value.day0_ind !== true && fg.value.day1_ind !== true 
			&& fg.value.day2_ind !== true && fg.value.day3_ind !== true && fg.value.day4_ind !== true 
			&& fg.value.day5_ind !== true && fg.value.day6_ind !== true ) {
			console.log("ERROR 201807142027  recurring but no day of week is selected" );
			return {"day of week":"is not set"} ;
		}
		return null;
	}

	next_n_days(date: string, next: number) : string{
		let one_day=1000*60*60*24;
		let since_epoch= Date.parse(date);
		let next_n_day_since_epoch= since_epoch+ next*one_day;
		let next_n_day= new Date(next_n_day_since_epoch).toJSON().slice(0,10)	
		console.log("2018009081220 next_day =" + next_n_day);
		return next_n_day;
	}

/*
  	mouseDown(event) {
			this.element = event.target;

			this.zone.runOutsideAngular(() => {
	  		window.document.addEventListener('mousemove', this.mouseMove.bind(this));
			});
	}

  	mouseMove(event) {
		event.preventDefault();
		//this.element.setAttribute('x', event.clientX + this.clientX + 'px');
		//this.element.setAttribute('y', event.clientX + this.clientY + 'px');
	}
*/

	// the getter is required for reactive form validation to work 
	get p1_loc		() { return this.form.get('p1_loc'	); }  
	get p2_loc		() { return this.form.get('p2_loc'	); }  
	get date1		() { return this.form.get('date1'	); }
	get date2		() { return this.form.get('date2'	); }
	get departure_time	() { return this.form.get('departure_time'	); }
	get seats		() { return this.form.get('seats'		); }
	get price		() { return this.form.get('price'		); }
}
