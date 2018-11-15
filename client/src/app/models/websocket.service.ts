import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
	public messages: Subject<any>;
	private subject: Rx.Subject;
	public ws: any;

	constructor() { }

	public connect(url: string): Rx.Subject {
		if (!this.subject) {
			this.subject = this.create(url);
		}
		return this.subject;
	}

	public close() {
		if (this.ws) {
			this.ws.close();
			this.subject = null;
		}
	}

	private create(url: string): Rx.Subject {
		this.ws = new WebSocket(url);
		const observable = Rx.Observable.create(
			(obs: Rx.Observer) => {
				this.ws.onmessage = obs.next.bind(obs);
				this.ws.onerror = obs.error.bind(obs);
				this.ws.onclose = obs.complete.bind(obs);
				return this.ws.close.bind(this.ws);
			}).share();
	
		const observer = {
			next: (data: Object) => {
				if (this.ws.readyState === WebSocket.OPEN) {
					this.ws.send(JSON.stringify(data));
				}
			}
		};
		return Rx.Subject.create(observer, observable);
	}
}
