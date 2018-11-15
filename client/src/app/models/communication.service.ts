import { Injectable } 		from '@angular/core';
import { Subject }    		from 'rxjs';
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
		let message_copy: any ={};
		if (typeof(message) == 'string') message_copy = JSON.parse(message);
		else message_copy = Util.deep_copy(message) ; 
		
		let msg= { msgKey: msg_key, body: message_copy};
		console.debug("201808230806 CommunicationService.send_msg() key and msg=\n" 
			, C.stringify(msg));
	    	this.msg_subject.next(msg) ;
	}
}
