// const roadVideo = document.getElementById("roadCamera");


// // Start road camera
// async function startRoadCamera() {
//   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//   roadVideo.srcObject = stream;
// }

// startRoadCamera();


// // Send frame to Flask
// async function detectObjects(video) {

//   const canvas = document.createElement("canvas");
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(video, 0, 0);

//   const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg"));

//   const formData = new FormData();
//   formData.append("frame", blob);

//   const res = await fetch("/detect", {
//     method: "POST",
//     body: formData
//   });

//   const data = await res.json();

//   drawBoxes(video, data);

//   // Example text update
//   if (data.length > 0) {
//     const el = document.getElementById("ai-result");
//     if (el) {
//       el.innerText = "Detected: " + data[0].class;
//     }
//   }

// }


// // Draw detection boxes
// function drawBoxes(video, detections) {

//   let overlay = document.getElementById("overlay");

//   if (!overlay) {
//     overlay = document.createElement("canvas");
//     overlay.id = "overlay";
//     overlay.style.position = "absolute";
//     overlay.style.pointerEvents = "none";

//     video.parentElement.style.position = "relative";
//     video.parentElement.appendChild(overlay);
//   }

//   // match overlay to displayed video size
//   const rect = video.getBoundingClientRect();

//   overlay.width = rect.width;
//   overlay.height = rect.height;

//   overlay.style.left = video.offsetLeft + "px";
//   overlay.style.top = video.offsetTop + "px";

//   const ctx = overlay.getContext("2d");
//   ctx.clearRect(0, 0, overlay.width, overlay.height);

//   const scaleX = rect.width / video.videoWidth;
//   const scaleY = rect.height / video.videoHeight;

//   detections.forEach(det => {

//     const [x1, y1, x2, y2] = det.box;

//     const sx = x1 * scaleX;
//     const sy = y1 * scaleY;
//     const sw = (x2 - x1) * scaleX;
//     const sh = (y2 - y1) * scaleY;

//     // class color
//     let color = "#facc15";

//     if(det.class.toLowerCase().includes("alligator")) color = "#3b82f6";
//     if(det.class.toLowerCase().includes("longitudinal")) color = "#22c55e";
//     if(det.class.toLowerCase().includes("lateral")) color = "#a855f7";
//     if(det.class.toLowerCase().includes("pothole")) color = "#facc15";

//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//     ctx.strokeRect(sx, sy, sw, sh);

//     const label = `${det.class} ${(det.confidence*100).toFixed(1)}%`;

//     ctx.font = "14px Arial";
//     const textWidth = ctx.measureText(label).width;

//     ctx.fillStyle = color;
//     ctx.fillRect(sx, sy - 20, textWidth + 10, 20);

//     ctx.fillStyle = "black";
//     ctx.fillText(label, sx + 5, sy - 5);

//   });

// }


// // Run detection every 0.5 seconds
// setInterval(() => {

//   if (roadVideo && roadVideo.videoWidth > 0) {
//     detectObjects(roadVideo);
//   }

// }, 500);
// ==========================================
// ROAD / POTHOLE MONITORING
// ==========================================

let roadVideo = null;
let roadStream = null;
let roadMonitoring = false;
let detectionTimer = null;


// ==========================================
// START ROAD MONITORING
// ==========================================

async function startRoadMonitoring() {

    if (roadMonitoring) {
        return;
    }

    roadVideo = document.getElementById("roadCamera");

    if (!roadVideo) {
        console.log("Road camera element not found.");
        return;
    }

    try {

        console.log("Starting road camera...");

        roadStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        roadVideo.srcObject = roadStream;

        await roadVideo.play();

        roadMonitoring = true;

       updateRoadToggle(true);


        // Start AI detection
        detectionTimer = setInterval(() => {

            if (
                roadMonitoring &&
                roadVideo &&
                roadVideo.readyState >= 2 &&
                roadVideo.videoWidth > 0
            ) {
                detectObjects(roadVideo);
            }

        }, 500);

        console.log("✅ Road monitoring started.");

    } catch (error) {

        console.error("❌ Road camera error:", error);

        roadMonitoring = false;

        updateRoadToggle(false);

        alert("Could not access the road camera.");

    }
}


// ==========================================
// STOP ROAD MONITORING
// ==========================================

function stopRoadMonitoring() {

    console.log("Stopping road monitoring...");

    roadMonitoring = false;

    // Stop AI detection timer
    if (detectionTimer) {

        clearInterval(detectionTimer);
        detectionTimer = null;

    }

    // Stop camera
    if (roadStream) {

        roadStream.getTracks().forEach(track => {
            track.stop();
        });

        roadStream = null;

    }

    // Clear video
    if (roadVideo) {

        roadVideo.pause();
        roadVideo.srcObject = null;

    }

    // Clear detection boxes
    const overlay = document.getElementById("overlay");

    if (overlay) {

        const ctx = overlay.getContext("2d");

        if (ctx) {
            ctx.clearRect(
                0,
                0,
                overlay.width,
                overlay.height
            );
        }

    }

    updateRoadToggle(false);


    console.log("🛑 Road monitoring stopped.");

}


