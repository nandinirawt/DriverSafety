const video = document.getElementById("camera");

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
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
