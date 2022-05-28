// CS1520 Final Project
// Pan Liu (pal81)

var timeoutID;
var timeout = 45000;
var num_cat;
var num_pur;
var category_list = [];
var categories;
var purchases;

// get the number of categories and purchases
makeRec("GET", "/cats", 200, getCatNum);
makeRec("GET", "/purchase", 200, getPurNum);
setTimeout(function(){document.getElementById('num_cat').innerHTML = num_cat;}, 200);
setTimeout(function(){document.getElementById('num_pur').innerHTML = num_pur;}, 200);

//set up the page when page is loading
function setup() {
	console.log("page setup");
	document.getElementById("theButton").addEventListener("click", sendCat, true);
    document.getElementById("theButtonP").addEventListener("click", sendPurchase, true);
    var today = new Date();
    document.getElementById("curr_month").innerHTML = String(today.getMonth() + 1);
	// initialize theTable
	poller();
}

/***********************************************************
 * AJAX boilerplate
 ***********************************************************/

function makeRec(method, target, retCode, handlerAction, data) {
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
	}

	httpRequest.onreadystatechange = makeHandler(httpRequest, retCode, handlerAction);
	httpRequest.open(method, target);

	if (data) {
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		httpRequest.send(data);
	}
	else {
		httpRequest.send();
	}
}


function makeHandler(httpRequest, retCode, action) {
	console.log("making handler!");
	function handler() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === retCode) {
				console.log("recieved response text:  " + httpRequest.responseText);
				action(httpRequest.responseText);
			} else {
				alert("There was a problem with the request.  you'll need to refresh the page!");
			}
		}
	}
	return handler;
}

// function to get the number of categories
function getCatNum(responseText) {
	console.log("get_category_number!");
	var resource = JSON.parse(responseText);
	var n = 0;
    categories = resource;
	for (r in resource ){
		category_list.push(resource[r]['category']);
		n++;
	}
	num_cat = n;
}

// function to get the number of purchases
function getPurNum(responseText) {
	console.log("get_purchase_number!");
	var resource = JSON.parse(responseText);
	// alert(Object.keys(resource).length);
	if (Object.keys(resource).length==0){
		purchases = {};
		num_pur = 0;
	}else{
		var n = 0;
		purchases = resource;
		for (r in resource ){
			n++;
		}
		num_pur = n;
	}
}
/*******************************************************
 * actual client-side app logic
 *******************************************************/

//function to display the REST resources
function poller(){
	console.log("poller");
	makeRec("GET", "/cats", 200, getCat);
	makeRec("GET", "/purchase", 200, getPur);
	setTimeout(function(){ populate(); }, 200);
	timeoutID = window.setTimeout(poller, timeout);
}

//function to get the REST resources of categories
function getCat(responseText){
	console.log("get_categories!");
	var resource = JSON.parse(responseText);
	categories = resource;
}

//function to get the REST resources of purchases
function getPur(responseText){
	console.log("get_purcahses!");
	var resource = JSON.parse(responseText);
	if (Object.keys(resource).length==0){
		purchases = {};
		num_pur = 0;
	}else{
		purchases = resource;
	}
}

