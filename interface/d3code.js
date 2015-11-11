var w = 500;
var h = 500;
var circleRadius = 20;

//Data
//Types: 0-node, 1-edge, 2-conn.edge
var nodes = [];
var edges = [];
var connEdges = [];
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
var svg = d3.select("#contentSVG")
            .attr("width", w)   
            .attr("height", h)
            .on("click", onclick);
var layer1 = svg.append('g');
var layer2 = svg.append('g');
var circles;
var labels;
var lines;
var connLines;
var edgeLabelCircles;

var selectedNode = -1;

updateSVG();

//Get the text field
var labelTextField = document.getElementById("label");

//Update the SVG given data
function updateSVG() {   
	//Create node circles
	circles = layer2.selectAll("circle")
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
	labels = layer2.selectAll("text")
		.data(nodes);
		
	labels.enter()
		.append("text")
		.on("click", onclick)
		.attr("class", "label")
		.text(function(d) {
			return d.text;
		})
		.attr("transform", function(d) {
			return "translate(" + (d.x*w-14) + "," + (d.y*h+3) + ")";
		});
		
	labels.exit().remove();
		
	//Create edges (note: they are placed below circles)
	lines = layer1.selectAll("line")
		.data(edges);
    
	lines.enter()
		.append("line")
		.attr("class", "edge")
		.attr("marker-end", "url(#markerArrow)")
		.attr("x1", function(d) {return w*getNode(d.source).x})
		.attr("y1", function(d) {return h*getNode(d.source).y})
		.attr("x2", function(d) {return w*getNode(d.target).x})
		.attr("y2", function(d) {return h*getNode(d.target).y});
		
	lines.exit().remove();	
	
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
	
	//console.log("this is not an object");
	switch(mode) {
		case "node":
			if (d == undefined) {
				//Create a new node at the click location
				maxNodeID += 1;
				nodes.push({
					id: maxNodeID,
					text: "node" + maxNodeID,
					x: x/w,
					y: y/h,
					type: 0
				});
				updateSVG();
			}
			break;
		case "edge":
			if (d != undefined && d.type == 0) {
				//Clicked on the existing node
				if (selectedNode == -1 || selectedNode == i) {
					//Select/deselect
					selectNode(i);
				}
				else {
					//Create a new edge
					//Note: double sided edges are not currently allowed
					if (!edgeExists(selectedNode, i) && !edgeExists(i, selectedNode)) {
						maxEdgeID += 1;
						edges.push({
							id: maxEdgeID,
							text: "edge" + maxEdgeID,
							source: selectedNode,
							target: i,
							type: 1
						});
						updateSVG();
					}
					selectNode(selectedNode);
				}
			}
			break;
		case "conn_edge":
			break;
		case "select":
		default:
			if (d != undefined) {
				//Clicked on an existing object
				if (d.type == 0) {
					//Select/deselect the node
					selectNode(i);
				}
			}
			break;
	}
}

//Select circle i if not selected, deselect otherwise
function selectNode(i) {
	if (i == -1) 
		return;
	var circle = d3.select(circles[0][i]);
	if (selectedNode != i) {
		//deselect the previously selectedNode circle
		if (selectedNode != -1)
			selectNode(selectedNode);
		//select
		circle.attr("class", "circle_selected");
		selectedNode = i;
	}
	else {
		//deselect
		circle.attr("class", "circle");
		selectedNode = -1;
	}
}

//Change mode
function changeMode(r) {
	selectNode(selectedNode);
	mode = r.value;
}

//Check if an edge or connection edge exists from i to j
function edgeExists(src, trg) {
	for (var i=0; i<edges.length; i++) 
		if (edges[i].source == src && edges[i].target == trg)
			return true;
	for (var i=0; i<connEdges.length; i++) 
		if (connEdges[i].source == src && connEdges[i].target == trg)
			return true;
	return false;
}

//Get the node given id
function getNode(id) {
	for (var i=0; i<nodes.length; i++) {
		var node = nodes[i];
		if (node.id == id)
			return node;
	}
	return false;
}