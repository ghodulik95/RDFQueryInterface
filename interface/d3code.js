var w = 1080;
var h = 720;
var circleRadius = 24;

//Data
//Types: 0-node, 1-edge, 2-conn.edge
var nodes = [];
var edges = [];
var edgeLabels;
var connEdges = [];
var maxNodeID = -1;
var maxEdgeID = -1;
var maxConnEdgeID = -1;
var selectedType = -1; // -1 none, 0- node, 1- edge
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
	type: 1,
	x: 50,
	y: 50
}

var selectedNode = -1;

//Get elements of the edit window
var editFieldset = document.getElementById("editFieldset");

//Get the label input text field
var labelTextField = document.getElementById("labelInput");
labelTextField.value = "";

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
var layer3 = svg.append('g');
var nodeCircles;
var nodeLabels;
var edgeLines;
var connEdgeLines;
var edgeCircles;
//var edgeLabels;

updateSVG();

//Update the SVG given data
function updateSVG() {
	//Deselect
	if (selectedType == 0)
		selectNode(selectedNode);
	else
		selectEdge(selectedNode);

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

	updateEdgeLocation();
	
	//Create edge circles
	layer3.selectAll(".edge_circle").remove();
	edgeCircles = layer3.selectAll(".edge_circle")
		.data(edges);
	
	edgeCircles.enter()
		.append("circle")
		.call(drag)
		.on("click", onClick)
		.attr("edgeID", function(d) {return d.id})
		.attr("class", "edge_circle")
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"
		})
		.attr("r", circleRadius*0.75);
		
	edgeCircles.exit().remove();
	
	//Create edge label
	layer3.selectAll(".edge_label").remove();
	edgeLabels = layer3.selectAll(".edge_label")
		.data(edges);
    
	edgeLabels.enter()
		.append("text")
		.call(drag)
		.on("click",onclick)
		.attr("class", "edge_label")
		.text(function(d) {return d.text})
		.attr("edgeID", function(d) {return d.id})
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"
			});
			
	edgeLabels.exit().remove();
			
	
}

