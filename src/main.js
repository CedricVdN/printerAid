
// src/main.js
import './style.css';

// Importing Firebase and PubNub
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
 
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDq1MeOTqw83EhUlywQaG1zxQxDtu3E9Ss",
  authDomain: "printeraid-f8d6f.firebaseapp.com",
  databaseURL: "https://printeraid-f8d6f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "printeraid-f8d6f",
  storageBucket: "printeraid-f8d6f.firebasestorage.app",
  messagingSenderId: "283710313186",
  appId: "1:283710313186:web:34afec79e1c67eb8a404bb",
  measurementId: "G-EDFM0BJC3W"
};
 
// Initialising Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
console.log(db)
var startTimes, durations, endTimes;

window.onload = async function() {
  try {
    // get the document uit of "printer" collection, specific "printer1"
    const docRef = doc(db, "printer", "printer1");
    const docSnap = await getDoc(docRef);

    // Check if the document exists
    if (docSnap.exists()) {
      // get the data and assign them tp the variables
      startTimes = docSnap.data().start;
      durations = docSnap.data().duration;
      endTimes = docSnap.data().end;
      for (let i = 0; i < startTimes.length; i++) {
        tableAdd (startTimes[i],durations[i],endTimes[i])
      }
      console.log("Gegevens opgehaald en aan table toegevoeg:", {startTimes, durations, endTimes});
    } else {
      console.log("Geen document gevonden!");
    }
  } catch (error) {
    console.error("Fout bij het ophalen van gegevens:", error);
  }
}
 // Replace 'ESP32_IP' with the actual IP address of your ESP32
 const ws = new WebSocket('ws://10.16.1.50:81');

let lastTimestamp = Date.now();
let lastState = false;

ws.onopen = function() {
     console.log('Connected to WebSocket server');
 };

 ws.onmessage = function(event) {
     const currentState = !!parseInt(event.data); // Convert to boolean
     const currentTimestamp = Date.now();
     const currentEndDate = new Date(currentTimestamp);
     const endformattedDate = currentEndDate.toLocaleString();
     const currentStartDate = new Date(lastTimestamp)
     const startformattedDate = currentStartDate.toLocaleString();
     // Display the current sensor state
     document.getElementById('sensorValue').innerText = `Printer status: ${currentState ? 'Active' : 'Inactive'}`;

     // Only calculate time if the state changed from 1 to 0
     if (lastState === true && currentState === false) {
         const timeElapsed = Math.floor((currentTimestamp - lastTimestamp)); // Time in seconds
            updateArray (startTimes, startformattedDate)
            updateArray (durations, timeElapsed)
            updateArray (endTimes, endformattedDate)
            console.log("Gegevens upgedate:", {startTimes, durations, endTimes});
            uploadToDatabase ()
            tableAdd (startformattedDate,timeElapsed,endformattedDate)
     }

     // Update the last state and timestamp
     lastState = currentState;
     lastTimestamp = currentTimestamp;
 };

 ws.onclose = function() {
     console.log('Disconnected from WebSocket server');
     document.getElementById('sensorValue').innerText = 'Disconnected';
     document.getElementById('timeElapsed').innerText = '';
 };

 ws.onerror = function(error) {
     console.error('WebSocket error:', error);
 };

 function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        let result = [];

        if (hours > 0) {
          result.push(`${hours} hours`);
        }
        if (minutes > 0) {
          result.push(`${minutes} minutes`);
        }
        if (seconds > 0) {
          result.push(`${seconds} seconds`);
        }
      
        return result.join(', ');
 }

 function tableAdd (start,info,end) {
    const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    cell1.textContent = start;
    cell2.textContent = msToTime(info);
    cell3.textContent = end;
 }

 function updateArray (array, newData) {
    array.splice(0, 1); // Removes the first element
    array.push(newData); // Adds a new element at the end
 }

 async function uploadToDatabase () {
  try {
    // Voeg gegevens toe aan Firestore
    await setDoc(doc(db, "printer", "printer1"), {
      start: startTimes,
      duration: durations,
      end: endTimes
    });
  }
  catch (error){
    console.error("fout, niet verzonden", error)
  }
 }