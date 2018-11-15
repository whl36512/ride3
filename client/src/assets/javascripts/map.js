// See post: http://asmaloney.com/2014/01/code/creating-an-interactive-map-with-leaflet-and-openstreetmap/
var map;
var marker;
var marker1;
var markerTo;
var markerFrom;

function myIcon (myCustomColour){
//var myCustomColour = '#583470' ;

  var markerHtmlStyles = 
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

  var markerHtmlStylesSmall = 
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

  var 	html= 	''  ;
	html +='<span class="mapiconfrom" style="background: radial-gradient(red,white, red 70%); width:1.5rem;height:1.5rem;display: block; left: -0.75rem;top: -1.5rem;position: absolute; border: 0px solid white; border-radius: 20rem" ></span>'  ;
	//html +='<span class="mapiconcenter" style="background: linear-gradient(to bottom right, white, white);; width:0.5rem;height: 0.5rem;display: block; left: -0.25rem;top: -1.0rem;position: absolute; border: 0rem solid red; border-radius: 20rem" ></span>' ;
	html +='<span class="mapiconstemfrom" style=" background-color: red; width: 0.2rem;height: 1.5rem;display: block; left: -0.1rem;top: -0.1rem;position: absolute; border: 0rem solid red; border-radius: 8rem" ></span> ' ;
        html = html.replace(/red/g, myCustomColour);


    

    //console.log ("DEBUG 201807181726 markerHtmlStyles= " + markerHtmlStyles) ;
  
  var colorIcon = L.divIcon({
    className: "my-custom-pin",
    //className: "",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    //html: '<span style="'+ markerHtmlStylesSmall+ '" />'
    html: html
    })   ;
    return colorIcon;
}

function createMap(lat, long, zoom)
{
	map = L.map('map').setView([lat, long], zoom);

	L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	subdomains: ['a', 'b', 'c']
	}).addTo( map ) ;
}

function flyTo(lat,lon,name){
	console.log("flyTo");
	map.setView([lat,lon],12);
	//map.flyTo([lat,lon],12);
	if(marker) {         map.removeLayer(marker); }
	//if(marker1) {         map.removeLayer(marker); }
	if(markerTo) {         map.removeLayer(markerTo); }
	if(markerFrom) {         map.removeLayer(markerFrom); }
	//marker1= L.marker([lat,lon]).addTo(map).bindPopup(name) ;
	marker= L.marker([lat,lon], {icon:myIcon('#583470')}).addTo(map).bindPopup(name) ;
}


function flyToBounds(start_lat, start_lon, start_display_name, end_lat, end_lon, end_display_name)
{
	console.log("flyToBounds");
	fitB= map.fitBounds([
    		[start_lat, start_lon],
    		[end_lat, end_lon]
	]);
	if(marker) {         map.removeLayer(marker); }
	if(markerTo) {         map.removeLayer(markerTo); }
	if(markerFrom) {         map.removeLayer(markerFrom); }
	map.flyToBounds(fitB);
	markerFrom= L.marker([start_lat,start_lon], {icon:myIcon('green')} ).addTo(map).bindPopup(start_display_name) ;
	markerTo= L.marker([end_lat,end_lon], {icon:myIcon('red')} ).addTo(map).bindPopup(end_display_name) ;
}


function routingUrl(start_lat, start_lon, end_lat, end_lon){
// curl 'http://router.project-osrm.org/route/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?overview=false'
	var url= "http://router.project-osrm.org/route/v1/driving/" ;
	points=start_lon+","+ start_lat + ";" + end_lon+ ","+ end_lat  ;
	var query="?overview=false"  ;
	var urlEncoded=url+points+query ;
	return urlEncoded;
}

createMap(41.889489, -87.633229, 12);

//var rb='<a href="https://regionbound.com">RegionBound</a> | ';
//var cc='<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
//var attr1=rb+'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, '+cc;
//var tileLayer1Options={attribution:attr1};
//var tileLayer1=L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',tileLayer1Options);
//var attr2=rb+'Tiles © <a target="attr" href="http://esri.com">Esri</a>';
//var tileLayer2Options={attribution:attr2};
//var tileLayer2=L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/world_topo_map/MapServer/tile/{z}/{y}/{x}.png',tileLayer2Options);
//var flyMap;
//function flyTo(lat,lon,name){
	//flyMap.flyTo([lat,lon],11);
	//L.marker([lat,lon]).addTo(flyMap).bindPopup(name+"<br/>International Airport<br/>["+lat+", "+lon+"]")
//}
//var mapOptions={};
//flyMap=L.map('map-with-flyto',mapOptions).locate({setView:true,maxZoom:16});
//tileLayer2.addTo(flyMap);
//var layers={'OSM':tileLayer1,'Esri Topo':tileLayer2};
//L.control.layers(layers,{}).addTo(flyMap);
//flyMap.on('locationfound',function(e){var radius=(e.accuracy/2).toFixed();L.circle(e.latlng,radius).addTo(flyMap).bindPopup("You are within this circle");L.marker(e.latlng).addTo(flyMap).bindPopup("You are within "+radius+" meters of this marker.");});
//flyMap.on('locationerror',function(e){alert(e.message);});</script></div></div></div>    </article>
//



