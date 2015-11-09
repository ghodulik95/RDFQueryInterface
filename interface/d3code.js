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

updateSVG();

//Get the text field
var labelTextField = document.getElementById("label");

//Create SVG given data
function updateSVG() {   
	//Create node circles
	circles = svg.selectAll("circle")
		.data(nodes)
		.enter()
		.append("circle")
		.on("click", onclick)
		.attr("class", "circle")
		.attr("transform", function(d) {
			return "translate(" + (d.x*w) + "," + (d.y*h) + ")";
		})
		.attr("r", circleRadius);
	
	//Create text labels for circles
	labels = svg.selectAll("text")
		.data(nodes)
		.enter()
		.append("text")
		.on("click", onclick)
		.attr("class", "label")
		.text(function(d) {
			return d.text;
		})
		.attr("transform", function(d) {
			return "translate(" + (d.x*w-7) + "," + (d.y*h+2) + ")";
		});
		
	//Create edges
	//Create connection edges
	//Create edge label nodes
}

//Handle mouse click
//Note: if we click on a circle, then the function is called twice (from the circle & background)
//Not sure how to check if there is an object at the coordinates
function onclick(d) {
	console.log(mode);
	var coords = d3.mouse(this);
	var x = coords[0];
	var y = coords[1];
	if (d != undefined) {
		//Clicked on an existing object
		console.log("this is an object");
	}
	else {
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

//Change mode
function changeMode(r) {
	mode = r.value;
}