const backendURL = "http://localhost:3000";
let emergencyContact=null;
let eyeInterval=null;
let eyeSeconds=0;

function login(){

const user=document.getElementById("username").value;
const pass=document.getElementById("password").value;

if(user && pass){

document.getElementById("authScreen").style.display="none";
document.getElementById("dashboard").style.display="block";

}else{

alert("Enter valid credentials");

}

}

function signup(){

alert("Account created successfully! Please login.");

}

async function startDriverCamera(){

const video=document.getElementById("driverCamera");

const stream=await navigator.mediaDevices.getUserMedia({video:true});

video.srcObject=stream;
video.style.display="block";
fetch(`${backendURL}/driving/start`, {method:"POST"});

}

async function startRoadCamera(){

const video=document.getElementById("roadCamera");

const stream=await navigator.mediaDevices.getUserMedia({video:true});

video.srcObject=stream;
video.style.display="block";

}

function simulateEyesClosed(){

document.getElementById("driverStatus").innerText="Eyes Closed ⚠ Monitoring...";
document.getElementById("driverStatus").className="status warning";

eyeSeconds=0;

clearInterval(eyeInterval);

eyeInterval=setInterval(()=>{

eyeSeconds++;

document.getElementById("eyeTimer").innerText=
"Eyes closed for: "+eyeSeconds+" seconds";

if(eyeSeconds>=40){

clearInterval(eyeInterval);

document.getElementById("driverStatus").innerText=
"Driver Unconscious 🚨";

document.getElementById("driverStatus").className="status danger";

triggerSOS();

}

},1000);

}

function resetEyes(){

clearInterval(eyeInterval);

document.getElementById("eyeTimer").innerText="";

document.getElementById("driverStatus").innerText="Driver Active";

document.getElementById("driverStatus").className="status active";

}

function detectObstacle(){

const conditions=[

{text:"Road Clear",class:"active"},

{text:"Pothole Detected ⚠",class:"warning"},

{text:"Major Blockage 🚧",class:"danger"}

];

let random=conditions[Math.floor(Math.random()*conditions.length)];

document.getElementById("roadStatus").innerText=random.text;

document.getElementById("roadStatus").className="status "+random.class;

}

function saveContact(){

const name=document.getElementById("contactName").value;

const number=document.getElementById("contactNumber").value;

if(name && number){

emergencyContact={name,number};

document.getElementById("savedContact").innerText=
"Saved: "+name+" ("+number+")";

}

}

function triggerSOS(){

document.getElementById("sosStatus").innerText=
"Emergency Alert Sent 🚨";

document.getElementById("sosStatus").className="status danger";

let message="Authorities Notified.";

if(emergencyContact){

message+="\nFamily Notified: "+
emergencyContact.name+" ("+
emergencyContact.number+")";

}

alert(message);

}