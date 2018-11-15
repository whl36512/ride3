//general modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { Injector } from '@angular/core';

//modules the application uses
import { FormsModule }					from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
//import { Router						 }	 from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
//import { ChangeDetectorRef }		from '@angular/core';
//import { NgZone }		from '@angular/core';


//import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
//import {NoopAnimationsModule} from '@angular/platform-browser/animations';
//import {MatButtonModule, MatCheckboxModule} from '@angular/material'; // import after BrowserModule

//third party modules
//import { LeafletModule } from '@asymmetrik/ngx-leaflet';


//appplication components
import { AppComponent } 	from './app.component';
import { NavComponent } 	from './views/nav/nav.component';
import { UserComponent } 	from './views/user/user.component';
import { TripComponent } 	from './views/trip/trip.component';
//import { LinkedinComponent } 	from './views/linkedin/linkedin.component';
import { Map2Component } 	from './views/map2/map2.component';

//appplication services
import { StorageService }			 from './models/gui.service';
import { MapService } 		from './models/map.service';
import { GeoService } 		from './models/remote.service';
import { DBService } 		from './models/remote.service';
import { HttpService } 		from './models/remote.service';
import {CommunicationService} 	from './models/communication.service';
//import { SearchComponent } 	from './views/search/search.component' ;
import { JourneyComponent } 	from './views/journey/journey.component';
//import { TouComponent } from './views/tou/tou.component';
//import { TosComponent } from './views/tos/tos.component';
//import { PrivacyComponent } from './views/privacy/privacy.component';
import { ActivityComponent } from './views/activity/activity.component';
import { BookingsComponent } from './views/bookings/bookings.component';
import { MessageComponent } from './views/message/message.component';
import { DepositComponent } from './views/deposit/deposit.component';
import { WithdrawComponent } from './views/withdraw/withdraw.component';
import { ThistComponent } from './views/thist/thist.component';
import { ThistlistComponent } from './views/thistlist/thistlist.component';
import { MapControllerComponent } from './views/map-controller/map-controller.component';
import { SearchSettingComponent } from './views/search-setting/search-setting.component';
import { AppRoutingModule } from './app-routing.module';
import { MiscComponent } from './views/misc/misc.component';
//import { BaseComponent } from './views/base/base.component' ;


//const appRoutes: Routes = [ ]

@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		//MapComponent,
		UserComponent,
		TripComponent,
		//LinkedinComponent,
		Map2Component,
		//SearchComponent,
		JourneyComponent,
		//TouComponent,
		//TosComponent,
		//PrivacyComponent,
		ActivityComponent,
		BookingsComponent,
		MessageComponent,
		DepositComponent,
		WithdrawComponent,
		ThistComponent,
		ThistlistComponent,
		MapControllerComponent,
		SearchSettingComponent,
		MiscComponent,
		//BaseComponent,
	],
	imports: [
		//RouterModule.forRoot(
			//appRoutes,
					//{ enableTracing: true } // <-- debugging purposes only
				//),
		BrowserModule,
		// import HttpClientModule after BrowserModule.
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
		//BrowserAnimationsModule,
		//NoopAnimationsModule,
		//MatButtonModule , 
		//MatCheckboxModule,
		//				LeafletModule.forRoot(),
	],
	providers: [
		//ChangeDetectorRef	,	// causing compiler error. Research turned up no solution
		//NgZone	,	
		//StorageService,
		MapService,
		GeoService,
		DBService,
		HttpService,
		CommunicationService,
		//Router,
	],

	bootstrap: [AppComponent]
})

export class AppModule { }	
