import { Component, OnInit } 	from '@angular/core';
import { OnDestroy } 		from '@angular/core';
import { Subscription }   	from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router             }   from '@angular/router';



import * as L from "leaflet";

import {MapService} from "../../models/map.service"
import {DotIcon} 	from "../../models/map.service"
import {PinIcon} 	from "../../models/map.service"
import {C} 			from "../../models/constants"
import {Util} 		from "../../models/gui.service"
//import {DBService} 	from '../../models/remote.service' ;
import {Status} 	from "../../models/gui.service"
import { StorageService     } from '../../models/gui.service';
//import {CommunicationService} from "../../models/communication.service"
import { BaseComponent      } from '../base/base.component' ;


@Component({
	selector: 'app-map-controller',
	templateUrl: './map-controller.component.html',
	styleUrls: ['./map-controller.component.css'],
	//providers: [CommunicationService],
	changeDetection: ChangeDetectionStrategy.OnPush , 
		
})

export class MapControllerComponent extends BaseComponent {
	region_search_criteria: any ;
	map_region: any ;  // for map movement detection
	map_move_time	: number; 
	search_is_running: boolean;
	map_is_moving:boolean ;

	constructor( public changeDetectorRef   : ChangeDetectorRef
				//, public router: Router 
				//, public mapService: MapService 
	) { 
		super(changeDetectorRef);
		this.region_search_criteria = {} ;
		this.map_region 			= {} ;
		this.map_move_time			= 0;
		this.search_is_running		= false
		this.map_is_moving			= true;
	}
		
	ngoninit() {
		//change class of the div#main to change style
		let element = document.getElementById("main");
    	if(element) element.classList.add("map-controller"); // for changing style

        let rider_criteria = StorageService.getForm(C.KEY_FORM_SEARCH) ;

		if (! rider_criteria || rider_criteria.distance== C.ERROR_NO_ROUTE 
			||rider_criteria.version != C.VERSION_FORM_SEARCH) {
			this.router.navigate(['/search_setting']);
		}

		this.warning_msg = 'Please adjust map area to search for available trips' ;

		//move map viewport to contain rider_criteria
		let viewport= MapService.map_viewport_with_margin(rider_criteria, C.MAP_VIEWPORT_MARGIN);
        this.communicationService.send_msg(C.MSG_KEY_MARKER_FIT, viewport);

 		this.timer_sub = BaseComponent.timer.subscribe(
            // val will be 0, 1,2,3,...
            val => {
				//console.debug('201811041948', this.class_name, 'timer val=', val);
				if(val>2){ // avoid initial double search
					this.set_map_move(val);
					this.search();
				}
            },
        );
		Util.map_search_start();
		
		//Util.show_map();
	
		// resetting zoom not working.  It requires browser extension.
		// and it causes problem in android chrome when try to change z-index of the map.
		//let reset_zoom_var = Util.reset_zoom;
		//window.onresize = function(){ reset_zoom_var()};
		//window.addEventListener("resize", function(){reset_zoom_var()} );
	}

	
		
