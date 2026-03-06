async function detectObjects(video) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(video, 0, 0);

  const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg"));

  const formData = new FormData();
  formData.append("frame", blob);

  const res = await fetch("http://127.0.0.1:5000/detect", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  drawBoxes(video, data);
}

  // Example alert
  if (data.length > 0) {
    const el = document.getElementById("ai-result");
if (el && data.length > 0) {
  el.innerText = "Detected: " + data[0].class;
}
  }
  function drawBoxes(video, detections) {
  let overlay = document.getElementById("overlay");

  if (!overlay) {
    overlay = document.createElement("canvas");
    overlay.id = "overlay";
    overlay.style.position = "absolute";
    overlay.style.pointerEvents = "none";
    video.parentElement.appendChild(overlay);
  }

  const rect = video.getBoundingClientRect();

  overlay.width = rect.width;
  overlay.height = rect.height;
  overlay.style.left = video.offsetLeft + "px";
  overlay.style.top = video.offsetTop + "px";

  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  const scaleX = overlay.width / video.videoWidth;
  const scaleY = overlay.height / video.videoHeight;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.font = "14px Arial";
  ctx.fillStyle = "red";

  detections.forEach(det => {
    const [x1, y1, x2, y2] = det.box;

    const sx = x1 * scaleX;
    const sy = y1 * scaleY;
    const sw = (x2 - x1) * scaleX;
    const sh = (y2 - y1) * scaleY;

    ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillText(det.class, sx + 4, sy + 14);
  });
}

