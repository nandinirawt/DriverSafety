function speakWarning() {
  const msg = new SpeechSynthesisUtterance("Are you awake?");
  speechSynthesis.speak(msg);
}

function playAlarm() {
  const alarm = new Audio("assets/alarm.mp3");
  alarm.play();
}
