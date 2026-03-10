// Main demo controller

function startDemo() {
  console.log("Demo started");

  // Step 1: Fake drowsiness after 3 seconds
  setTimeout(() => {
    detectSleep();

    if (typeof speakWarning === "function") {
      speakWarning();
    }
  }, 3000);

  // Step 2: Alarm if no response
  setTimeout(() => {
    if (typeof playAlarm === "function") {
      playAlarm();
    }

    const alertText = document.getElementById("alert-text");
    if (alertText) {
      alertText.innerText = "🔊 No response detected. Alarm triggered!";
    }
  }, 6000);

  // Step 3: Trigger SOS
  setTimeout(() => {
    if (typeof triggerSOS === "function") {
      triggerSOS();
    }
  }, 10000);
}


// ---------------- MODE SWITCH ----------------

let currentMode = "driver";

function setMode(mode) {
  currentMode = mode;
  console.log("Mode:", mode);
}

window.setMode = function(mode) {
  console.log("Mode switched to:", mode);

  const status = document.getElementById("status");

  if (mode === "driver") {
    status.innerText = "Driver monitoring active";
  }

  if (mode === "road") {
    status.innerText = "Road hazard detection active";
  }
};
// ---------------- GEORISK PAGE ----------------

function openGeoRisk() {
  const geoPage = document.getElementById("geoRiskPage");
  const homePage = document.getElementById("homePage");

  if (geoPage) geoPage.style.display = "block";
  if (homePage) homePage.style.display = "none";

  // load map after page opens
  setTimeout(loadRiskMap, 300);
}


// -------- GEORISK MAP --------

function loadRiskMap(){

const map = L.map('riskMap').setView([26.9124, 75.7873], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);


// USER LOCATION

const userLat = 26.9124;
const userLon = 75.7873;

L.marker([userLat,userLon])
.addTo(map)
.bindPopup("📍 Your Location - Rajasthan")
.openPopup();


// ACCIDENT ZONES

const accidentPoints = [

[26.9124,75.7873], // Jaipur
[26.4499,74.6399], // Ajmer
[24.5854,73.7125], // Udaipur
[25.2138,75.8648], // Kota
[27.0238,74.2179]  // Nagaur

];


accidentPoints.forEach(point => {

L.circleMarker(point,{
radius:10,
color:'#ff3b3b',
fillColor:'#ff0000',
fillOpacity:0.9
})
.addTo(map)
.bindPopup("🚨 Accident Prone Area");

});

}
function openFeature(pageId) {

const pages = document.querySelectorAll(".feature-page");
pages.forEach(p => p.style.display = "none");

document.getElementById("homePage").style.display = "none";

document.getElementById(pageId).style.display = "block";

}
function goHome() {

const pages = document.querySelectorAll(".feature-page");

pages.forEach(p => p.style.display = "none");

document.getElementById("homePage").style.display = "grid";

}
async function loadEmergencyMap(){

const map = L.map('map').setView([26.9124,75.7873],10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
attribution:'© OpenStreetMap'
}).addTo(map);


const response = await fetch("/emergency_locations");
const locations = await response.json();

locations.forEach(loc => {

let icon = "📍";

if(loc.type === "hospital") icon = "🏥";
if(loc.type === "police") icon = "🚓";
if(loc.type === "fuel") icon = "⛽";

L.marker([loc.lat, loc.lon])
.addTo(map)
.bindPopup(icon + " " + loc.name);

});

}
function openEmergencyLocator(){

const pages = document.querySelectorAll(".feature-page");
pages.forEach(p => p.style.display = "none");

document.getElementById("homePage").style.display = "none";
document.getElementById("locatorPage").style.display = "block";

setTimeout(loadEmergencyMap,300);

}
const ctx1 = document.getElementById('alertChart');
const ctx2 = document.getElementById('fatigueChart');

if(ctx1 && ctx2){

new Chart(ctx1,{
type:'doughnut',
data:{
datasets:[{
data:[87,13],
backgroundColor:["#22d3ee","#1f2937"]
}]
}
});

new Chart(ctx2,{
type:'doughnut',
data:{
datasets:[{
data:[15,85],
backgroundColor:["#22ffa6","#1f2937"]
}]
}
});

}
// ---------------- DRIVER ANALYTICS CHARTS ----------------

let alertChart;
let fatigueChart;

function initCharts(){

const ctx1 = document.getElementById("alertChart")?.getContext("2d");
const ctx2 = document.getElementById("fatigueChart")?.getContext("2d");

if(!ctx1 || !ctx2) return;

alertChart = new Chart(ctx1,{
type:"doughnut",
data:{
datasets:[{
data:[80,20],
backgroundColor:["#22d3ee","#1f2937"],
borderWidth:0
}]
},
options:{
cutout:"70%",
plugins:{legend:{display:false}}
}
});

fatigueChart = new Chart(ctx2,{
type:"doughnut",
data:{
datasets:[{
data:[20,80],
backgroundColor:["#22ffa6","#1f2937"],
borderWidth:0
}]
},
options:{
cutout:"70%",
plugins:{legend:{display:false}}
}
});

}

document.addEventListener("DOMContentLoaded",initCharts);
// ---------------- LIVE DRIVER METRICS ----------------

async function updateDriverMetrics(){

try{

const res = await fetch("/fatigue");
const data = await res.json();

const fatigue = data.fatigue;
const alertness = 100 - fatigue;



if(fatigue < 20){
addLog("Normal driving posture","SAFE");
}

if(fatigue > 30 && fatigue < 60){
addLog("Frequent blinking detected","INFO");
}

if(fatigue > 60){
addLog("Driver distracted","WARNING");
}

if(fatigue > 80){
addLog("Driver fatigue detected","DANGER");
}

if(alertChart){
alertChart.data.datasets[0].data = [alertness,100-alertness];
alertChart.update();
}

if(fatigueChart){
fatigueChart.data.datasets[0].data = [fatigue,100-fatigue];
fatigueChart.update();
}

document.getElementById("drowsyBar").style.width = fatigue + "%";
document.getElementById("safetyBar").style.width = alertness + "%";

}catch(err){
console.log("Metrics error:",err);
}

}

function addLog(event,severity){

const table = document.querySelector(".behavior-log table");
if(!table) return;

const row = table.insertRow(1);

const time = new Date().toLocaleTimeString();

row.innerHTML = `
<td>${time}</td>
<td>${event}</td>
<td class="${severity.toLowerCase()}">${severity}</td>
`;

if(table.rows.length > 8){
table.deleteRow(8);
}

}