//actual function to display the results
function populate(){
	console.log("populating!");
	var tab = document.getElementById("theTable");
    var spent = new Array(num_cat);

	while (tab.rows.length > 0) {
		tab.deleteRow(0);
	}
	for (c in categories) {
		var border = tab.insertRow();
		addCell(border, '*****************');
		addCell(border, '*****************');
		addCell(border, '*****************');
		addCell(border, '*****************');
		addCell(border, '*****************');
		var newRow0 = tab.insertRow();
		var newRow1 = tab.insertRow();
		var newRow2 = tab.insertRow();
		var newRow3 = tab.insertRow();
		var newRow4 = tab.insertRow();
		var newRow5 = tab.insertRow();
		addCell(newRow1, 'Category Name: ');
		addCell(newRow2, '');
		addCell(newRow2, categories[c]['category']);

		addCell(newRow3, 'Status: ');
		addCell(newRow4, '');

        spent[categories[c]['category']] = [];
		addCell(newRow5,'Purchases:')
		if (categories[c]['category'] !== 'Uncategorized'){
			newCell = newRow0.insertCell();
			newButton = document.createElement("input");
			newButton.type = "button";
			newButton.value = "Delete " + categories[c]['category'];
			(function(_c){ newButton.addEventListener("click", function() { deleteCat(_c); }); })(c);
			newCell.appendChild(newButton);
		}

		for (p in purchases){
			//purchases without belonged category belong to "uncategorized".
			if ((category_list.includes(purchases[p]['category_belong'])===false) && (categories[c]['category'] === "Uncategorized") ) {
				var newRow = tab.insertRow();

				spent[categories[c]['category']].push(parseInt(purchases[p]['spent']));

				addCell(newRow, '');
				addCell(newRow, purchases[p]['spent']);
				addCell(newRow, purchases[p]['name']);
				addCell(newRow, purchases[p]['date']);
			}else if ((category_list.includes(purchases[p]['category_belong'])===true) && (categories[c]['category'] === purchases[p]['category_belong'])){
				var newRow = tab.insertRow();
				spent[categories[c]['category']].push(parseInt(purchases[p]['spent']));
				addCell(newRow, '');
				addCell(newRow, purchases[p]['spent']);
				addCell(newRow, purchases[p]['name']);
				addCell(newRow, purchases[p]['date']);
			}
	    }
		var status;
		//no purchase items
		if (Object.keys(purchases).length == 0){
	    	status = 0;
	    	//no purchase item in this category
		}else if(spent[categories[c]['category']].length == 0){
			status = 0;
		} else{
			const reducer = (accumulator, currentValue) => accumulator + currentValue;
		    status = spent[categories[c]['category']].reduce(reducer);
		}
        //total sum of all uncategorized purchases.
		if (categories[c]['category'] === "Uncategorized")
			addCell(newRow4, status);
		else{
			remain = categories[c]['limit'] - status;
			if (remain>=0)
				addCell(newRow4, remain);
			else
				addCell(newRow4, "Overspent");
		}
	}
	var bottom = tab.insertRow();
	addCell(bottom, '*****************');
	addCell(bottom, '*****************');
	addCell(bottom, '*****************');
	addCell(bottom, '*****************');
	addCell(bottom, '*****************');
}

// function to send new category to server
function sendCat() {
	console.log("send the new category");
	window.clearTimeout(timeoutID);
	var newCategory = document.getElementById("c_name").value
	category_list.push(newCategory);
	var newLimit = document.getElementById("quantity").value
	num_cat++;
    document.getElementById('num_cat').innerHTML = num_cat;
	var data;
	data = "category=" + newCategory + "&limit=" + newLimit;
	makeRec("POST", "/cats", 201, poller, data);
	document.getElementById("c_name").value = "";
	document.getElementById("quantity").value = 0;
}

// function to send new purchase to server
function sendPurchase() {
	console.log("send the new purchase");
	window.clearTimeout(timeoutID);
	var spent = document.getElementById("p_quantity").value
	var name = document.getElementById("p_name").value
	var date = document.getElementById("spent_time").value
	var category_belong = document.getElementById("spentOn").value
	num_pur++;
    document.getElementById('num_pur').innerHTML = num_pur;
	var data;
	data = "spent=" + spent + "&name=" + name +"&date=" + date + "&category_belong=" + category_belong;
	makeRec("POST", "/purchase", 201, poller, data);
	document.getElementById("p_quantity").value = 0;
	document.getElementById("p_name").value = "";
	document.getElementById("spentOn").value = "";
}

// function to ask server to delete the existing category
function deleteCat(catID) {
	console.log("delete the existing category");
	window.clearTimeout(timeoutID);
	category_list = category_list.filter(function(e) { return e !== categories[catID]['category'] });
	//alert(category_list);
	makeRec("DELETE", "/cats/" + catID, 204, poller);
    num_cat--;
    document.getElementById('num_cat').innerHTML = num_cat;
}


// helper function for repop:
function addCell(row, text) {
	var newCell = row.insertCell();
	var newText = document.createTextNode(text);
	newCell.appendChild(newText);
}

// setup load event
window.addEventListener("load", setup, true);
