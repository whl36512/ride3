// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component} from '@angular/core';
import { HostListener } from '@angular/core';
import { NgZone	} from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Input} from '@angular/core';
//import { Output} from '@angular/core';

import { AppComponent } from '../../app.component';
import { C } from '../../models/constants';
import { BaseComponent		} from '../base/base.component' ;

import { FormBuilder            }   from '@angular/forms';
import { Router                 }   from '@angular/router';
import { CommunicationService   }   from '../../models/communication.service' ;
import { DBService              }   from '../../models/remote.service' ;
import { GeoService             }   from '../../models/remote.service' ;
import { MapService             }   from '../../models/map.service';


@Component({
		selector	: 'app-message'
	,	templateUrl	: './message.component.html'
	,	styleUrls	: ['./message.component.css']
	,	changeDetection: ChangeDetectionStrategy.OnPush
})

export class MessageComponent extends BaseComponent {
	// when *ngIf is true, both constructor() and ngOnInit() are called. constructor is called first then ngOnInit
	// the html needs	trip to populate its input fields. If trip==undefined, angular will keep calling constructor. 
	// By initialize trip to an empty structure, repeated calling of constructor can be avoided

	@Input()
		book_id: string;

	@Input()
		index: number;

	//@HostListener('keydown', ['$event']) 

	msgs_from_db: any =[];

	// close message window after fixed time 
	msg_no_activity_count_down: number = C.MSG_NO_ACTIVITY_COUNT_DOWN; 

    constructor( public changeDetectorRef       : ChangeDetectorRef
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )  {
        super(changeDetectorRef,mapService, communicationService, dbService
                , geoService, form_builder, router );

		console.debug("201809262245 MessageComponent.constructor() enter")	;

		this.timer_sub = BaseComponent.timer.subscribe(
			// val will be 0, 1,2,3,...
			val => {
				if(val >0) {
					if ( val % ( 1000/C.TIMER_INTERVAL) == 0 ) { //show count down every second
						this.msg_no_activity_count_down -= 1;
						this.changeDetectorRef.detectChanges(); 
					}
				}
				if (this.msg_no_activity_count_down <=0 ) {
					this.communicationService.send_msg(C.MSG_KEY_MSG_PANEL
						, {index:this.index 
						, show_messaging_panel:false }
					);
				}
				else {
					if ( val % ( C.MSG_TIMER_WAIT*1000/C.TIMER_INTERVAL) == 0 ) {
						this.get_msgs_from_db();
					}
				}
			},
		);
		console.debug("201809262245 MessageComponent.constructor() exit")	;
	} 

	ngoninit() {
		//this.subscription1 = this.form.valueChanges.subscribe(data => console.log('Form value changes', data));
		//this.subscription2 = this.form.statusChanges.subscribe(data => console.log('Form status changes', data));
		this.warning_msg	=	' Loading ...' ;
		this.get_form();
	}

	get_form(): void {
		this.form = this.form_builder.group({
				//book_id	: [this.book_id, []],
				msg	: ['', []],
				}
			);
	}

	action(form: any, index: number, action : string): void {
		this.reset_msg(); // remove msg and show it again, so fade would work
		this.msg_no_activity_count_down = C.MSG_NO_ACTIVITY_COUNT_DOWN ; // reset timer
		this.changeDetectorRef.detectChanges();	// have to do this so fade would work

		console.debug("201810182231 MessageComponent.action() form=" , C.stringify(form.value) );
		let msg_to_db = form.value;
		if(msg_to_db.msg.trim() === '' ) return ;
		
		msg_to_db.book_id= this.book_id;

		let data_from_db_observable	 
			= this.dbService.call_db(C.URL_SAVE_MSG, msg_to_db);

		data_from_db_observable.subscribe(
			msg_from_db => {
				this.get_form();
				msg_from_db.user_is='Me'; 
				this.msgs_from_db.push(msg_from_db);
				this.changeDetectorRef.detectChanges();
			},
			error => {
				this.error_msg=error;
				this.changeDetectorRef.detectChanges();
			}
		)
	}

	get_msgs_from_db(): void { // poll new msg from database
		this.reset_msg(); // remove msg and show it again, so fade would work
		this.changeDetectorRef.detectChanges();	// have to do this so fade would work

		var latest_c_ts = '1970-01-01';
		if ( this.msgs_from_db.length != 0) latest_c_ts = this.msgs_from_db[this.msgs_from_db.length-1].c_ts;
		let data_from_db_observable
			= this.dbService.call_db(C.URL_MSGS
				, {book_id: this.book_id, c_ts: latest_c_ts});
		data_from_db_observable.subscribe(
			msgs_from_db => {
				console.debug("201810072326 BookingsComponent.action() msg_from_db ="
					, C.stringify(msgs_from_db));

				if (msgs_from_db.length>0 ) {
					// reset timer if getting new messages
					this.msg_no_activity_count_down = C.MSG_NO_ACTIVITY_COUNT_DOWN;
					this.msgs_from_db = this.msgs_from_db.concat(msgs_from_db);
				}
				this.changeDetectorRef.detectChanges();
			},
			error => {
				this.error_msg= error ;
				this.changeDetectorRef.detectChanges();
			}
		)
	}
}
