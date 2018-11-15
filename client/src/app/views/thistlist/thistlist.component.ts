// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component} from '@angular/core';
//import { OnInit } from '@angular/core';
//import { OnDestroy } from '@angular/core';
import { HostListener } from '@angular/core';
//import { NgZone  } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
//import { FormControl } from '@angular/forms';
//import { FormGroup } from '@angular/forms';
//import { FormArray } from '@angular/forms';
//import { FormBuilder } from '@angular/forms';
//import { Validators } from '@angular/forms';
//import { ValidatorFn } from '@angular/forms';
//import { ValidationErrors } from '@angular/forms';
//import { AbstractControl} from '@angular/forms';
//import { Subscription }   from 'rxjs';

//import { EventEmitter} from '@angular/core';
import { Input} from '@angular/core';
//import { Output} from '@angular/core';

//import {GeoService} from '../../models/remote.service' ;
//import {DBService} from '../../models/remote.service' ;
//import {CommunicationService} from '../../models/communication.service' ;
import { AppComponent } from '../../app.component';
//import { Constants } from '../../models/constants';
import { C } from '../../models/constants';
//import { StorageService } from '../../models/gui.service';
//import { UserService } from '../../models/gui.service';
import { BaseComponent      } from '../base/base.component' ;



@Component({
  selector	: 'app-thistlist'		,
  templateUrl	: './thistlist.component.html'	,
  styleUrls	: ['./thistlist.component.css']	,
  changeDetection: ChangeDetectionStrategy.OnPush ,  // prevent change detection unless @Input reference is changed
})

export class ThistlistComponent extends BaseComponent {
	// when *ngIf is true, both constructor() and ngOnInit() are called. constructor is called first then ngOnInit
	// the html needs  trip to populate its input fields. If trip==undefined, angular will keep calling constructor. 
	// By initialize trip to an empty structure, repeated calling of constructor can be avoided

	@Input()
		trnx_from_db: any;

	@Input()
		filter: any;

	@HostListener('keydown', ['$event']) 
	onAnyEvent(e) {
	   		 console.debug('201810131753 ThistlistComponent.onAnyEvent() event=', e);
		}

	forms: any =[];

	constructor(
		  public changeDetectorRef	: ChangeDetectorRef
	//	, private zone: NgZone
	){ 

		super(changeDetectorRef);
  		console.debug("201809262245 ThistlistComponent.constructor() enter")  ;
  		console.debug("201809262245 ThistlistComponent.constructor() exit")  ;
  	} 

	ngoninit() {
		console.debug("201809262246 ThistlistComponent.ngOnInit() this.trnx_from_db = "
			+ C.stringify(this.trnx_from_db) );
  	}
}
