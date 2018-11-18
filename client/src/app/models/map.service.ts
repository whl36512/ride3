import { Injectable } from "@angular/core";
//import { HttpClient } from "@angular/common/http";
//import { Location } from "./location";
import * as L from "leaflet";
import * as Rx from "rxjs";
import { Subscription           }   from 'rxjs';


import { C } 				from "./constants";
import { Util     }			from './gui.service';


@Injectable()
export class MapService {
	public static static_map: L.Map;
	public map: L.Map;
	public baseMaps: any;
	private vtLayer: any;
	private marker: any;
	private markerFrom: any;
	private markerTo: any;

	private marker_arr: any =[];
	private lines: any =[];

	//current_loc = {lat:null, lon:null};

	geo_watcher : any;

	current_loc = {lat:null,lon:null};
    geo_watcher_sub         : Subscription |null = null;


	constructor() {
		this.geo_watcher = this.watchPosition(null);
    	this.subscribe_geo_watcher();
		const osmAttr =
			"&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>, " +
			"Tiles courtesy of <a href='http://hot.openstreetmap.org/' target='_blank'>Humanitarian OpenStreetMap Team</a>";
	
		const esriAttr =
			"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, " +
			"iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, " +
			"Esri China (Hong Kong), and the GIS User Community";
		
		const cartoAttr =
			"&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> " +
			"&copy; <a href='https://cartodb.com/attributions'>CartoDB</a>";
		
		this.baseMaps = {

			OpenStreetMapBusy: L.tileLayer( 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		  		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			  	subdomains: ['a', 'b', 'c']
				}
			) ,
			OpenStreetMap: L.tileLayer(
				"https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
				{
				//zIndex: 1,
					attribution: osmAttr ,
				}
			),
			Esri: L.tileLayer(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
				{
					zIndex: 1,
					attribution: esriAttr
				}
			),
		CartoDB: L.tileLayer(
		"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
		{
		zIndex: 1,
		attribution: cartoAttr
		}
		)
		};
	}

    watchPosition(geolocationOptions) {
        // http://xgrommx.github.io/rx-book/content/how_do_i/existing_api.html
        if (!window.navigator.geolocation) return;
        let source =  Rx.Observable.create(
			function (observer) {
				var watchId = window.navigator.geolocation.watchPosition(
        		//var watchId = window.navigator.geolocation.getCurrentPosition(
					function successHandler (loc) { observer.next(loc); }
					, function errorHandler (err) { observer.error(err); }
					, geolocationOptions
				);
				return function () {window.navigator.geolocation.clearWatch(watchId);};
			}
		)

		//return source.publish().refCount();
		if (source) {
			console.debug('201811171420 MapService.watchPosition() geolocation observable created source=');
			console.debug(source);
		}
		else  {
			console.debug('201811171420 MapService.watchPosition() geolocation observable failed');
		}
		return source;
    }

    subscribe_geo_watcher() {
        console.debug('201811171456' , 'GeoService.subscribe_geo_watcher enter');
        let subscription = this.geo_watcher.subscribe(
            position => {
                console.debug('201811171337 GeoService.subscribe_geo_watcher'
                    , `Next: ${position.coords.latitude}, ${position.coords.longitude}`);
                this.current_loc.lat = position.coords.latitude;
                this.current_loc.lon = position.coords.longitude;
                },

            err => {
                var message = '';
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        message = 'Permission denied';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        message = 'Position unavailable';
                        break;
                    case err.PERMISSION_DENIED_TIMEOUT:
                        message = 'Position timeout';
                        break;
                }
                console.error('ERROR: 201811171434 GeoService.subscribe_geo_watcher',  message);
            },
            () => console.debug('201811171343 GeoService.subscribe_geo_watcher completed')
        );
        this.geo_watcher_sub= subscription ;
    }

	clear_markers(){
		for (let index in this.marker_arr){
			this.map.removeLayer(this.marker_arr[index]);
		}
		this.marker_arr=[];

		this.clear_lines();
	}

	clear_lines(){
		for (let index in this.lines){
			this.map.removeLayer(this.lines[index]);
		}
		this.lines=[];
	}


	disableMouseEvent(elementId: string) {
		const element = <HTMLElement>document.getElementById(elementId);
		
		L.DomEvent.disableClickPropagation(element);
		L.DomEvent.disableScrollPropagation(element);
	}
		
	/*
	toggleMarkerEditing(on: boolean) {
		if (on) {
		this.map.on("click", this.addMarker.bind(this));
		} else {
		this.map.off("click");
		}
	}
	*/
		
	/*
	private addMarker(e: L.LeafletMouseEvent) {
		const shortLat = Math.round(e.latlng.lat * 1000000) / 1000000;
		const shortLng = Math.round(e.latlng.lng * 1000000) / 1000000;
		const popup = `<div>Latitude: ${shortLat}<div><div>Longitude: ${shortLng}<div>`;
		const icon = L.icon({
			iconUrl: "assets/marker-icon.png",
			shadowUrl: "assets/marker-shadow.png"
		});
		
		const marker = L.marker(e.latlng, {
			draggable: true,
			icon
		})
		.bindPopup(popup, {
		offset: L.point(12, 6)
		})
		.addTo(this.map)
		.openPopup();
		
		marker.on("click", () => marker.remove());
	}
	*/

	search_marker(lat, lon): number{
		for ( let index in this.marker_arr) {
			let latlon= this.marker_arr[index].getLatLng();
			let found = latlon.equals(L.latLng(lat, lon));
			if ( found) return Number(index);
		}
		return -1;
	}

	mark_point(point: any): boolean {
		// point has properties: lat, lon, display_name, color, marker_text, icon_type

		//let p = {...point} // we don't want to modify input
		let p=point;
	
	  	if (!p) 	return false	; 
	  	if (!p.lat) 	return false	; 
		p.icon_type	= p.icon_type 	? p.icon_type 	: PinIcon	;
		p.color		= p.color 	? p.color	: 'blue' 	;
		p.marker_text	= p.marker_text ? p.marker_text : ''		;
		p.display_name	= p.display_name? p.display_name: '' 		;

		console.debug('201810210205 MapService.mark_point() p=\n', C.stringify(p));


		let popup = `<div>${p.lat},${p.lon}</div><div>${p.display_name}<div>`
				+ (p.popup?p.popup:'') ;
		// if mark location has alread a marker, move a bit
		p.lat_offset = p.lat ;
		p.lon_offset = p.lon ;
		if (this.search_marker(p.lat, p.lon) != -1) {
			p.lat_offset = Number(p.lat) + C.MAP_OVERLAP_OFFSET * (Math.random()-0.5);
			p.lon_offset = Number(p.lon) + C.MAP_OVERLAP_OFFSET * (Math.random()-0.5);
		}
		let marker=   L.marker([p.lat_offset, p.lon_offset]
					, {icon:p.icon_type.get(p.color,p.marker_text)} )
				.addTo(this.map).bindPopup(popup) ;
		this.marker_arr.push(marker);
		return true; // success
	}


	mark_book (book, index: number, is_highlight:boolean) {
		if (!book) return;
		let i= index;
		//let google_map_string = MapService.google_map_string(book);
		let google_map_url = book.google_map_url;
		if (!google_map_url) google_map_url= MapService.google_map_string(book);

		Util.convert_book_to_pairs(book);
		let popup = `<div>${book.journey_date} ${book.departure_time} ${google_map_url}</div>`

		let pair: any = {};
		pair.p1	= 	book.p1	;
		pair.p2 =	book.p2	;
		pair.p1.icon_type= DotIcon ;
		pair.p2.icon_type= DotIcon ;
		pair.p1.marker_text= 'D'+ (i+1);
		pair.p2.marker_text= 'D'+ (i+1);
		pair.p1.popup= popup  ;
		pair.p2.popup= popup  ;
		if ( is_highlight) {
			//pair.line_color=C.MAP_LINE_COLOR_HIGHLIGHT;
			pair.line_weight=C.MAP_LINE_WEIGHT_HIGHLIGHT;
		} else {
			pair.line_color=null;
			pair.line_weight=null;
		}
		this.mark_pair(pair);
		//this.draw_line(pair);

		if(!book.skip_book_part)
		{
			pair.p1	= 	book.rp1	;
			pair.p2 =	book.rp2	;
			pair.p1.icon_type= PinIcon ;
			pair.p2.icon_type= PinIcon ;
			pair.p1.marker_text= 'P'+ (i+1);
			pair.p2.marker_text= 'P'+ (i+1);
			pair.p1.popup= popup  ;
			pair.p2.popup= popup  ;
			if ( is_highlight) {
				//pair.line_color=C.MAP_LINE_COLOR_HIGHLIGHT;
				pair.line_weight=C.MAP_LINE_WEIGHT_HIGHLIGHT;
			}
			else {
				//pair.line_color=null;
				pair.line_weight=null;
			}
			this.mark_pair(pair);
			//this.draw_line(pair);
		}
	}

	mark_books (books, highlight_index: number)
	{
	    for ( let index in books) {
				let i = Number(index) ;
				books[i].skip_book_part=true;  // do not mark book rp1 and rp2
				this.mark_book(books[i], i, i == highlight_index) ;
	     }
	}

	fit_book(book){
		Util.convert_book_to_pairs(book);
		this.fit_pair(book);
	}


 	getRandomColor():string {
  		var letters = '23456789AB';
  		var color = '#';
  		for (var i = 0; i < 6; i++) {
    		color += letters[Math.floor(Math.random() * 10)];
  		}
  		return color;
	}

	createMap(mapTag: string, lat: number, long: number, zoom: number): L.Map
	{
		//map = L.map('map').setView([lat, long], zoom);
		this.map = L.map(mapTag).setView([lat, long], zoom);
		MapService.static_map= this.map;

		this.baseMaps.OpenStreetMapBusy.addTo( this.map ) ;
		return this.map;
	}


	set_view(point: any) : boolean {
		let p = MapService.point_guard(point) ;
		if (!p) return false; ;
		this.map.setView([p.lat, p.lon] , 12);
		return true;
	}



	fit_pair(pair: any) : boolean
	{
		if( ! MapService.pair_guard(pair) ) return false;
		let p1 = pair.p1 ;
		let p2 = pair.p2 ;
		let corner1 = L.latLng(p1.lat, p1.lon);
		let corner2 = L.latLng(p2.lat, p2.lon);
		let bounds = L.latLngBounds(corner1, corner2);

		this.map.fitBounds(bounds);
		//this.map.flyToBounds(bounds);
		return true;
	}

	mark_pair(pair:any) : boolean
	{
		if(!pair) return false;
		let p1 = pair.p1 ;
		let p2 = pair.p2 ;
		if(!p1) return false;
		if(!p2) return false;
		if(!p1.lat) return false;
		if(!p2.lat) return false;
		
		p1.color =  p1.color? p1.color  : C.COLOR_GREEN;
		p2.color =  p2.color? p2.color  : C.COLOR_RED ;

		if (p1.color == 'random') p1.color = this.getRandomColor();
		if (p2.color == 'random') p2.color = this.getRandomColor();
		if ( p1.color == 'random_same')
		{
			p1.color = this.getRandomColor();
			p2.color = p1.color;
		}

		let ok=this.mark_point( p1);
		if (! ok) return ok
		ok = this.mark_point(p2);
		if(!ok) return ok;
		ok = this.draw_line(pair);
		return ok;
	}

	try_mark_pair (pair: any) : boolean {
		let ok = this.mark_pair (pair);
		if (ok) {
			return ok;
		}
		ok = this.mark_point(pair.p1) ;
		if (ok) return ok;
		ok = this.mark_point(pair.p2) ;
		return ok;
	}

	try_fit_pair (pair: any) : boolean {
		if (!pair) return false;
		let ok = this.fit_pair (pair);
		if (ok) return ok;

		ok= this.set_view(pair.p1);
		if (ok) return ok;

		ok = this.set_view(pair.p2) ;
		return ok;
	}

	draw_line(pair: any):boolean {
		if ( !pair) 		return false;
		console.debug('201811041119 MapService.draw_lin() pair=\n'); 
		console.debug(C.stringify(pair)); 
		if ( !pair.p1) 		return false;
		if ( !pair.p2)   	return false;
		if ( !pair.p1.lat ) 	return false;
		if ( !pair.p2.lat ) 	return false;
		var polyline = L.polyline
		(
			[
	    			[pair.p1.lat, pair.p1.lon],
	    			[pair.p2.lat, pair.p2.lon],
	    		],
	    		{
				color: pair.line_color?pair.line_color:C.MAP_LINE_COLOR_REGULAR,
				weight: pair.line_weight?pair.line_weight:C.MAP_LINE_WEIGHT_REGULAR,
				opacity: 1 ,
				//dashArray: '20,15',
				//lineJoin: 'round'
	    		}
	    	).addTo(this.map);
		this.lines.push(polyline);
		return true;
	}

