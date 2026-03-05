import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

let drivingMode = false;

// Start driving mode
app.post("/driving/start", (req, res) => {
    drivingMode = true;
    console.log("Driving mode activated");
    res.send("Driving mode ON");
});

// Stop driving mode
app.post("/driving/stop", (req, res) => {
    drivingMode = false;
    console.log("Driving mode stopped");
    res.send("Driving mode OFF");
});

// Incoming call detection
app.post("/incoming-call", (req, res) => {

    const callerNumber = req.body.number;

    console.log("Incoming call from:", callerNumber);

    if(drivingMode){
        sendAutoReply(callerNumber);
    }

    res.send("Call processed");

});

function sendAutoReply(number){

    console.log("Auto reply sent to:", number);
    console.log("Message: I am driving right now, I will get back to you later.");

}

app.listen(3000, () => {
    console.log("Aura Drive backend running on http://localhost:3000");
});