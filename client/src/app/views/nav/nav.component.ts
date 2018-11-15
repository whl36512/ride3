import { Component} 		from '@angular/core';
import { OnInit } 		from '@angular/core';
import { UserService } 		from '../../models/gui.service';
import { C } 			from '../../models/constants';
//import { CommunicationService } from '../../models/communication.service';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { FormBuilder            }   from '@angular/forms';
import { Router                 }   from '@angular/router';
import { CommunicationService   }   from '../../models/communication.service' ;
import { DBService              }   from '../../models/remote.service' ;
import { GeoService             }   from '../../models/remote.service' ;
import { MapService             }   from '../../models/map.service';


import { BaseComponent  } from '../base/base.component' ;

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['./nav.component.scss'] ,
	changeDetection: ChangeDetectionStrategy.OnPush ,

})
export class NavComponent extends BaseComponent {

	show_nav=false ;
    constructor( public changeDetectorRef       : ChangeDetectorRef
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )  {
        super(changeDetectorRef,mapService, communicationService, dbService
                , geoService, form_builder, router );

	}

	ngoninit() {}

	select(elem:string) {
		this.show_nav=false;
		console.debug('201808031521 NavComponent.select elem='+ elem) ;
		//this.communicationService.send_msg(C.MSG_KEY_PAGE_OPEN, {page:elem});
	}

	nav_menu_off():boolean  {
		this.show_nav = false ;
		this.Util.hide_map();
		return true;

	}

	toggle()  {
		this.show_nav =!this.show_nav ;
		this.is_signed_in= UserService.is_signed_in();
		console.log('301808221747 NavComponent.constructor this.is_signed_in='+ this.is_signed_in) ;
	}

	map_search_stop() {
		this.Util.map_search_stop();
	}
	map_search_start() {
		this.Util.map_search_start();
	}

}