/*
	routingUrl(start_lat, start_lon, end_lat, end_lon){
	// curl 'http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=false'
		let url= "https://router.project-osrm.org/route/v1/driving/" ;
		let points=start_lon+","+ start_lat + ";" + end_lon+ ","+ end_lat  ;
		let query="?overview=false"  ;
		let urlEncoded=url+points+query ;
		return urlEncoded;
	}
*/

	static google_map_string(book): string | null {
		if (!book) return null ;
		Util.convert_book_to_pairs(book);
		let p1 = book.p1 ;
		let p2 = book.rp1 ;
		let p3 = book.rp2 ;
		let p4 = book.p2 ;
		
		return MapService.google_map_string_from_points([p1, p2, p3, p4]);
	}

	static google_map_string_from_points(points): string | null {
		if(!points) return null;
		let ps: any = null;
		if(Array.isArray(points))  ps = points;
		else ps=[points];

		let url = '';
		for(let index in ps ){
			let p= ps[index];
			if(p && Number(p.lat) && Number(p.lon) ) url += `/${p.lat},${p.lon}` ;
		}
			
		if (url === '')  return url;
		url = `<a href='${C.URL_GOOGLE_MAP}${url}' target=_blank >See it on Google Map</a>` ;
		console.debug('201810290011 MapService.google_map_string() url=', url);
		return url;
	}

	static map_viewport_with_margin(pair: any, margin_percent):any {
		if( ! MapService.pair_guard(pair) ) return null;
		let p1 =pair.p1;
		let p2 =pair.p2;
		let south 	= Math.min ( p1.lat, p2.lat);
		let north 	= Math.max ( p1.lat, p2.lat);
		let west 	= Math.min ( p1.lon, p2.lon);
		let east 	= Math.max ( p1.lon, p2.lon);

		let more_south 	= south - (north-south) * margin_percent/100;
		let more_north 	= north + (north-south) * margin_percent/100;
		let more_west	= west 	- (east-west) 	* margin_percent/100;
		let more_east	= east 	+ (east-west) 	* margin_percent/100;
		let viewport=  {	
					p1: {lat: more_south, lon: more_west}
				,	p2: {lat: more_north, lon: more_east}
				};
		console.debug ( '2018101121 MapService.map_viewport_with_margin pair=');
		console.debug ( C.stringify(pair));
		console.debug ( '2018101121 MapService.map_viewport_with_margin viewport=');
		console.debug ( C.stringify(viewport));
		return viewport;
	}

	static pair_guard(pair: any): any | null {
        if(!pair) return null;
        if(!MapService.point_guard(pair.p1)) return null;
        if(!MapService.point_guard(pair.p2)) return null;
		return pair;
	}

	static point_guard(point: any): any | null {
        if(!point) return null;
        let p = point;
        if(!p) return null;
        if ( ! p.lat ) return null;
        if ( ! p.lon ) return null;
        if ( ! Number(p.lat) ) return null;
        if ( ! Number(p.lon) ) return null;
		//p.lat= Number(p.lat);
		//p.lon= Number(p.lon);
		return point;
	}

}


