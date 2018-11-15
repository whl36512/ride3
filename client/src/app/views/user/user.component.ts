// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component						} from '@angular/core';
//import { OnInit						} from '@angular/core';
//import { FormControl					} from '@angular/forms';
//import { FormGroup					} from '@angular/forms';
//import { FormBuilder					} from '@angular/forms';
import { Validators						} from '@angular/forms';
import { ChangeDetectionStrategy						} from '@angular/core';
import { ChangeDetectorRef				} from '@angular/core';
import {AbstractControl,	ValidatorFn	} from '@angular/forms';
//import {EventEmitter, Input, Output	} from '@angular/core';

import {Usr								} from '../../models/tables' ;
//import {Constants						} from '../../models/constants' ;
import {C								} from '../../models/constants' ;
import {UserService						} from '../../models/gui.service' ;
//import {DBService						} from '../../models/remote.service' ;
//import {CommunicationService			} from '../../models/communication.service' ;
import {BaseComponent					} from '../base/base.component' ;
import { AppComponent					} from '../../app.component';


@Component({
		selector: 'app-user'
	,	templateUrl: './user.component.html'
	,	styleUrls: ['./user.component.css']
	,	changeDetection: ChangeDetectionStrategy.OnPush 
})

export class UserComponent extends BaseComponent {
	user_from_db: Usr =new Usr	; 

	saved=false;


	constructor(public changeDetectorRef: ChangeDetectorRef)	{ 
		super(changeDetectorRef);
		console.log("UserComponent.constructor() enter")	;
		this.page_name = C.PAGE_USER;
	}

	ngoninit(): void{
		this.form = this.form_builder.group({
			email: ["",	[Validators.required, Validators.pattern]],	 // sync validators must be in an array
			profile_ind: ["",	[Validators.required, Validators.pattern]],	 // sync validators must be in an array
			//last_name: [''],
		});
		//let user_from_cookie 	= UserService.get_profile_from_session();
		let user_from_db_observable 	= this.dbService.call_db(C.URL_GET_USER, {}); 
		user_from_db_observable.subscribe(
			user_from_db => {
				console.info("201808201201 UserComponent.constructor() user_from_db =" 
					, C.stringify(user_from_db));
				if (!user_from_db.error )	
				{
					this.user_from_db=user_from_db;
					this.form.value.email = this.user_from_db.email;
					this.form.value.profile_ind = this.user_from_db.profile_ind;
				} else {
					this.error_msg= user_from_db.error;
				}
				this.changeDetectorRef.detectChanges();
			},
			error => {
				this.error_msg= error;
				this.changeDetectorRef.detectChanges();
			}
		);

		//this.form.valueChanges.subscribe(data => console.log('Form value changes', data));
		//this.form.statusChanges.subscribe(data => console.log('Form status changes', data));
	}

	onSubmit() {
		this.reset_msg();
		this.changeDetectorRef.detectChanges();
		console.warn("201808201534 UserComponent.onSubmit() this.form.value=" + this.form.value );
		let user_from_db_observable	 = this.dbService.call_db(C.URL_UPD_USER, this.form.value);
		user_from_db_observable.subscribe(
			user_from_db => {
				console.info("201808201201 UserComponent.constructor() user_from_db =" 
					, C.stringify(user_from_db));
				this.user_from_db =user_from_db
				this.saved=true;
				this.info_msg ='Profile saved';
				this.changeDetectorRef.detectChanges();
			},
			error => {
				this.error_msg = error;
				this.error_msg ='Action failed';
				this.changeDetectorRef.detectChanges();
			}
		)
	}
	
	// the getter is required for reactive form validation to work 
	get email() { return this.form.get('email'); }	
}