	search(){
		if (this.map_is_moving) {
			console.debug ('201810272312 MapControllerComponent.search() map is moving') ;
			return;
		}
		if (this.search_is_running) {
			console.debug ('201810272312 MapControllerComponent.search() search_is running') ;
			return;
		}
		if ( !Util.is_in_map_search()) {
			console.debug ('201810272312 MapControllerComponent.search() No Map searching.') ;
			return;
		}

		let region_search_criteria  = this.get_map_region();
		if (	this.region_search_criteria === region_search_criteria 	) return;

		console.debug ('201811041111 MapControllerComponent.search() perform map searching.') ;

		this.reset_msg();
        this.changeDetectorRef.detectChanges() ;
		this.warning_msg 			= 'Searching ...';
		this.search_is_running		= true;
		this.region_search_criteria = region_search_criteria;
		this.communicationService.send_msg(C.MSG_KEY_MARKER_CLEAR, {});
		
        this.changeDetectorRef.detectChanges() ;


        let rider_criteria = StorageService.getForm(C.KEY_FORM_SEARCH) ;
		rider_criteria.rp1=rider_criteria.p1;
		rider_criteria.rp2=rider_criteria.p2;
		// region p1,p2 overwrite rider_criteria.p1,p2
		let search_criteria_combined = {...rider_criteria, ... JSON.parse(region_search_criteria)};
		
		console.debug ('201810270146 MapControllerComponent.search() search_criteria_combined=\n'
					, search_criteria_combined);
		let data_from_db_observable     
			= this.dbService.call_db(C.URL_SEARCH_REGION, search_criteria_combined);
		
		data_from_db_observable.subscribe(
			journeys_from_db => {
				this.reset_msg();
				this.changeDetectorRef.detectChanges() ;
				console.info("201808201201 MapControllerComponent.search() journeys_from_db ="
						, C.stringify(journeys_from_db));
				// save both search result and rider criteria at the same time
				// rider criteria will be used to determin the Book button in journey page
				this.Status.search_result= journeys_from_db;
				this.Status.rider_criteria= rider_criteria;
				let rows_found = journeys_from_db.length ;

				if(rows_found == 0 ) this.warning_msg = 'Nothing found in the map region';
				else if(rows_found >= C.MAX_SEARCH_RESULT ) 
					this.warning_msg = 'Found more than ' + C.MAX_SEARCH_RESULT 
						+ ' offers. Showing ' + C.MAX_SEARCH_RESULT
						+ '. <br/>Please adjust map area to found more relevant offers';
				else this.info_msg = `Found ${rows_found} offers.`
				this.changeDetectorRef.detectChanges() ;

				this.communicationService.send_msg(C.MSG_KEY_MARKER_BOOKS , journeys_from_db);
				let pair = Util.deep_copy(rider_criteria);
				pair.line_color= C.MAP_LINE_COLOR_RIDER;
				this.communicationService.send_msg(C.MSG_KEY_MARKER_PAIR , pair);
				this.search_is_running= false ;
				console.debug ('201811041111 MapControllerComponent.search() finish map searching.') ;
			},
			error => {
				this.reset_msg();
				this.error_msg=error;
				this.search_is_running= false ;
				this.changeDetectorRef.detectChanges() ;
			}
		)
	}

	get_map_region(): any {
		let mr= {	  
				p1:		{ 
							  //lat	:MapService.static_map.getBounds().getSouth()
							//, lon 	:MapService.static_map.getBounds().getWest()
							  lat	:this.mapService.map.getBounds().getSouth()
							, lon 	:this.mapService.map.getBounds().getWest()
						}
				, p2:		{ 
							  //lat	:MapService.static_map.getBounds().getNorth()
							//, lon 	:MapService.static_map.getBounds().getEast()
							  lat	:this.mapService.map.getBounds().getNorth()
							, lon 	:this.mapService.map.getBounds().getEast()
						}
			} ;
		return C.stringify(mr);
	}

	set_map_move(timer_count)
	{
		let mr = this.get_map_region();
		if (!  (mr == this.map_region)	) 
		{
			this.map_is_moving = true;
			this.map_region= mr;
			this.map_move_time =timer_count;
			console.debug ('201810272312 MapControllerComponent.search() map set to moving') ;
		}
		else if ( timer_count - this.map_move_time > 3) {
			this.map_is_moving= false;
		}
	}
		
	resize()
	{// not working
		//let height = window.innerHeight;
		//let width  = window.innerWidth;
		//document.getElementById("map").style.height = height + "px";
		//document.getElementById("map").style.width = height + "px";
	}

	onngdestroy()
	{
		Util.map_search_stop();
	//	this.mapService.map.off('moveend' );
		
		let element = document.getElementById("main");
    	if(element) element.classList.remove("map-controller");
		
	}
}
		
