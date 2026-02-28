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