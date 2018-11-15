//use 
//ng generate module app-routing --module app --flat
//to generate this file in the same directory as app.module.ts

//general modules
import { NgModule } from '@angular/core';
//import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

//import { AppComponent } 	from './app.component';
import { NavComponent } 	from './views/nav/nav.component';
import { UserComponent } 	from './views/user/user.component';
import { TripComponent } 	from './views/trip/trip.component';
//import { LinkedinComponent } 	from './views/linkedin/linkedin.component';
import { Map2Component } 	from './views/map2/map2.component';

import { JourneyComponent } 	from './views/journey/journey.component';
//import { TouComponent } from './views/tou/tou.component';
//import { TosComponent } from './views/tos/tos.component';
//import { PrivacyComponent } from './views/privacy/privacy.component';
import { ActivityComponent } from './views/activity/activity.component';
//import { BookingsComponent } from './views/bookings/bookings.component';
import { DepositComponent } from './views/deposit/deposit.component';
import { WithdrawComponent } from './views/withdraw/withdraw.component';
import { ThistComponent } from './views/thist/thist.component';
import { MapControllerComponent } from './views/map-controller/map-controller.component';
import { SearchSettingComponent } from './views/search-setting/search-setting.component';
import { MiscComponent } from './views/misc/misc.component';

const appRoutes: Routes = [
/*
  { path: 'linked/callback', component:LinkedinService },
  { path: 'linked/accesstoken', component: CrisisListComponent },
  { path: 'hero/:id',      component: HeroDetailComponent },
  {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
  */
	{
		  path: 'Nav'
		, component: NavComponent
		, data: { title: 'Navigation' }
	},
	{
		  path: 'search_setting'
		, component: SearchSettingComponent
		, data: { title: 'Search Setting' }
	},
	{
		  path: 'map_search_start'
		, component: MapControllerComponent
		, data: { title: 'Map Search' }
	},
	{
		  path: 'map_search_stop'
		, redirectTo: '/Nav'
		, pathMatch: 'full'
	},
	{
		  path: 'show_search_result'
		, component: JourneyComponent
		, data: { title: 'Search Result' }
	},
	{
		  path: 'Trip'
		, component: TripComponent
		, data: { title: 'Trip' }
	},
	{
		  path: 'Activity'
		, component: ActivityComponent
		, data: { title: 'Activity' }
	},
	{
		  path: 'Profile'
		, component: UserComponent
		, data: { title: 'Profile'}
	},
	{
		  path: 'Thist'
		, component: ThistComponent
		, data: { title: 'Trans History' }
	},
	{
		  path: 'Deposit'
		, component: DepositComponent
		, data: { title: 'Deposit' }
	},
	{
		  path: 'Withdraw'
		, component: WithdrawComponent
		, data: { title: 'Withdraw' }
	},
	{
		  path: 'misc'
		, component: MiscComponent
		, data: { title: 'Miscellaneous' }
	},
	{ 
		path: ''
		, redirectTo: '/map_search_start'
		, pathMatch: 'full'
	},
	{ 
		path: '**'
		, redirectTo: '/map_search_start'
		//, pathMatch: 'full'
	},

];


@NgModule({
	imports: [
		//CommonModule,
		RouterModule.forRoot(
			appRoutes,
    			{ enableTracing: true } // <-- debugging purposes only
    		),
  	],
	exports: [
		//Re-export the Angular RouterModule by adding it to the module exports array. 
		//By re-exporting the RouterModule here the components declared in AppModule 
		//will have access to router directives such as RouterLink and RouterOutlet.
    	RouterModule  
  	],
})

export class AppRoutingModule { }
