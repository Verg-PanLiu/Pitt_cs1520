// Pan Liu Pal81
// Project3
// Due date: 11/09/2020

var timeoutID1; //first timeout id
var timeoutID2; // second timeout id
var timeout1 = 1000; //timeout for poller 
var timeout2 = 5000; //timeout for check room-delete

function setup() {
	document.getElementById("theButton").addEventListener("click", makePost, true);
    poller();
	timeoutID1 = window.setTimeout(poller, timeout1);
	timeoutID2 = window.setTimeout(pollerID, timeout2);
}

function makePost() {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
	var dateObj = new Date().toLocaleString();  //get time of sending message
	var user = document.getElementById("user").innerHTML  //get user name
	var message = document.getElementById("msg").value    // get message
	var msg = "(" + dateObj + ")" + user + ": " + message   // combine those information
    var number = document.getElementById("room_id").innerHTML   // get room number
	httpRequest.onreadystatechange = function() { handlePost(httpRequest, msg) };

	httpRequest.open("POST", "/new_message");
	httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	var data;
	data = "msg=" + msg + "&id=" + number;
	httpRequest.send(data);    // send data
}

function handlePost(httpRequest, msg) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			addMsg(msg);       //add row
			clearInput();      // clear input
		} else {
			alert("There was a problem with the post request.");
		}
	}
}

// function to check deleted room
function pollerID(){
	var httpID = new XMLHttpRequest();

	if (!httpID) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
    var number = document.getElementById("room_id").innerHTML
    var username = document.getElementById("user").innerHTML
	httpID.onreadystatechange = function() {
		if (httpID.readyState === XMLHttpRequest.DONE) {
			if (httpID.status === 200) {
				var del_room = JSON.parse(httpID.responseText);
			    if (Number(del_room) === Number(number))
				{
					alert("This room has been deleted by owner.");   // alert user if the room was deleted
					window.location.href = ('/chat/'+username);      // back to previous level
				}
			    timeoutID2 = window.setTimeout(pollerID, timeout2);
		   }
	    }
	};
	httpID.open("GET", "/del_room");
	httpID.send();
}


function poller() {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}
    var number = document.getElementById("room_id").innerHTML

	httpRequest.onreadystatechange = function() { handlePoll(httpRequest,number) };
	httpRequest.open("GET", "/msgs");
	httpRequest.send();
}

function handlePoll(httpRequest, number) {
	if (httpRequest.readyState === XMLHttpRequest.DONE) {
		if (httpRequest.status === 200) {
			var tab = document.getElementById("theTable");
			while (tab.rows.length > 0) {
				tab.deleteRow(0);
			}

			var msgs = JSON.parse(httpRequest.responseText);   // get all the messages
			var new_msg = msgs[Number(number)-1]               // get the current room message
			for (var i in new_msg){
				addMsg(new_msg[i]);                            // add the message to the chat window
			}

			timeoutID1 = window.setTimeout(poller, timeout1);

		} else {
			alert("There was a problem with the poll request.  you'll need to refresh the page to recieve updates again!");
		}
	}
}

function addMsg(message) {
	var tableRef = document.getElementById("theTable");
	var newRow   = tableRef.insertRow();

	var newText;
	newText = document.createTextNode(message);
	newRow.appendChild(newText);
}

function clearInput() {
	document.getElementById("msg").value = "";
}

window.addEventListener("load", setup, true);