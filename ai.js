const video = document.getElementById("camera");

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;

    // Send frames to AI every 1.5 sec
    setInterval(() => {
      if (video) detectObjects(video);
    }, 1500);
  })
  .catch(err => {
    console.log("Camera access denied:", err);
  });

function detectSleep() {
  document.getElementById("status").innerHTML =
    'Status: <span style="color:red">Drowsy</span>';

  document.getElementById("alert-text").innerText =
    "⚠️ Drowsiness detected!";
}