// ==========================================
// ON / OFF TOGGLE
// ==========================================

function toggleRoadMonitoring() {

    if (roadMonitoring) {

        stopRoadMonitoring();

    } else {

        startRoadMonitoring();

    }

}


// Make function available to HTML onclick
window.toggleRoadMonitoring = toggleRoadMonitoring;


// ==========================================
// UPDATE UI
// ==========================================

function updateRoadToggle(isOn) {

    const button = document.getElementById("roadToggle");
    const text = document.getElementById("roadStatusButton");
    const statusText = document.getElementById("roadStatusText");

    if (!button || !text || !statusText) {
        return;
    }

    if (isOn) {

        text.innerText = "ON";
        statusText.innerText = "Road monitoring active";

        button.classList.add("active");

    } else {

        text.innerText = "OFF";
        statusText.innerText = "Road monitoring OFF";

        button.classList.remove("active");

    }

}


// ==========================================
// SEND FRAME TO FLASK
// ==========================================

async function detectObjects(video) {

    // IMPORTANT:
    // Never detect when monitoring is OFF.

    if (!roadMonitoring) {
        return;
    }

    if (!video || video.videoWidth === 0) {
        return;
    }

    try {

        const canvas = document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const blob = await new Promise(resolve => {

            canvas.toBlob(
                resolve,
                "image/jpeg",
                0.8
            );

        });

        if (!blob || !roadMonitoring) {
            return;
        }

        const formData = new FormData();

        formData.append(
            "frame",
            blob,
            "road-frame.jpg"
        );

        const response = await fetch("/detect", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {

            console.error(
                "Detection request failed:",
                response.status
            );

            return;
        }

        const data = await response.json();

        // Don't draw anything if monitoring was switched OFF
        if (!roadMonitoring) {
            return;
        }

        drawBoxes(video, data);

        const result = document.getElementById("ai-result");

        if (result) {

            if (data.length > 0) {

                result.innerText =
                    "Detected: " +
                    data
                        .map(d => d.class)
                        .join(", ");

            } else {

                result.innerText =
                    "No road hazards detected.";

            }

        }

    } catch (error) {

        // Ignore errors caused by switching OFF
        if (roadMonitoring) {

            console.error(
                "Road detection error:",
                error
            );

        }

    }

}


// ==========================================
// DRAW YOLO BOXES
// ==========================================

function drawBoxes(video, detections) {

    if (!roadMonitoring) {
        return;
    }

    const overlay =
        document.getElementById("overlay");

    if (!overlay) {
        return;
    }

    const rect =
        video.getBoundingClientRect();

    overlay.width = rect.width;
    overlay.height = rect.height;

    const ctx =
        overlay.getContext("2d");

    ctx.clearRect(
        0,
        0,
        overlay.width,
        overlay.height
    );

    const scaleX =
        rect.width / video.videoWidth;

    const scaleY =
        rect.height / video.videoHeight;

    detections.forEach(det => {

        const [
            x1,
            y1,
            x2,
            y2
        ] = det.box;

        const sx = x1 * scaleX;
        const sy = y1 * scaleY;

        const sw =
            (x2 - x1) * scaleX;

        const sh =
            (y2 - y1) * scaleY;

        let color = "#facc15";

        const labelName =
            det.class.toLowerCase();

        if (
            labelName.includes("pothole")
        ) {
            color = "#facc15";
        }

        if (
            labelName.includes("alligator")
        ) {
            color = "#3b82f6";
        }

        if (
            labelName.includes("longitudinal")
        ) {
            color = "#22c55e";
        }

        if (
            labelName.includes("lateral")
        ) {
            color = "#a855f7";
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        ctx.strokeRect(
            sx,
            sy,
            sw,
            sh
        );

        const label =
            `${det.class} ${(det.confidence * 100).toFixed(1)}%`;

        ctx.font = "14px Arial";

        const textWidth =
            ctx.measureText(label).width;

        ctx.fillStyle = color;

        ctx.fillRect(
            sx,
            Math.max(0, sy - 22),
            textWidth + 10,
            22
        );

        ctx.fillStyle = "black";

        ctx.fillText(
            label,
            sx + 5,
            Math.max(15, sy - 6)
        );

    });

}


// ==========================================
// DEFAULT STATE = OFF
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        roadVideo =
            document.getElementById("roadCamera");

        updateRoadToggle(false);

        console.log(
            "Road monitoring initialized OFF."
        );

    }
);