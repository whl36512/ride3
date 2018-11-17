import { Injectable } 		from '@angular/core';
import { Subject }    		from 'rxjs';
import { webSocket			}	from 'rxjs/webSocket';
import { BehaviorSubject } 	from 'rxjs';
import { C } 				from './constants';
import { Util	}			from './gui.service';
 
@Injectable()
//@Injectable({
//providedIn: 'root'
//})

export class CommunicationService {
	// for inter component communication
 
  	// Observable string sources
	private messageSource = new BehaviorSubject<any> ('default message');
	currentMessage = this.messageSource.asObservable();  // all components subscribing to this message will get the message
	send(message: any) {
		console.info("201808230806 CommunicationService.sendMessage() message=" + message);
	    	this.messageSource.next(message)
	}

	// generic message. use msgKey to differantiate messages
	private msg_subject = new BehaviorSubject<any> ('{}');
	// all components subscribing to this message will get the message
	msg = this.msg_subject.asObservable();  

	send_msg(msg_key:string, message: any) {
		let msg = this.package_msg(msg_key, message);
	    this.msg_subject.next(msg) ;
	}

	
	public ws_last_activity_ts: number=0;
	public ws_subject = webSocket(C.URL_WEBS);	


	ws_connect() {
		let now_ts=Util.now_ts();
		if (now_ts- this.ws_last_activity_ts > 10*60 ){
			if (this.ws_subject) { 
				this.ws_subject.complete();
				this.ws_subject=null;
			}
		}
		if ( ! this.ws_subject) this.ws_subject= webSocket(C.URL_WEBS);
	}

	ws_send(msg_key:string, message: any) {
		let msg = this.package_msg(msg_key, message);
		this.ws_subject.next(msg);
	}

	package_msg(msg_key:string, message: any):any {
		let message_copy: any ={};
		if (typeof(message) == 'string') message_copy = JSON.parse(message);
		else message_copy = Util.deep_copy(message) ; 
		
		//let msg= C.stringify({ msgKey: msg_key, body: message_copy});
		let msg= { msgKey: msg_key, body: message_copy};
		let msg_string= C.stringify({ msgKey: msg_key, body: message_copy});
		console.debug("201808230806 CommunicationService.package_msg() key and msg=\n", msg_string );
		return msg;
	}
}