//Handle mouse click
//Note: if we click on a circle, then the function is called twice (from the circle & background)
//Not sure how to check if there is an object at the coordinates
function onClick(d, i) {
	console.log(i);
	if (d3.event.defaultPrevented) 
		return;
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
					var sourceID = nodes[selectedNode].id;
					var targetID = nodes[i].id;
					if (!edgeExists(sourceID, targetID) && !edgeExists(targetID, sourceID)) {
						maxEdgeID += 1;
						edges.push({
							id: maxEdgeID,
							text: "edge" + maxEdgeID,
							source: sourceID,
							target: targetID,
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
					var sourceID = nodes[selectedNode].id;
					var targetID = nodes[i].id;
					if (!edgeExists(sourceID, targetID) && !edgeExists(targetID, sourceID)) {
						maxConnEdgeID += 1;
						connEdges.push({
							id: maxConnEdgeID,
							text: "connEdge" + maxEdgeID,
							source: sourceID,
							target: targetID,
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
					selectNode(d.id);
					console.log("Node clicked");
				}
				if (d.type == 1) {
					//Select/deselect the edge
					selectEdge(d.id);
					console.log("Edge clicked");
				}
				console.log(d);
			}
			break;
	}
}

//Define drag behavior
function onDrag(d,i) {
	if ((mode == "select") && (selectedType == 0) && (d.type != 1)){
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
			updateEdgeLocation();
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
		updateSVG();
	}
}

//Select circle i if not selected, deselect otherwise
function selectNode(i) {
	//deselect edges
	if (selectedType == 1){
		var circle = d3.select(edgeCircles[0][selectedNode]);
		if (i != -1)
			circle.attr("class", "edge_circle");
		labelTextField.value = "";
		selectedNode = -1;
	}
	selectedType = 0;

	if (i == -1) 
		return;
	var circle = d3.select(nodeCircles[0][i]);
	if (selectedNode != i){
		//deselect the previously selected circle
		if (selectedNode != -1)
			selectNode(selectedNode);
		//select
		circle.attr("class", "node_selected");
		selectedNode = i;
		if (mode=="select") {
			labelTextField.value = nodes[i].text;
		}
	}
	else {
		//deselect
		circle.attr("class", "node");
		selectedNode = -1;
		if (mode=="select") {
			labelTextField.value = "";
		}
	}
}

//Select edge label i if not selected, deselect otherwise
function selectEdge(i) {
	//deselect nodes
	if (selectedType == 0) {
		var circle = d3.select(nodeCircles[0][selectedNode]);
		if (i != -1)
			circle.attr("class", "node");
		labelTextField.value = "";
		selectedNode = -1;
	}
	selectedType = 1;

	if (i == -1)
		return;
	var circle = d3.select(edgeCircles[0][i]);
	var edge = getEdge(i);
	if (selectedNode != i){
		//deselect the previously selected circle
		if (selectedNode != -1)
			selectEdge(selectedNode);
		circle.attr("class", "edge_circle_selected");
		//select
		selectedNode = i;
		if (mode=="select") {
			labelTextField.value = edge.text;
		}
	}
	else {
		//deselect
		circle.attr("class", "edge_circle");
		selectedNode = -1;
		if (mode=="select") {
			labelTextField.value = "";
		}
	}
}

//Save button clicked
function clickedSave() {
	if (mode != "select" || selectedNode == -1)
		return;
	var newText = labelTextField.value;
	if (selectedType == 0){
		nodes[selectedNode].text = newText;
		d3.select(nodeLabels[0][selectedNode]).text(newText);
	}else if (selectedType == 1){
		edges[selectedNode].text = newText;
	}
	updateSVG();
	//selectNode(selectedNode);
}

//Delete button clicked
function clickedDelete() {
	if (selectedType == 0) {

		if (mode != "select" || selectedNode == -1)
			return;
		var node = nodes[selectedNode];
		var r = confirm("Are you sure you want to delete node " + node.text + " and all associated edges?");
		if (r == false)
			return;
		//Delete all associated edges
		for (var i = 0; i < edges.length; i++) {
			var currentEdge = edges[i];
			if (currentEdge.source == node.id || currentEdge.target == node.id) {
				edges.splice(i, 1);
				i--;
			}
		}
		//Delete all associated connection edges
		for (var i = 0; i < connEdges.length; i++) {
			var currentEdge = connEdges[i];
			if (currentEdge.source == node.id || currentEdge.target == node.id) {
				connEdges.splice(i, 1);
				i--;
			}
		}
		//Delete the node
		nodes.splice(selectedNode, 1);
		selectNode(selectedNode);
		//Redraw SVG completely
		nodeLabels.remove();
		nodeCircles.remove();
		edgeLines.remove();
		connEdgeLines.remove();
		edgeCircles.remove();
		edgeLabels.remove();
		updateSVG();
	}
	if (selectedType == 1) {

		if (mode != "select" || selectedNode == -1)
			return;
		var edge = edges[selectedNode];
		var r = confirm("Are you sure you want to delete edge " + edge.text + "?");
		if (r == false)
			return;
		//Delete the node
		edges.splice(selectedNode, 1);
		selectEdge(selectedNode);
		//Redraw SVG completely
		edgeLines.remove();
		edgeCircles.remove();
		edgeLabels.remove();
		updateSVG();
	}

}

//Change mode
function changeMode(r) {
	if (selectedType == 0)
		selectNode(selectedNode);
	if (selectedType == 1)
		selectEdge(selectedNode);
	if (r.value == "select") {
		editFieldset.disabled = false;
		d3.selectAll(".edit_label_disabled").attr("class", "edit_label_enabled");
		
	}
	else {
		editFieldset.disabled = true;
		d3.selectAll(".edit_label_enabled").attr("class", "edit_label_disabled");
		labelTextField.value = "";
	}
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

function getEdge(edgeID){
	for (var i=0; i<edges.length; i++) {
		var edge = edges[i];
		if (edge.id == edgeID)
			return edge;
	}
	return false;
}

function updateEdgeLocation(){
	for (var i=0; i<edges.length; i++) {
		var d = edges[i];
		d.x = (w*getNode(d.source).x / 2 + w*getNode(d.target).x / 2);
		d.y = (h*getNode(d.source).y / 2 + h*getNode(d.target).y / 2);
	}
}

//Process results given object:
// Array of results where
//		each result = Array of nodes which have an id and value
function processResults(results){
	//Processing of results will go here
	//Ie displaying results, potentially other things
	//return getNodeLabel(results, 0, 0);
	for (var i = 0; i < results.length; i++){
		console.log(results[i]);
		nodes[i].id = results.id;
		nodes[i].text = results.value;
		nodes[i].x = i * 50;
		nodes[i].y = i * 80;
		nodes[i].type = 0;
	}
}

//Will get the value of the given node id in the resultNum-th result
function getNodeLabel(results, resultNum, nodeId){
	var result = results[resultNum];
	return result["value"+nodeId];
}


