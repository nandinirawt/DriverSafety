function openFeature(page){

document.getElementById("homePage").style.display="none"

document.querySelectorAll(".feature-page").forEach(p=>{

p.style.display="none"

})
if(page === "locatorPage"){
setTimeout(loadEmergencyMap,300);
}
if(page === "analyticsPage"){
setTimeout(loadAnalyticsCharts,100)
}

document.getElementById(page).style.display="block"

}

function goHome(){

// hide all feature pages
document.querySelectorAll(".feature-page").forEach(page=>{
page.style.display="none"
})

// show homepage
const home=document.getElementById("homePage")
if(home){
home.style.display="grid"
}

}


async function startDriverCamera(){

const video=document.getElementById("driverCamera")

const stream=await navigator.mediaDevices.getUserMedia({video:true})

video.srcObject=stream

}


async function startRoadCamera(){

const video=document.getElementById("roadCamera")

const stream=await navigator.mediaDevices.getUserMedia({video:true})

video.srcObject=stream

}


let emergencyContact=null


function saveContact(){

const name=document.getElementById("contactName").value
const number=document.getElementById("contactNumber").value

emergencyContact={name,number}

alert("Contact saved")

}


function triggerSOS(){

document.getElementById("sosStatus").innerText="Emergency Alert Sent"

if(emergencyContact){

alert("SOS sent to "+emergencyContact.name)

}

}
function updateGauge(circle,value){

const radius=60
const circumference=2*Math.PI*radius

const offset=circumference-(value/100)*circumference

circle.style.strokeDashoffset=offset

}


function updateSafetyMeter(level){

const bar=document.getElementById("safetyIndicator")

if(level==="safe"){

bar.style.width="30%"
bar.style.background="#22c55e"

}

if(level==="warning"){

bar.style.width="60%"
bar.style.background="#facc15"

}

if(level==="drowsy"){

bar.style.width="90%"
bar.style.background="#ef4444"

}

}


// DEMO VALUES

updateGauge(document.getElementById("alertCircle"),87)

updateGauge(document.getElementById("fatigueCircle"),15)

updateSafetyMeter("safe")
function addLog(event, severity){

const container = document.getElementById("logContainer")

const now = new Date()
const time = now.toLocaleTimeString()

const row = document.createElement("div")
row.className = "log-row"

row.innerHTML = `
<span>${time}</span>
<span>${event}</span>
<span class="${severity}">${severity.toUpperCase()}</span>
`

/* Add new event at top */
container.prepend(row)

/* Smooth scroll to show newest log */
container.scrollTo({
top:0,
behavior:"smooth"
})

}
setInterval(()=>{

const events = [
["Eyes closed detected","warning"],
["Yawn detected","warning"],
["Driver distracted","danger"],
["Normal driving posture","safe"],
["Frequent blinking pattern","info"]
]

const random = events[Math.floor(Math.random()*events.length)]

addLog(random[0], random[1])

},4000)
function updateLiveStats(){

document.getElementById("eyeOpenValue").innerText =
Math.floor(Math.random()*40+60)+"%"

document.getElementById("headPoseValue").innerText =
Math.floor(Math.random()*30+70)+"%"

document.getElementById("blinkRateValue").innerText =
Math.floor(Math.random()*10+15)+"/m"

}

