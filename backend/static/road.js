const roadVideo = document.getElementById("roadCamera");


// Start road camera
async function startRoadCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  roadVideo.srcObject = stream;
}

startRoadCamera();


// Send frame to Flask
async function detectObjects(video) {

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg"));

  const formData = new FormData();
  formData.append("frame", blob);

  const res = await fetch("/detect", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  drawBoxes(video, data);

  // Example text update
  if (data.length > 0) {
    const el = document.getElementById("ai-result");
    if (el) {
      el.innerText = "Detected: " + data[0].class;
    }
  }

}


// Draw detection boxes
function drawBoxes(video, detections) {

  let overlay = document.getElementById("overlay");

  if (!overlay) {
    overlay = document.createElement("canvas");
    overlay.id = "overlay";
    overlay.style.position = "absolute";
    overlay.style.pointerEvents = "none";

    video.parentElement.style.position = "relative";
    video.parentElement.appendChild(overlay);
  }

  // match overlay to displayed video size
  const rect = video.getBoundingClientRect();

  overlay.width = rect.width;
  overlay.height = rect.height;

  overlay.style.left = video.offsetLeft + "px";
  overlay.style.top = video.offsetTop + "px";

  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  const scaleX = rect.width / video.videoWidth;
  const scaleY = rect.height / video.videoHeight;

  detections.forEach(det => {

    const [x1, y1, x2, y2] = det.box;

    const sx = x1 * scaleX;
    const sy = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    // class color
    let color = "#facc15";

    if(det.class.toLowerCase().includes("alligator")) color = "#3b82f6";
    if(det.class.toLowerCase().includes("longitudinal")) color = "#22c55e";
    if(det.class.toLowerCase().includes("lateral")) color = "#a855f7";
    if(det.class.toLowerCase().includes("pothole")) color = "#facc15";

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, sw, sh);

    const label = `${det.class} ${(det.confidence*100).toFixed(1)}%`;

    ctx.font = "14px Arial";
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = color;
    ctx.fillRect(sx, sy - 20, textWidth + 10, 20);

    ctx.fillStyle = "black";
    ctx.fillText(label, sx + 5, sy - 5);

  });

}


// Run detection every 0.5 seconds
setInterval(() => {

  if (roadVideo && roadVideo.videoWidth > 0) {
    detectObjects(roadVideo);
  }

}, 500);
