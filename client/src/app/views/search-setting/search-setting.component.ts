// https://angular.io/guide/reactive-forms
// https://angular.io/guide/form-validation

import { Component		} from '@angular/core';
import { OnInit 		} from '@angular/core';
//import { OnDestroy 		} from '@angular/core';
//import { NgZone  		} from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { FormControl 		} from '@angular/forms';
import { FormGroup 		} from '@angular/forms';
import { FormArray 		} from '@angular/forms';
import { FormBuilder 		} from '@angular/forms';
import { Validators 		} from '@angular/forms';
import { ValidatorFn 		} from '@angular/forms';
import { ValidationErrors 	} from '@angular/forms';
import { AbstractControl	} from '@angular/forms';
import { Router             }   from '@angular/router';


//import { Subscription 	} from 'rxjs';

//import { EventEmitter		} from '@angular/core';
//import { Output		} from '@angular/core';
//import { Input		} from '@angular/core';

import { AppComponent 		} from '../../app.component';
import { C		 		} from '../../models/constants';
import { StorageService} from '../../models/gui.service';
import { Util		 		} from '../../models/gui.service';
import { PinIcon		} from "../../models/map.service"
import { BaseComponent	} from '../base/base.component' ;
import { CommunicationService   }   from '../../models/communication.service' ;
import { DBService              }   from '../../models/remote.service' ;
import { GeoService             }   from '../../models/remote.service' ;
import { MapService             }   from '../../models/map.service';


@Component({
  selector	: 'app-search-setting'			,
  templateUrl	: './search-setting.component.html'	,
  styleUrls	: ['./search-setting.component.css']	,
  changeDetection: ChangeDetectionStrategy.OnPush ,
})

export class SearchSettingComponent extends BaseComponent {
	// when *ngIf is true, both constructor() and ngOnInit() are called. constructor is called first then ngOnInit
	// the html needs  trip to populate its input fields. If trip==undefined, angular will keep calling constructor. 
	// By initialize trip to an empty structure, repeated calling of constructor can be avoided

	trip:any;
	step=1;

    constructor( public changeDetectorRef   	: ChangeDetectorRef
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )  {
        super(changeDetectorRef,mapService, communicationService, dbService
                , geoService, form_builder, router );

  		console.debug("SearchSettingComponent.constructor() enter")  ;
  		console.debug("201810291813 SearchSettingComponent.constructor() exit")  ;
  	} 

	ngoninit():void {
		let today = C.TODAY();
		let trip = StorageService.getForm(C.KEY_FORM_SEARCH);
		if ( !trip || trip.version != C.VERSION_FORM_SEARCH ||  trip.distance <=0) { 
			trip = this.Util.create_rider_criteria();
		}
		console.debug("201810291814 SearchSettingComponent.ngOnInit() trip=",
			C.stringify(trip));
	
		trip.date1 =  today > trip.date1 ? today: trip.date1 ;

		trip.date2 = trip.date1 > trip.date2 ? trip.date1: trip.date2 ;

		this.trip=trip;
		StorageService.storeForm(C.KEY_FORM_SEARCH, trip);
		this.form = this.form_builder.group({
			date1			: [trip.date1, [Validators.min,Validators.required]], 
			date2			: [trip.date2, [Validators.min, Validators.required]], 
			p1_loc			: [trip.p1.loc, [Validators.required]],
			p2_loc			: [trip.p2.loc, [Validators.required]], 
			departure_time	: [trip.departure_time, []], 
			seats			: [trip.seats, [Validators.required]], 
			price			: [trip.price, [Validators.required]], 
			search_tightness: [trip.search_tightness, [Validators.required]], 
		});
		this.show_map();
		//this.subscription1 = this.form.valueChanges
			//.subscribe( data => console.log('Form value changes', data));
		//this.subscription2 = this.form.statusChanges
			//.subscribe(data => console.log('Form status changes', data));
  	}

	action(start_search:boolean) {
		console.debug("201809231416 SearchSettingComponent.onSubmit() this.form.value=" 
				, C.stringify(this.form.value) );
		this.reset_msg();
		this.changeDetectorRef.detectChanges();

		// combining data
		this.trip = { ...this.trip, ...this.form.value};
		this.trip.p1.loc = this.form.value.p1_loc;
		this.trip.p2.loc = this.form.value.p2_loc;
		delete this.trip.p1_loc;
		delete this.trip.p2_loc;
		StorageService.storeForm(C.KEY_FORM_SEARCH, this.trip); 
		this.info_msg = 'Saved successfully';
		this.changeDetectorRef.detectChanges();
		if(start_search) {
			let url = '/map_search_start';
			this.router.navigate([url]);
		}
	}

	form_change_action(){
		let changed_field=this.form_loc_change_detect();
		if ( changed_field) this.geocode(changed_field, this.trip, this.form) ;
	}

	show_map(){
		//this.communicationService.send_msg(C.MSG_KEY_MAP_BODY_SHOW, {});
		let pair = JSON.parse(C.stringify(this.trip));
		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});
		pair.p1.icon_type=PinIcon;
		pair.p2.icon_type=PinIcon;
		this.communicationService.send_msg(C.MSG_KEY_MARKER_PAIR, pair);
		this.communicationService.send_msg(C.MSG_KEY_MARKER_FIT,  pair);
	}


	// the getter is required for reactive form validation to work 
	get p1_loc		() { return this.form.get('p1_loc'	); }  
	get p2_loc		() { return this.form.get('p2_loc'	); }  
	get date1		() { return this.form.get('date1'	); }
	get date2		() { return this.form.get('date2'	); }
	get departure_time	() { return this.form.get('departure_time'	); }
	get seats		() { return this.form.get('seats'		); }
	get price		() { return this.form.get('price'		); }
}