export class PinIcon {
		//var myCustomColour = '#583470' ;
		
 	public static get (myCustomColour: string, text: string) {
		let markerHtmlStyles = 
		'background-color: ' + myCustomColour + ';' 				+
		'width: 3rem;' 				+
		'height: 3rem;' 				+
		'display: block;' 				+
		'left: -1.5rem;' 				+
		'top: -1.5rem;' 				+
		'position: relative;' 				+
		'border-radius: 3rem 3rem 0;' 				+
		'transform: rotate(45deg);' 				+
		'border: 1px solid #FFFFFF; '   ;
		
		let markerHtmlStylesSmall = 
		'background-color: ' + myCustomColour + ';' 				+
		'width: 2rem;' 				+
		'height: 2rem;' 				+
		'display: block;' 				+
		'left: -1rem;' 				+
		'top: -1rem;' 				+
		'position: relative;' 				+
		'border-radius: 2rem 2rem 0;' 				+
		'transform: rotate(45deg);' 				+
		'border: 1px solid #FFFFFF; '   ;
		
		let html= 	''  ;
		html +=`<span class="mapicon" style="background: radial-gradient(red,white, red 70%); width:1.5rem;height:1.5rem;display: block; left: -0.75rem;top: -1.5rem;position: absolute; border: 0px solid white; border-radius: 20rem" >${text}</span>`  ;
		//html +='<span class="mapiconcenter" style="background: linear-gradient(to bottom right, white, white);; width:0.5rem;height: 0.5rem;display: block; left: -0.25rem;top: -1.0rem;position: absolute; border: 0rem solid red; border-radius: 20rem" ></span>' ;
		html +='<span class="mapiconstemfrom" style=" background-color: red; width: 0.2rem;height: 1.5rem;display: block; left: -0.1rem;top: -0.1rem;position: absolute; border: 0rem solid red; border-radius: 8rem" ></span> ' ;
		html = html.replace(/red/g, myCustomColour);
		
		
		
		
		//console.log ("DEBUG 201807181726 markerHtmlStyles= " + markerHtmlStyles) ;
		
		let colorIcon = L.divIcon({
		className: "my-custom-pin",
		//className: "",
		iconAnchor: [0, 24],
		//labelAnchor: [-6, 0],
		popupAnchor: [0, -36],
		//html: '<span style="'+ markerHtmlStylesSmall+ '" />'
		html: html
		})   ;
		return colorIcon;
	}
}

