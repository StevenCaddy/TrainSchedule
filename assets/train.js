// Initialize Firebase
var config = {
	apiKey: "AIzaSyCYIeGiFqvB8zUSd_nqm5pA2glWVSMf0FQ",
    authDomain: "trainschedu-7850e.firebaseapp.com",
    databaseURL: "https://trainschedu-7850e.firebaseio.com",
    projectId: "trainschedu-7850e",
    storageBucket: "trainschedu-7850e.appspot.com",
    messagingSenderId: "1028238721709"
};
firebase.initializeApp(config);


var database = firebase.database();

//Initial Values
var trainName = "";
var destination = "";
var firstTrainTime = "";
var frequency = 0;
var currentTime = moment();
var index = 0;
var trainIDs = [];

// Show current time
var dateTime = null,
date = null;

var update = function() {
	date = moment(new Date())
	dateTime.html(date.format('dddd, MMMMM Do YYYYY, h:mm:ss a'));
};

$(document).ready(function(){
	dateTime = $('#current-status')
	update();
	setInterval(update, 1000);
});

// Button on click
$("#add-train").on("click", function() {

	// Get values
	trainName = $("#train-name").val().trim();
	destination = $("#destination").val().trim();
	firstTrainTime = $("#train-time").val().trim();
	frequency = $("#frequency").val().trim();

	// First Time
	var firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");

	// Difference between times
	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

	// Time apart 
	var tRemainder = diffTime % frequency;

	// Minutes Until Train
	var minutesAway = frequency - tRemainder;

	// Next Train
	var nextTrain = moment().add(minutesAway, "minutes");

	// Arrival time
	var nextArrival = moment(nextTrain).format("hh:mm a");

	var nextArrivalUpdate = function() {
		date = moment(new Date())
		dateTime.html(date.format("hh:mm a"));
	}

	// Push the code
	database.ref().push({
		trainName: trainName,
		destination: destination,
		firstTrainTime: firstTrainTime,
		frequency: frequency,
		minutesAway: minutesAway,
		nextArrival: nextArrival,
		dateAdded: firebase.database.ServerValue.TIMESTAMP
	});

	alert("Form submitted");

	// Empty text input
	$("#train-name").val("");
	$("#destination").val("");
	$("#train-time").val("");
	$("#frequency").val("");

	return false;
});

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("child_added")
// This will only show the 25 latest entries
  database.ref().orderByChild("dateAdded").limitToLast(25).on("child_added", function(snapshot) {


    console.log("Train name: " + snapshot.val().trainName);
    console.log("Destination: " + snapshot.val().destination);
    console.log("First train: " + snapshot.val().firstTrainTime);
    console.log("Frequency: " + snapshot.val().frequency);
    console.log("Next train: " + snapshot.val().nextArrival);
    console.log("Minutes away: " + snapshot.val().minutesAway);
    console.log("==============================");


  // Change the HTML to reflect
  $("#new-train").append("<tr><td>" + snapshot.val().trainName + "</td>" +
    "<td>" + snapshot.val().destination + "</td>" + 
    "<td>" + "Every " + snapshot.val().frequency + " mins" + "</td>" + 
    "<td>" + snapshot.val().nextArrival + "</td>" +
    "<td>" + snapshot.val().minutesAway + " mins until arrival" + "</td>" +
   // "<td><button class='delete btn btn-default btn-sm' data-index='" + index + "'><span class='glyphicon glyphicon-trash'></span></button> " + 
   // "<button type='button' class='btn btn-default btn-sm'><span class='glyphicon glyphicon-edit'></span></button>" +
    "</td></tr>");

  index++;

  // Handle the errors
  }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });

  //Gets the train IDs in an Array
  database.ref().once('value', function(dataSnapshot){ 
    var trainIndex = 0;

      dataSnapshot.forEach(
          function(childSnapshot) {
              trainIDs[trainIndex++] = childSnapshot.key();
          }
      );
  });

  console.log(trainIDs);
