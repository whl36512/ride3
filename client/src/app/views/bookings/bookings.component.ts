// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component} 						from '@angular/core';
import { HostListener } 					from '@angular/core';
//import { NgZone	} 						from '@angular/core';
import { ChangeDetectionStrategy } 			from '@angular/core';
import { ChangeDetectorRef } 				from '@angular/core';
import { FormControl } 						from '@angular/forms';
import { FormGroup } 						from '@angular/forms';
import { FormArray } 						from '@angular/forms';
import { FormBuilder } 						from '@angular/forms';
import { Validators } 						from '@angular/forms';
import { ValidatorFn } 						from '@angular/forms';
import { ValidationErrors } 				from '@angular/forms';
//import { AbstractControl} 				from '@angular/forms';
import { Subscription }						from 'rxjs';
//import { EventEmitter} 					from '@angular/core';
import { Input} 							from '@angular/core';
//import { Output} 							from '@angular/core';
import { Router                 }   from '@angular/router';


import { AppComponent } 					from '../../app.component';
//import { Constants } 						from '../../models/constants';
import { C } 								from '../../models/constants';
import { BaseComponent } 					from '../base/base.component';
import { StorageService } 					from '../../models/gui.service';
import { Util } 							from '../../models/gui.service';
import { CommunicationService} 			from '../../models/communication.service' ;
import { DBService} 						from '../../models/remote.service' ;
import { GeoService} 						from '../../models/remote.service' ;
import { MapService } 						from '../../models/map.service';

//import { UserService } 					from '../../models/gui.service';


@Component({
	selector	: 'app-bookings'		,
	templateUrl	: './bookings.component.html'	,
	styleUrls	: ['./bookings.component.css']	,
	changeDetection: ChangeDetectionStrategy.OnPush ,	// prevent change detection unless @Input reference is changed
})

export class BookingsComponent extends BaseComponent {
	@Input()
	bookings_from_db: any;

	//@HostListener('keydown', ['$event']) 
	onAnyEvent(e) {
			 console.debug('201810131753 BookingsComponent.onAnyEvent() event=', e);
		}

	forms: any =[];

    constructor( public changeDetectorRef       : ChangeDetectorRef
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )  {
        super(changeDetectorRef,mapService, communicationService, dbService
                , geoService, form_builder, router );


		console.debug("201809262245 BookingsComponent.constructor() enter")	;
/*
		this.subscription1 =this.communicationService.msg.subscribe(
			msg	=> {
				console.debug("201810211343 BookingsComponent.subscription1. msg=\n"
					, C.stringify(msg));
				if (msg != undefined && msg != null && msg.msgKey == C.MSG_KEY_MSG_PANEL) {
					this.bookings_from_db[msg.index].show_messaging_panel
						=msg.show_messaging_panel;
					this.reset_msgs(msg.index);
					this.changeDetectorRef.detectChanges();
				}
				else {
					console.debug("201810211344 Map2Component.subscription1. ignore msg");
				}
			}
		);
*/
			console.debug("201809262245 BookingsComponent.constructor() exit")	;
		} 

	ngoninit():void {
		console.debug("201809262246 BookingsComponent.ngOnInit() this.bookings_from_db = "
			+ C.stringify(this.bookings_from_db) );
		//this.subscription1 
		//	= this.form.valueChanges.subscribe(data => console.log('Form value changes', data));
		//this.subscription2 
		//	= this.form.statusChanges.subscribe(data => console.log('Form status changes', data));

		for ( let index in this.bookings_from_db) { // for.. in.. creates index, not object
			let b = Util.convert_book_to_pairs(this.bookings_from_db[index]) ;
			this.reset_msgs(Number(index));
			this.reset_button(Number(index));
			b.google_map_url = MapService.google_map_string_from_points
									([ b.p1 ,	b.rp1 ,	b.rp2 , b.p2 ]);
			this.add_form(b);


			if (	b.is_driver){
				b.show_update_button
					= b.book_id == null ;
				b.show_confirm_button
					= b.status_cd == 'P' ;
				b.show_reject_button
					= b.status_cd == 'P' ;
				b.show_driver_cancel_button	
					= b.status_cd == 'B' ;
			}
			else if ( b.is_rider) {
				b.show_rider_cancel_button	
					= b.status_cd == 'B' 
					|| b.status_cd == 'P' ;

				b.show_finish_button	
					= b.status_cd == 'B' ;
			}
			b.show_msg_button
					= b.status_cd != 'P'
					 && b.book_id != null ;
		}

	}
	
	subscription_action ( msg: any): void{
	// overides BaseComponent.subscription_action
		//if (msg && msg.msgKey == C.MSG_KEY_MSG_PANEL) {

		if (msg.msgKey == C.MSG_KEY_MSG_PANEL) { //close msg panel
			let index = msg.body.index;
			let b = this.bookings_from_db[index] ;
			b.show_messaging_panel
				=msg.body.show_messaging_panel;
			this.reset_msgs(index);
			this.changeDetectorRef.detectChanges();
		}
		else {
			console.debug("201810211344" , this.class_name , ".subscriptio_action(). ignore msg");
		}
	}

	add_form (booking: any) : void {
		//console.debug("201810072302 BookingsComponent.add_form() booking = " + C.stringify(booking) );
		let form = this.form_builder.group({
				journey_id	: [booking.journey_id, []],
				book_id	 : [booking.book_id, []],
				seats	: [booking.seats, []],
				price	: [booking.price, []],
				}
			);
		console.debug("201810072247 BookingsComponent.add_form() form="+ C.stringify(form.value));

		this.forms.push(form);

	}