export class DotIcon {
		//var myCustomColour = '#583470' ;
		
 	public static get (myCustomColour: string, text: string) {
		let markerHtmlStyles = 
		'background-color: ' + myCustomColour + ';' 				+
		'width: 3rem;' 				+
		'height: 3rem;' 				+
		'display: block;' 				+
		'left: -1.5rem;' 				+
		'top: -1.5rem;' 				+
		'position: relative;' 				+
		'border-radius: 3rem 3rem 0;' 				+
		'transform: rotate(45deg);' 				+
		'border: 1px solid #FFFFFF; '   ;
		
		let markerHtmlStylesSmall = 
		'background-color: ' + myCustomColour + ';' 				+
		'width: 2rem;' 				+
		'height: 2rem;' 				+
		'display: block;' 				+
		'left: -1rem;' 				+
		'top: -1rem;' 				+
		'position: relative;' 				+
		'border-radius: 2rem 2rem 0;' 				+
		'transform: rotate(45deg);' 				+
		'border: 1px solid #FFFFFF; '   ;
		
		let html= 	''  ;
		html +=`<span class="mapicon" style="background: radial-gradient(white, red ); width:1rem;height:1rem;display: block; left: -0.5rem;top: 1rem;position: absolute; border: 0px solid white; border-radius: 20rem" >${text}</span>`  ;
		//html +='<span class="mapiconcenter" style="background: linear-gradient(to bottom right, white, white);; width:0.5rem;height: 0.5rem;display: block; left: -0.25rem;top: -1.0rem;position: absolute; border: 0rem solid red; border-radius: 20rem" ></span>' ;
		//html +='<span class="mapiconstemfrom" style=" background-color: red; width: 0.2rem;height: 1.5rem;display: block; left: -0.1rem;top: -0.1rem;position: absolute; border: 0rem solid red; border-radius: 8rem" ></span> ' ;
		html = html.replace(/red/g, myCustomColour);
		
		
		
		
		//console.log ("DEBUG 201807181726 markerHtmlStyles= " + markerHtmlStyles) ;
		
		let colorIcon = L.divIcon({
		className: "my-custom-dot",
		//className: "",
		iconAnchor: [0, 24],
		//labelAnchor: [-6, 0],
		popupAnchor: [0, -36],
		//html: '<span style="'+ markerHtmlStylesSmall+ '" />'
		html: html
		})   ;
		return colorIcon;
	}
}
	
	
