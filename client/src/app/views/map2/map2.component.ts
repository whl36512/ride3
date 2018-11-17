import { Component, OnInit }	from '@angular/core';
import { OnDestroy }			from '@angular/core';
import { Subscription }			from 'rxjs';
import { ChangeDetectionStrategy }          from '@angular/core';
import { ChangeDetectorRef }    from '@angular/core';
import { FormBuilder            }   from '@angular/forms';
import { Router                 }   from '@angular/router';



import * as L from "leaflet";

import {DotIcon}				from "../../models/map.service"
import {PinIcon}				from "../../models/map.service"
import {C}						from "../../models/constants"
import {Util}					from "../../models/gui.service"
import { BaseComponent }		from '../base/base.component';
import { CommunicationService   }   from '../../models/communication.service' ;
import { DBService              }   from '../../models/remote.service' ;
import { GeoService             }   from '../../models/remote.service' ;
import { MapService             }   from '../../models/map.service';


@Component({
	selector: 'app-map2',
	templateUrl: './map2.component.html',
	styleUrls: ['./map2.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush ,  
	//providers: [CommunicationService],

})
export class Map2Component extends BaseComponent {

    constructor( public changeDetectorRef       : ChangeDetectorRef
                , public mapService             : MapService
                , public communicationService   : CommunicationService
                , public dbService              : DBService
                , public geoService             : GeoService
                , public form_builder           : FormBuilder
                , public router                 : Router )  {
        super(changeDetectorRef,mapService, communicationService, dbService
                , geoService, form_builder, router );

		this.page_name=C.PAGE_MAP;

		// body_show indicates the map page either has a high z-index or low z-index
		// it does not control the z-index. It is a status indicator.
		this.show_body=C.BODY_NOSHOW; 
	}

	ngoninit() {
		if( this.mapService.current_loc.lat) {
			this.mapService.createMap('map'
				, this.mapService.current_loc.lat, this.mapService.current_loc.lon, 12);
		} else {
			this.mapService.createMap('map', 39.264283, -96.786196, 4) ;
		}

		// resetting zoom not working.	It requires browser extension.
		// and it causes problem in android chrome when try to change z-index of the map.
		//let reset_zoom_var = Util.reset_zoom;
		//window.onresize = function(){ reset_zoom_var()};
		//window.addEventListener("resize", function(){reset_zoom_var()} );
	}

	subscription_action(msg): void {
			let msg_body= msg.value ;
		if (msg.msgKey==C.MSG_KEY_MAP_BODY_SHOW) {
			this.show_body=C.BODY_SHOW ;
			Util.show_map();
		}
		if (msg.msgKey==C.MSG_KEY_MAP_BODY_NOSHOW) {
			this.show_body=C.BODY_NOSHOW ;
			Util.hide_map();
		}
		else if (msg.msgKey==C.MSG_KEY_MARKER_CLEAR) {
			this.mapService.clear_markers();
		}
		else if (msg.msgKey == C.MSG_KEY_MARKER_PAIR ) {
			this.mapService.try_mark_pair(msg.body);
		}
		else if (msg.msgKey == C.MSG_KEY_MARKER_BOOK ) {
			this.mapService.mark_book(msg.body, -1, false);
		}
		else if (msg.msgKey == C.MSG_KEY_MARKER_BOOKS ) {
			this.mapService.mark_books(msg.body, -1);
		}
		else if (msg.msgKey == C.MSG_KEY_MARKER_FIT ) {
			this.mapService.try_fit_pair(msg.body);
		}
		else if (msg.msgKey == C.MSG_KEY_MAP_LINE ) {
			this.mapService.draw_line(msg.body);
		}
		else {
			this.subscription_action_ignore();
		}
	}

 	resize()
	{// not working
		//let height = window.innerHeight;
		//let width	= window.innerWidth;
		//document.getElementById("map").style.height = height + "px";
		//document.getElementById("map").style.width = height + "px";
	}
}
