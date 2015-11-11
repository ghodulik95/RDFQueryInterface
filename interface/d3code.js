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

//Create drag behavior
var drag = d3.behavior.drag()
	.on("drag", onDrag)
	
//Create svg
var svg = d3.select("#contentSVG")
            .attr("width", w)   
            .attr("height", h)
            .on("click", onClick);
var layer1 = svg.append('g');
var layer2 = svg.append('g');
var nodeCircles;
var nodeLabels;
var edgeLines;
var connEdgeLines;
var edgeCircles;
var edgeLabels;

var selectedNode = -1;

updateSVG();

//Get the text field
var labelTextField = document.getElementById("label");

//Update the SVG given data
function updateSVG() {   
	//Deselect
	selectNode(selectedNode);
	//Create node nodeCircles
	nodeCircles = layer2.selectAll(".node")
		.data(nodes);
		
	nodeCircles.enter()
		.append("circle")
		.on("click", onClick)
		.call(drag)
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + (d.x*w) + "," + (d.y*h) + ")";
		})
		.attr("r", circleRadius);
		
	nodeCircles.exit().remove();
	
	//Create text labels for circles
	nodeLabels = layer2.selectAll(".node_label")
		.data(nodes);
		
	nodeLabels.enter()
		.append("text")
		.on("click", onClick)
		.call(drag)
		.attr("class", "node_label")
		.text(function(d) {
			return d.text;
		})
		.attr("transform", function(d) {
			return "translate(" + (d.x*w-14) + "," + (d.y*h+3) + ")";
		});
		
	nodeLabels.exit().remove();
		
	//Create edges (note: they are placed below circles)
	edgeLines = layer1.selectAll(".edge")
		.data(edges);
    
	edgeLines.enter()
		.append("line")
		.attr("class", "edge")
		.attr("marker-end", "url(#markerArrow)")
		.attr("data-edgeID", function(d) {return d.id})
		.attr("x1", function(d) {return w*getNode(d.source).x})
		.attr("y1", function(d) {return h*getNode(d.source).y})
		.attr("x2", function(d) {return w*getNode(d.target).x})
		.attr("y2", function(d) {return h*getNode(d.target).y});
		
	edgeLines.exit().remove();	
	
	//Create connection edges (note: they are placed below circles)
	connEdgeLines = layer1.selectAll(".conn_edge")
		.data(connEdges);
    
	connEdgeLines.enter()
		.append("line")
		.attr("class", "conn_edge")
		.attr("marker-end", "url(#markerArrow)")
		.attr("data-connEdgeID", function(d) {return d.id})
		.attr("x1", function(d) {return w*getNode(d.source).x})
		.attr("y1", function(d) {return h*getNode(d.source).y})
		.attr("x2", function(d) {return w*getNode(d.target).x})
		.attr("y2", function(d) {return h*getNode(d.target).y});
		
	connEdgeLines.exit().remove();	
	//Create edge label nodes
	//Create edge labels
}

//Handle mouse click
//Note: if we click on a circle, then the function is called twice (from the circle & background)
//Not sure how to check if there is an object at the coordinates
function onClick(d, i) {
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
			if (d != undefined && d.type == 0) {
				//Clicked on the existing node
				if (selectedNode == -1 || selectedNode == i) {
					//Select/deselect
					selectNode(i);
				}
				else {
					//Create a new connection edge
					//Note: double sided connection edges are not currently allowed
					if (!edgeExists(selectedNode, i) && !edgeExists(i, selectedNode)) {
						maxConnEdgeID += 1;
						connEdges.push({
							id: maxConnEdgeID,
							text: "connEdge" + maxEdgeID,
							source: selectedNode,
							target: i,
							type: 2
						});
						updateSVG();
					}
					selectNode(selectedNode);
				}
			}
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

//Define drag behavior
function onDrag(d,i) {
	if (mode == "select") {
		var x = d3.event.x;
		var y = d3.event.y;
		var node = nodes[i];
		
		//Don't move past the svg boundary			
		if ((x+circleRadius)>w)
			x = w-circleRadius-1;
		if ((x-circleRadius)<0)
			x = circleRadius+1;
		if ((y+circleRadius)>h)
			y = w-circleRadius-1;
		if ((y-circleRadius)<0)
			y = circleRadius+1;
			
		//Todo: prevent moving a node on top of another node
		
		//Move the node
		node.x = x/w;
		node.y = y/h;
		d3.select(nodeCircles[0][i]).attr("transform", "translate(" + x + "," + y + ")");
		d3.select(nodeLabels[0][i]).attr("transform", "translate(" + (x-14) + "," + (y+3) + ")");
		
		//Move all related edges
		for (var i=0; i<edges.length; i++) {
			var currentEdge = edges[i];
			if (currentEdge.source == node.id) {
				var dataEdgeID = "[data-edgeID=\"" + currentEdge.id + "\"]"
				var line = d3.select(dataEdgeID);
				line.attr("x1", x);
				line.attr("y1", y);
			}
			else if (currentEdge.target == node.id) {
				var dataEdgeID = "[data-edgeID=\"" + currentEdge.id + "\"]"
				var line = d3.select(dataEdgeID);
				line.attr("x2", x);
				line.attr("y2", y);
			}
		}
		
		//Move all related connection edges
		for (var i=0; i<connEdges.length; i++) {
			var currentEdge = connEdges[i];
			if (currentEdge.source == node.id) {
				var dataEdgeID = "[data-connEdgeID=\"" + currentEdge.id + "\"]"
				var line = d3.select(dataEdgeID);
				line.attr("x1", x);
				line.attr("y1", y);
			}
			else if (currentEdge.target == node.id) {
				var dataEdgeID = "[data-connEdgeID=\"" + currentEdge.id + "\"]"
				var line = d3.select(dataEdgeID);
				line.attr("x2", x);
				line.attr("y2", y);
			}
		}
	}
}

//Select circle i if not selected, deselect otherwise
function selectNode(i) {
	if (i == -1) 
		return;
	var circle = d3.select(nodeCircles[0][i]);
	if (selectedNode != i) {
		//deselect the previously selected circle
		if (selectedNode != -1)
			selectNode(selectedNode);
		//select
		circle.attr("class", "node_selected");
		selectedNode = i;
	}
	else {
		//deselect
		circle.attr("class", "node");
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