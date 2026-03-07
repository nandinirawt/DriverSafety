// ---------------- DRIVER STATUS FUNCTIONS ----------------

// Called when drowsiness is detected
function detectSleep() {

  const status = document.getElementById("status");
  const alertText = document.getElementById("alert-text");

  if (status) {
    status.innerHTML = 'Status: <span style="color:red">Drowsy</span>';
  }

  if (alertText) {
    alertText.innerText = "⚠️ Drowsiness detected!";
  }
}


// Reset driver state to safe
function resetStatus() {

  const status = document.getElementById("status");
  const alertText = document.getElementById("alert-text");

  if (status) {
    status.innerHTML = 'Status: <span class="safe">Awake</span>';
  }

  if (alertText) {
    alertText.innerText = "No alerts yet";
  }
}


// ---------------- DEMO BUTTON ----------------

function startDemo() {

  const alertText = document.getElementById("alert-text");

  if (alertText) {
    alertText.innerText = "Demo started. Monitoring driver...";
  }

}


// ---------------- MODE SWITCH ----------------

function setMode(mode) {

  const status = document.getElementById("status");
  const alertText = document.getElementById("alert-text");

  if (mode === "driver") {

    if (alertText) {
      alertText.innerText = "Driver monitoring active";
    }

    if (status) {
      status.innerHTML = 'Status: <span class="safe">Awake</span>';
    }

  }

  if (mode === "road") {

    if (alertText) {
      alertText.innerText = "Road monitoring active";
    }

  }

}


// ---------------- SOS FUNCTION ----------------

function triggerSOS() {

  const sosStatus = document.getElementById("sos-status");

  if (sosStatus) {
    sosStatus.innerText = "SOS sent! Emergency contacts notified.";
  }

}