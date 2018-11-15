import { Component, OnInit } from '@angular/core';
declare var IN: any;

@Component({
  selector: 'app-linkedin',
//  templateUrl: './linkedin.component.html',
  //template: '<a [href]="url">LinkedIn</a>' ,
  template: '<dt id=signinwithlinkedin> <script type="in/Login"></script>' ,
  styleUrls: ['./linkedin.component.css']
})
export class LinkedinComponent implements OnInit {

	client_id   :String = '86xvjldqclucd9';
	redirect_uri:String = encodeURI("http://rideshare.beegrove.com:4201/linkedin/callback");
	state 	    : String ='aekjfafoeriugarherug0iglwup34pfuqp3aeoq3ue3' ;
	url         : String = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&state=${this.state}`;

	constructor() {
//				console.log("201808101538 User is authed:" +!IN.User.isAuthorized() );
 }
	ngOnInit() {
			}
}

