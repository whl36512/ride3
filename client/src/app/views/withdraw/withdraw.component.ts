// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component } from '@angular/core';
//import { FormControl } from '@angular/forms';
//import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router                 }   from '@angular/router';
import { Validators } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import {AbstractControl,	ValidatorFn} from '@angular/forms';
import {EventEmitter, Input, Output} from '@angular/core';


//import {Usr} from '../../models/tables' ;
import {UserService} from '../../models/gui.service' ;
import {DBService} from '../../models/remote.service' ;
import {GeoService} from '../../models/remote.service' ;
import { MapService             }   from '../../models/map.service';
import {C} from '../../models/constants' ;
import {CommunicationService} from '../../models/communication.service' ;
import { AppComponent } from '../../app.component';
import { BaseComponent			} from '../base/base.component' ;





@Component({
	selector: 'app-withdraw',
	templateUrl: './withdraw.component.html',
	styleUrls: ['./withdraw.component.css'] ,
	changeDetection: ChangeDetectionStrategy.OnPush ,	// prevent change detection unless @Input reference is ch
})

export class WithdrawComponent extends BaseComponent {
	// when *ngIf is true, both constructor() and ngOnInit() are called. 
	// constructor is called first then ngOnInit
	// the html needs	user to populate its input fields. If user==undefined, angular will keep calling constructor. 
	// By initialize user to an empty structure, repeated calling of constructor can be avoided
	user_from_db: any ={}	; 

	saved : boolean = false;

	constructor( public changeDetectorRef	: ChangeDetectorRef 
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )	{ 
		super(changeDetectorRef,mapService, communicationService, dbService
				, geoService, form_builder, router );
		this.page_name=C.PAGE_WITHDRAW;
	}

	ngoninit() {
		this.form = this.form_builder.group({
			usr_id: ['',	[]],	
			bank_email: ["",	[Validators.required, Validators.pattern]],	
			requested_amount: [0,	[Validators.required]],
				//trnx_cd: ['W',	[Validators.required , Validators.min, Validators.max]],	
		});
		if(! this.is_signed_in) {
			this.warning_msg=C.WARN_NOT_SIGNED_IN ;
			return;
		}
		let user_from_db_observable 	= this.dbService.call_db(C.URL_GET_USER, {});
		user_from_db_observable.subscribe(
			user_from_db => {
				if (user_from_db.usr_id != null )	{
					this.user_from_db=user_from_db;
					this.form = this.form_builder.group({
						usr_id: [this.user_from_db.usr_id,	[]],	
						bank_email: ["",	[Validators.required, Validators.pattern]],	
						requested_amount: [this.user_from_db.balance,	[Validators.required
						//trnx_cd: ['W',	[Validators.required
						, Validators.min, Validators.max]],	
					});
					this.is_signed_in = true;
				} else {
					this.error_msg= user_from_db.error;
					this.warning_msg=C.WARN_NOT_SIGNED_IN;
					}
				this.changeDetectorRef.detectChanges();
			},
			error => {
				this.error_msg=error;
				this.changeDetectorRef.detectChanges();
			}
		);
		this.changeDetectorRef.detectChanges();
	}

onSubmit() {
	// TODO: Use EventEmitter with form value
	this.reset_msg();
	console.warn("201808201534 WithdrawComponent.onSubmit() this.form.value=" + this.form.value );
	let data_from_db_observable 
		= this.dbService.call_db(C.URL_WITHDRAW, this.form.value);

	data_from_db_observable.subscribe(
		money_trnx_from_db=> {
			console.info("201808201201 WithdrawComponent.onSubmit() money_trnx_from_db =\n" 
				, C.stringify(money_trnx_from_db));
			if(money_trnx_from_db.requested_amount < 0 ) { //withdraw is a debit. So negative number
				this.saved=true;
				this.info_msg='Request sent. it will be reviewed and processed.';
			}
			this.changeDetectorRef.detectChanges();
		},
		error => { 
			this.saved=false;
			this.error_msg= error;
			this.changeDetectorRef.detectChanges();
		},
	)
}
		
// the getter is required for reactive form validation to work 
get bank_email() { return this.form.get('bank_email'); }	
get requested_amount () { return this.form.get('requested_amount'); }	
}
