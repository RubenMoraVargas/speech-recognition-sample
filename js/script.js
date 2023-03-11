const startRecordButton = document.querySelector("#start-record");
const closeRecordButton = document.querySelector("#stop-record");
const finalResultArea = document.querySelector("#final");
const interimResultArea = document.querySelector("#interim");
const downloadButton = document.querySelector(".download");
const languageSelect = document.querySelector("#language");
const clearButton = document.querySelector(".clear");

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let finalTranscript = "";
let recognition;

const errorTypes = {
  "no-speech": "No speech was detected. Stopping...",
  "audio-capture": "No microphone was found. Ensure that a microphone is installed.",
  "not-allowed": "Permission to use microphone is blocked.",
  aborted: "Listening Stopped.",
};

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    languageSelect.appendChild(option);
  });
}

function handleRecognitionResult(event) {
  let interimTranscript = "";

  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
      continue;
    }
    interimTranscript += event.results[i][0].transcript;
  }
  document.querySelector("#final").innerHTML = finalTranscript;
  document.querySelector("#interim").innerHTML = interimTranscript;

  downloadButton.disabled = false;
}

function handleRecognitionErrors(event) {
  stopRecord();
  return errorTypes[event.error] || "Error occurred in recognition: " + event.error;
}

function initRecognitionObject() {
  recognition = new speechRecognition();
  recognition.lang = languageSelect.value;
  recognition.continuous = true;
  recognition.interimResults = true;
}

function startRecord() {
  if (!recognition) return;
  try {
    recognition.start();

    startRecordButton.classList.add("d-none");
    closeRecordButton.classList.remove("d-none");

    recognition.onresult = (event) => {
      handleRecognitionResult(event);
    };

    recognition.onerror = (event) => {
      handleRecognitionErrors(event);
    };
  } catch (error) {
    stopRecord();
    console.log(error);
  }
}

function stopRecord() {
  if (recognition) recognition.stop();

  startRecordButton.classList.remove("d-none");
  closeRecordButton.classList.add("d-none");
}

function makeDownload() {
  const text = finalTranscript;
  const filename = "speech.txt";

  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function clearResult() {
  finalResultArea.innerHTML = "";
  interimResultArea.innerHTML = "";
  
  finalTranscript = "";
  downloadButton.disabled = true;
}

function main() {
  if (!speechRecognition) {
    console.log("Speech Recognition Not Available");
    return;
  }

  initRecognitionObject();

  populateLanguages();

  closeRecordButton.addEventListener("click", stopRecord);
  startRecordButton.addEventListener("click", startRecord);
  downloadButton.addEventListener("click", makeDownload);
  clearButton.addEventListener("click", clearResult);
}

main();
