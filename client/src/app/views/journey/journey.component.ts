// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { NgZone  } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { ValidatorFn } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import { AbstractControl} from '@angular/forms';
import { Subscription }   from 'rxjs';

import { EventEmitter, Input, Output} from '@angular/core';

import {GeoService} from '../../models/remote.service' ;
import {DBService} from '../../models/remote.service' ;
import {CommunicationService} from '../../models/communication.service' ;
import { AppComponent } from '../../app.component';
import { C } 			from '../../models/constants';
import { StorageService } from '../../models/gui.service';
import { UserService } from '../../models/gui.service';
import { DotIcon } from '../../models/map.service';
import { PinIcon } from '../../models/map.service';
import { MapService } from '../../models/map.service';
import { BaseComponent      } from '../base/base.component' ;



@Component({
  selector	: 'app-journey'			,
  templateUrl	: './journey.component.html'	,
  styleUrls	: ['./journey.component.css']	,
  changeDetection: ChangeDetectionStrategy.OnPush ,  // prevent change detection unless @Input reference is changed
})

export class JourneyComponent extends BaseComponent {

    journeys_from_db: any ;

	rider_criteria :any= null

	constructor(
		 public changeDetectorRef	: ChangeDetectorRef
	////	, private zone: NgZone
	){ 
		super(changeDetectorRef);
  		console.debug("201809262245", this.class_name, ".constructor() enter")  ;

		this.journeys_from_db = this.Util.deep_copy(this.Status.search_result);

  		console.debug("201809262245 JourneyComponent.constructor() this.journeys_from_db=\n"
				, C.stringify(this.journeys_from_db))  ;
		this.rider_criteria = this.Status.rider_criteria;

  		console.debug("201809262245", this.class_name, ".constructor() exit")  ;
  	} 

	ngoninit() {
		//this.subscription1 
			//= this.form.valueChanges.subscribe(data => console.log('Form value changes', data));
		//this.subscription2 
			//= this.form.statusChanges.subscribe(data => console.log('Form status changes', data));

		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});

		if (this.journeys_from_db.length==0) this.warning_msg='Nothing found'
		else this.info_msg='Found ' + this.journeys_from_db.length; 

		for ( let index in this.journeys_from_db) {
			let j = this.journeys_from_db[index];

			if ( ! this.is_signed_in) j.status_msg = 'Please sign in';
			else if ( ! j.sufficient_balance ) j.status_msg = 'Insufficient<br/>balance';
			else j.status_msg=null ;


			j.show_book_button
				= 	this.is_signed_in 
					&& j.sufficient_balance
					&& Number(this.rider_criteria.distance);

			this.Util.convert_book_to_pairs(j);


			j.google_map_url
				= MapService.google_map_string_from_points([
									 j.p1
									, this.rider_criteria.p1
									, this.rider_criteria.p2
									, j.p2
					]);

		}
		this.communicationService.send_msg(C.MSG_KEY_MARKER_BOOKS, this.journeys_from_db);
		this.mark_rider_pair();
  	}

	mark_rider_pair(){
		if(this.rider_criteria){
	    	let pair = this.Util.deep_copy ( this.rider_criteria);
			pair.p1.icon_type=PinIcon;
			pair.p2.icon_type=PinIcon;
			pair.line_color =C.MAP_LINE_COLOR_RIDER;
	    	this.communicationService.send_msg(C.MSG_KEY_MARKER_PAIR, pair);
		}
	}

	book(journey: any): void {
		let book_to_db = this.Util.deep_copy(this.rider_criteria);
		this.Util.convert_pair_to_book(book_to_db);	

		book_to_db.journey_id = journey.journey_id ;
		let book_from_db_observable     = this.dbService.call_db(C.URL_BOOK, book_to_db);
		book_from_db_observable.subscribe(
	    	book_from_db => {
				console.debug("201808201201 JourneyComponent.book() book_from_db =" + C.stringify(book_from_db));
				if (book_from_db.status_cd=='P') journey.info_msg='Booked, pending<br/>confirmation' ;
				if (book_from_db.status_cd=='!P') journey.error_msg='Booking failed' ;
				journey.show_book_button= book_from_db.status_cd!='P';
				journey.seats_booked= journey.seats_booked
							+ book_from_db.seats;
				this.changeDetectorRef.detectChanges();
				
			},
			_ => {
				journey.info_msg=null;
				journey.error_msg='Booking failed';
				this.changeDetectorRef.detectChanges();
			}
		)
		
	}

	show_map(index: number){
		this.show_body =	C.BODY_NOSHOW;
		//this.communicationService.send_msg(C.MSG_KEY_MAP_BODY_SHOW, {});
		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});
		this.communicationService.send_msg(C.MSG_KEY_MARKER_BOOKS, this.journeys_from_db);

		let j = this.journeys_from_db[index];
		//this.place_all_markers();
		C.convert_trip_to_pair(j);
		this.communicationService.send_msg(C.MSG_KEY_MARKER_FIT, j);
		//j.line_color = C.MAP_LINE_COLOR_HIGHLIGHT;
		j.line_weight = C.MAP_LINE_WEIGHT_HIGHLIGHT;
		this.communicationService.send_msg(C.MSG_KEY_MAP_LINE, j);
		this.mark_rider_pair();
	}
}
