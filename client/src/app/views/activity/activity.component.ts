import { Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { NgZone	} from '@angular/core';
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
import { Subscription }	from 'rxjs';

import { EventEmitter, Input, Output} from '@angular/core';

import { AppComponent } from '../../app.component';
import { C } from '../../models/constants';
//import { UserService } from '../../models/gui.service';
import { Util } from '../../models/gui.service';
import { StorageService } from '../../models/gui.service';
import { BaseComponent } from '../base/base.component';

@Component({
	selector: 'app-activity'
	,	templateUrl: './activity.component.html'
	,	styleUrls: ['./activity.component.css']
	,	changeDetection: ChangeDetectionStrategy.OnPush 	// prevent change detection unless @Input reference is changed
})

export class ActivityComponent extends BaseComponent {
	bookings_from_db: any= [];
	filter:any ;

	constructor( public changeDetectorRef: ChangeDetectorRef
	//	, private zone: NgZone
	){
		super(changeDetectorRef);

		console.debug("201809262245 ActivityComponent.constructor() enter")	;
		this.page_name=C.PAGE_ACTIVITY;
		console.debug("201809262245 ActivityComponent.constructor() exit")	;
	}


	ngoninit() {
		let form_value_from_storage = StorageService.getForm(C.KEY_FORM_ACTIVITY);
		if ( !form_value_from_storage ) {

			form_value_from_storage= {
				date1					:	C.TODAY()
			,	date2					:	''
			,	show_driver				:	true
			,	show_rider				: 	true
			,	show_seats_available	: 	true
			,	show_pending			: 	true
			,	show_confirmed			: 	true
			,	show_rejected			: 	false
			,	show_cancelled_by_driver: 	false
			,	show_cancelled_by_rider	: 	false
			,	show_finished			: 	true
			};
		}
		StorageService.storeForm(C.KEY_FORM_ACTIVITY, form_value_from_storage); 

		let f= form_value_from_storage ;
		
		this.form = this.form_builder.group({
			date1					: [f.date1, [Validators.min]]
		,	date2					: [f.date2, [Validators.min] ]
		,	show_driver				: [f.show_driver, [] ]
		,	show_rider				: [f.show_rider, [] ]
		,	show_seats_available	: [f.show_seats_available, [] ]
		,	show_pending			: [f.show_pending, [] ]
		,	show_confirmed			: [f.show_confirmed, [] ]
		,	show_rejected			: [f.show_rejected, [] ]
		,	show_cancelled_by_driver: [f.show_cancelled_by_driver, [] ]
		,	show_cancelled_by_rider	: [f.show_cancelled_by_rider, [] ]
		,	show_finished			: [f.show_finished, [] ]
		});
		this.filter= this.form.value;

		this.onChange();
	}

	onChange()
	{
		this.reset_msg();
		this.warning_msg='loading ...' ;
		this.changeDetectorRef.detectChanges();

		StorageService.storeForm(C.KEY_FORM_ACTIVITY, this.form.value); 

		this.bookings_from_db = [] ;	 //remove list of journeys
		let bookings_from_db_observable	
			= this.dbService.call_db(C.URL_ACTIVITY, this.form.value);
		bookings_from_db_observable.subscribe(
			bookings_from_db => {
				console.debug("201810071557 ActivityComponent.onChange() bookings_from_db ="
					 , C.stringify(bookings_from_db));
				this.reset_msg();
				this.bookings_from_db = bookings_from_db ;	
				if (this.bookings_from_db.length==0) this.warning_msg='Nothing found' ; 
				else this.info_msg =`Found ${this.bookings_from_db.length} activities before filtering.`	;
				this.set_filter();
				this.changeDetectorRef.detectChanges();
			},
			error	=> { 
				this.reset_msg();
				this.error_msg= error;
				this.changeDetectorRef.detectChanges();
			}
		)
		
	}

	set_filter()
	{
		StorageService.storeForm(C.KEY_FORM_ACTIVITY, this.form.value); 
		this.filter= this.form.value;

		for ( let index in this.bookings_from_db) {
			this.bookings_from_db[index].show_booking
				=this.show_booking(this.bookings_from_db[index], Number(index));
			
		}
		// change this.bookings_from_db reference, so the bookings component can refresh
		let tmp= this.bookings_from_db;
		this.bookings_from_db =[];
		this.changeDetectorRef.detectChanges();
		this.bookings_from_db = tmp;
		this.changeDetectorRef.detectChanges();
	}

	show_booking(booking: any, index: number): boolean {
		console.debug("201810131007 BookingsComponent.show_this() booking.status_cd="
			, booking.status_cd)	;
		console.debug("201810131007 BookingsComponent.show_this() index=", index)	;
		console.debug("201810131007 BookingsComponent.show_this() this.filter"
			, this.filter)	;
		let status	=false;
		if		(booking.status_cd =='P' && this.filter.show_pending			) status=true;
		else if (booking.status_cd =='B' && this.filter.show_confirmed			) status=true;
		else if (booking.status_cd =='J' && this.filter.show_rejected			) status=true;
		else if (booking.status_cd =='D' && this.filter.show_cancelled_by_driver) status=true;
		else if (booking.status_cd =='R' && this.filter.show_cancelled_by_rider ) status=true;
		else if (booking.status_cd =='F' && this.filter.show_finished			) status=true;
		else if (booking.status_cd =='S' && this.filter.show_seats_available	) status=true;
		else if (booking.status_cd ==null && this.filter.show_seats_available	) status=true;

		let ret=false;
		if ( booking.is_rider && this.filter.show_rider && status) ret= true;
		else if ( booking.is_driver && this.filter.show_driver && status) ret= true;

		console.debug("201810131045 BookingsComponent.show_this() ret="+ ret)	;

		return ret;
	}


	subscription_action(msg): void {
		if (msg != undefined && msg != null && msg.msgKey == C.MSG_KEY_SHOW_ACTIVITY_BODY) {
			this.show_body = msg.show_body;
		}
		else {
			console.debug('201810211444 ActivityComponent.subscription_action() ignore msg');
		}

		
	}
}