	reset_msgs(index: number) : void{
		this.bookings_from_db[index].fail_msg=null;
		this.bookings_from_db[index].update_msg=null;
		super.reset_msg();
	}

	reset_button(index: number) : void{
		this.bookings_from_db[index].show_driver_cancel_button=false;
		this.bookings_from_db[index].show_rider_cancel_button=false;
		this.bookings_from_db[index].show_reject_button=false;
		this.bookings_from_db[index].show_confirm_button=false;
		this.bookings_from_db[index].show_finish_button=false;
		this.bookings_from_db[index].show_msg_button=false;
	}

	update(form: any, index: number): void {
			console.debug("201809261901 BookingsComponent.update() form=" 
			, C.stringify(form.value) );
		this.reset_msgs(index); // remove msg and show it again, so fade would work
		this.changeDetectorRef.detectChanges() ;
		let booking_to_db = form.value;
		if ( booking_to_db.price== this.bookings_from_db[index].price
			&& booking_to_db.seats == this.bookings_from_db[index].seats)
		{
			this.bookings_from_db[index].update_msg=C.OK_NO_CHANGE ;
			this.changeDetectorRef.detectChanges() ;
			return;
		}
		let data_from_db_observable	 = this.dbService.call_db(C.URL_UPD_JOURNEY, booking_to_db);
		data_from_db_observable.subscribe(
				journey_from_db => {
				console.debug("201810072326 BookingsComponent.update() journey_from_db =" 
					, C.stringify(journey_from_db));

				this.bookings_from_db[index].update_msg=C.OK_UPDATE;
				this.bookings_from_db[index].seats=journey_from_db.seats;
				this.bookings_from_db[index].price=journey_from_db.price;
				this.changeDetectorRef.detectChanges() ;
				
			},
			error => {
				this.error_msg=error;
				this.bookings_from_db[index].fail_msg='Action Failed';
				this.changeDetectorRef.detectChanges() ;
			}
		) ;
	}

	action(form: any, index: number, action : string): void {
		this.reset_msgs(index); // remove msg and show it again, so fade would work
		this.changeDetectorRef.detectChanges();	// have to do this so fade would work
			console.debug("201809261901 BookingsComponent.action() form=" 
			+ C.stringify(form.value) );
		let booking_to_db = form.value;
		let booking_from_db_observable	 
			= this.dbService.call_db(action, booking_to_db);
		booking_from_db_observable.subscribe(
				booking_from_db => {
				console.debug("201810072326 BookingsComponent.action() booking_from_db =" 
			, C.stringify(booking_from_db));
				
				
				if ( booking_from_db.status_cd==this.bookings_from_db[index].status_cd){
					// no status_cd change
					this.bookings_from_db[index].faile_msg='Action Failed';
				}
				else if ( booking_from_db.status_cd == 'B') {
					this.bookings_from_db[index].status_cd= booking_from_db.status_cd;
					this.reset_button(index);
					this.bookings_from_db[index].book_status_description='Confirmed';
					this.bookings_from_db[index].show_msg_button=true;
					this.bookings_from_db[index].show_rider_cancel_button
						=this.bookings_from_db[index].is_rider;
					this.bookings_from_db[index].show_driver_cancel_button
						= this.bookings_from_db[index].is_driver ;
				}
				else if ( booking_from_db.status_cd == 'J') {
					this.bookings_from_db[index].status_cd= booking_from_db.status_cd;
					this.reset_button(index);
					this.bookings_from_db[index].book_status_description='Rejected';
				}
				else if ( booking_from_db.status_cd == 'D') {
					this.bookings_from_db[index].status_cd= booking_from_db.status_cd;
					this.reset_button(index);
					this.bookings_from_db[index].book_status_description='Cancelled'
				}
				else if ( booking_from_db.status_cd == 'R') {
					this.bookings_from_db[index].status_cd= booking_from_db.status_cd;
					this.reset_button(index);
					this.bookings_from_db[index].book_status_description='Cancelled'
				}
				else if ( booking_from_db.status_cd == 'F') {
					this.bookings_from_db[index].status_cd= booking_from_db.status_cd;
					this.reset_button(index);
					this.bookings_from_db[index].book_status_description='Finished'
				}
				
				this.changeDetectorRef.detectChanges();
				
			},
			error => {
				//this.error_msg=error;
				this.bookings_from_db[index].fail_msg=C.ACTION_FAIL;
				this.changeDetectorRef.detectChanges();
			}
		)
		
	}

	message(form: any, index: number, action : string): void {
		this.reset_msgs(index); // remove msg and show it again, so fade would work
		this.bookings_from_db[index].show_messaging_panel 
			= !this.bookings_from_db[index].show_messaging_panel;
		this.changeDetectorRef.detectChanges();	
	}
	
	geo_mark(index: number) : void {
		
		this.communicationService.send_msg(C.MSG_KEY_MAP_BODY_SHOW, {});

		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});	
		let b = Util.deep_copy(this.bookings_from_db[index]);
		this.mapService.mark_book( b, index, false)
		this.mapService.fit_book( b)
		this.communicationService.send_msg(C.MSG_KEY_SHOW_ACTIVITY_BODY,{show_body: C.BODY_NOSHOW});
	}
}
