import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Subscription }   from 'rxjs';

import {CommunicationService} 	from "./models/communication.service" ;
import {C} 			from "./models/constants" ;
import {Util} 			from "./models/gui.service" ;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  {
  	title = 'ride2';
	//pages: any ={}	;

  	constructor (
		//public communicationService: CommunicationService
	)
	{
		//super(communicationService);
  		//this.setFalse();
    		//this.pages.nav		= true ;
		//this.list_global_objects();
	}

/*
	setFalse () {
		this.pages.search 	= false ;
		this.pages.user 	= false ;
		this.pages.trip 	= false ;
		this.pages.signout 	= false ;
		this.pages.activity	= false ;
		this.pages.thist	= false ;
		this.pages.deposit 	= false ;
		this.pages.withdraw	= false ;
		this.pages.contact_us	= false ;
		this.pages.tou		= false ;
    		this.pages.map		= false ;
	}

  	select(page:string) {
		console.log("201808201649 AppComponent.select() page=" + page);
		this.setFalse();
		let json = JSON.parse(`{"${page}":true}`);
	
		this.pages = { ...this.pages, ...json} ;
		console.info("201808221510 AppComponent.select()  this.pages="
			,  C.stringify(this.pages) ) ;
		if (this.pages.map==false) this.communicationService.send_msg(C.MSG_KEY_MAP_BODY_NOSHOW, {});
  	}

  	deselect(page:string) {
		console.log("201808201649 AppComponent.deselect() page=" + page);
		let json = JSON.parse(`{"${page}":false}`);
	
		this.pages = { ...this.pages, ...json} ;
		console.info("201808221510 AppComponent.select()  this.pages=" +  C.stringify(this.pages) ) ;
  	}
	
	subscription_action(msg:any): void {
		if(msg.msgKey ==C.MSG_KEY_PAGE_OPEN ){
			this.select(msg.page);
		}
		else if ( msg.msgKey ==C.MSG_KEY_PAGE_CLOSE){
			this.deselect(msg.page);
		}
	}
*/
}