setInterval(updateLiveStats,3000)
function openPothole(){

document.getElementById("homePage").style.display="none"
document.getElementById("potholePage").style.display="flex"

}
function loadAnalyticsCharts(){

new Chart(document.getElementById("fatigueChart"),{
type:"bar",
data:{
labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
datasets:[
{
label:"Fatigue",
data:[20,35,18,45,28,15,10],
backgroundColor:"#ffd700"
},
{
label:"Distraction",
data:[18,30,22,40,25,12,8],
backgroundColor:"#22c1dc"
}
]
}
})

new Chart(document.getElementById("safetyChart"),{
type:"line",
data:{
labels:["T1","T2","T3","T4","T5","T6","T7","T8"],
datasets:[
{
label:"Safety Score",
data:[78,85,91,74,88,95,82,94],
borderColor:"#00ffa6",
tension:0.4
}
]
}
})

new Chart(document.getElementById("behaviorChart"),{
type:"doughnut",
data:{
labels:["Eyes Closed","Head Tilt","Yawning","Phone Use","Normal"],
datasets:[{
data:[12,8,15,3,62],
backgroundColor:[
"#ff4d4d",
"#ffd700",
"#22c1dc",
"#ff8c8c",
"#00ffa6"
]
}]
}
})



}
function loadEmergencyMap(){

if(!navigator.geolocation){
alert("Geolocation not supported");
return;
}

navigator.geolocation.getCurrentPosition(async position => {

const lat = position.coords.latitude;
const lon = position.coords.longitude;

updateLocationText(lat,lon);

const map = L.map('map').setView([lat, lon], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);

L.marker([lat,lon]).addTo(map)
.bindPopup("You are here")
.openPopup();

findNearbyServices(lat,lon,map);

});

}
async function updateLocationText(lat,lon){

const url =
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

const res = await fetch(url);
const data = await res.json();

const city =
data.address.city ||
data.address.town ||
data.address.village ||
"Your Location";

const state = data.address.state || "";

const locationText = document.querySelector(".sub");

if(locationText){
locationText.innerText =
`📍 Current location: ${city}, ${state}`;
}

}
async function findNearbyServices(lat, lon, map) {

const query = `
[out:json][timeout:25];
(
node["amenity"="hospital"](around:8000,${lat},${lon});
node["amenity"="police"](around:8000,${lat},${lon});
node["amenity"="fuel"](around:8000,${lat},${lon});
node["shop"="car_repair"](around:8000,${lat},${lon});
);
out body;
`;

const url =
"https://overpass-api.de/api/interpreter?data=" +
encodeURIComponent(query);

const response = await fetch(url);
const data = await response.json();

let hospitals = 0;
let police = 0;
let fuel = 0;
let garage = 0;

const serviceList = document.getElementById("serviceList");
if(serviceList) serviceList.innerHTML = "";

data.elements.forEach(place => {

const amenity = place.tags.amenity;
const shop = place.tags.shop;
const name = place.tags.name || "Emergency Service";

let type = "";

if (amenity === "hospital") {
hospitals++;
type = "Hospital";
}

if (amenity === "police") {
police++;
type = "Police Station";
}

if (amenity === "fuel") {
fuel++;
type = "Fuel Station";
}

if (shop === "car_repair") {
garage++;
type = "Garage";
}

if (!type) return;

// MAP MARKER

L.marker([place.lat, place.lon])
.addTo(map)
.bindPopup(`<b>${name}</b><br>${type}`);

// SERVICE LIST CARD

if(serviceList){

const card = document.createElement("div");
card.className = "service-card";

card.innerHTML = `
<div>
<h4>${name}</h4>
<p>${type}</p>
<span class="meta">Nearby service</span>
</div>

<div class="service-actions">
<button onclick="navigateTo(${place.lat},${place.lon})">
Navigate
</button>
</div>
`;

serviceList.appendChild(card);

}

});

// UPDATE COUNTS

document.getElementById("hospitalCount").innerText = hospitals;
document.getElementById("policeCount").innerText = police;
document.getElementById("fuelCount").innerText = fuel;
document.getElementById("garageCount").innerText = garage;

}
function updateCounts(h,p,f,g){

const hospitalCount=document.getElementById("hospitalCount");
const policeCount=document.getElementById("policeCount");
const fuelCount=document.getElementById("fuelCount");
const garageCount=document.getElementById("garageCount");

if(hospitalCount) hospitalCount.innerText=h;
if(policeCount) policeCount.innerText=p;
if(fuelCount) fuelCount.innerText=f;
if(garageCount) garageCount.innerText=g;

}
function navigateTo(lat,lon){

window.open(
`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
"_blank"
);

}