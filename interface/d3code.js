var w = 500;
var h = 500;
var circleRadius = 20;

//Data
//Types: 0-node, 1-edge, 2-conn.edge
var nodes = [];
var edges = [];
var conn_edges = [];
var maxNodeID = -1;
var maxEdgeID = -1;
var maxConnEdgeID = -1;
var nodeTemplate = {
	id: -1,
	text: "",
	x: 0,
	y: 0,
	type: 0
}
var edgeTemplate = {
	id: -1,
	text: "",
	source: -1,
	target: -1,
	type: 1
}

//Set default mode
var mode;
var defaultModeButton = document.getElementById("defaultModeButton");
defaultModeButton.checked = true;
mode = defaultModeButton.value;
	
//Create svg
var svg = d3.select(".content")
            .append("svg")
            .attr("width", w)   
            .attr("height", h)
            .on("click", onclick);
var circles;
var labels;
var edges;
var conn_edges;
var edge_labels;

var selected = -1;

updateSVG();

//Get the text field
var labelTextField = document.getElementById("label");

//Update the SVG given data
function updateSVG() {   	
	//Create node circles
	circles = svg.selectAll("circle")
		.data(nodes);
		
	circles.enter()
		.append("circle")
		.on("click", onclick)
		.attr("class", "circle")
		.attr("transform", function(d) {
			return "translate(" + (d.x*w) + "," + (d.y*h) + ")";
		})
		.attr("r", circleRadius);
		
	circles.exit().remove();
	
	//Create text labels for circles
	labels = svg.selectAll("text")
		.data(nodes);
		
	labels.enter()
		.append("text")
		.on("click", onclick)
		.attr("class", "label")
		.text(function(d) {
			return d.text;
		})
		.attr("transform", function(d) {
			return "translate(" + (d.x*w-7) + "," + (d.y*h+2) + ")";
		});
		
	labels.exit().remove();
	//Create edges
	//Create connection edges
	//Create edge label nodes
}

//Handle mouse click
//Note: if we click on a circle, then the function is called twice (from the circle & background)
//Not sure how to check if there is an object at the coordinates
function onclick(d, i) {
	var coords = d3.mouse(this);
	var x = coords[0];
	var y = coords[1];
	if (d != undefined) {
		//Clicked on an existing object
		if (d.type == 0) {
			//Select the circle
			//console.log("selecting the circle");
			select(i);
		}
	}
	else {
		//console.log("this is not an object");
		switch(mode) {
			case "node":
				maxNodeID += 1;
				nodes.push({
					id: maxNodeID,
					text: "test" + maxNodeID,
					x:x/w,
					y:y/h,
					type:0
				});
				updateSVG();
				break;
			case "edge":
				console.log("should create a new edge");
				break;
			case "conn_edge":
				console.log("should create a new connection edge");
				break;
			case "select":
			default:
				break;
		}
	}	
}

//Select circle i if not selected, deselect otherwise
function select(i) {
	var circle = d3.select(circles[0][i]);
	if (selected != i) {
		//deselect the previously selected circle
		if (selected != -1)
			select(selected);
		//select
		circle.attr("class", "circle_selected");
		selected = i;
	}
	else {
		//deselect
		circle.attr("class", "circle");
		selected = -1;
	}
}

//Change mode
function changeMode(r) {
	mode = r.value;
}