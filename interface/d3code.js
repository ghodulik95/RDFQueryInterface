//Fields:

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


var w = 1080;
var h = 720;
var circleRadius = 24;

//Data
//Types: 0-node, 1-edge, 2-conn.edge
var nodes = [];
var edges = [];
var connEdges = [];
var maxNodeID = -1;
var maxEdgeID = -1;
var maxConnEdgeID = -1;

function getQueryAsJSON(){
	var dataobj = {
		"nodes" : nodes,
		"edges" : edges,
		"connEdges" : connEdges,
		"maxNodeID" : maxNodeID,
		"maxEdgeID" : maxEdgeID,
		"maxConnEdgeID" : maxConnEdgeID
	}
	return JSON.stringify(dataobj);
}

function setQuery(dataobj){
	nodes = dataobj.nodes;
	edges = dataobj.edges;
	connEdges = dataobj.connEdges;
	maxNodeID = dataobj.maxNodeID;
	maxEdgeID = dataobj.maxNodeID;
	maxConnEdgeID = dataobj.maxConnEdgeID;
	updateSVG();
}

var nodeTemplate = {
    id: -1,
    text: "",
    type: 0,
    x: 0,
    y: 0
}

var edgeTemplate = {
    id: -1,
    text: "",
    type: 1,
    x: 50,
    y: 50,
    source: -1,
    target: -1
}


var selectedEntityType = -1; // -1 none, 0- node, 1- edge
var selectedEntity = -1;


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
var layer4 = svg.append('g');
var nodeCircles;
var nodeLabels;
var edgeLines;
var connEdgeLines;
var edgeCircles;
var edgeLabels;
var connCircles;
var connLabels;

var resultIndex;
var regularMode;

updateSVG();

//Update the SVG given data
function updateSVG() {
    //Deselect
    deselectEntity();



    //Create node nodeCircles
    nodeCircles = layer2.selectAll(".node")
        .data(nodes);

    nodeCircles.enter()
        .append("circle")
        .on("click", onClick)
        .call(drag)
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + (d.x * w) + "," + (d.y * h) + ")";
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
        .text(function (d) {
            return d.text;
        })
        .attr("transform", function (d) {
            return "translate(" + (d.x * w - 14) + "," + (d.y * h + 3) + ")";
        });

    nodeLabels.exit().remove();

    //Create edges (note: they are placed below circles)
    edgeLines = layer1.selectAll(".edge")
        .data(edges);

    edgeLines.enter()
        .append("line")
        .attr("class", "edge")
        .attr("marker-end", "url(#markerArrow)")
        .attr("data-edgeID", function (d) {
            return d.id
        })
        .attr("x1", function (d) {
            return w * getNode(d.source).x
        })
        .attr("y1", function (d) {
            return h * getNode(d.source).y
        })
        .attr("x2", function (d) {
            return w * getNode(d.target).x
        })
        .attr("y2", function (d) {
            return h * getNode(d.target).y
        });

    edgeLines.exit().remove();

    //Create connection edges (note: they are placed below circles)
    connEdgeLines = layer1.selectAll(".conn_edge")
        .data(connEdges);

    connEdgeLines.enter()
        .append("line")
        .attr("class", "conn_edge")
        .attr("marker-end", "url(#markerArrow)")
        .attr("data-connEdgeID", function (d) {
            return d.id
        })
        .attr("x1", function (d) {
            return w * getNode(d.source).x
        })
        .attr("y1", function (d) {
            return h * getNode(d.source).y
        })
        .attr("x2", function (d) {
            return w * getNode(d.target).x
        })
        .attr("y2", function (d) {
            return h * getNode(d.target).y
        });

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
        .attr("edgeID", function (d) {
            return d.id
        })
        .attr("class", "edge_circle")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .attr("r", circleRadius * 0.75);

    edgeCircles.exit().remove();

    //Create edge label
    layer3.selectAll(".edge_label").remove();
    edgeLabels = layer3.selectAll(".edge_label")
        .data(edges);

    edgeLabels.enter()
        .append("text")
        .call(drag)
        .on("click", onclick)
        .attr("class", "edge_label")
        .text(function (d) {
            return d.text
        })
        .attr("edgeID", function (d) {
            return d.id
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        });

    edgeLabels.exit().remove();

    //Create path circles
    layer4.selectAll(".conn_circle").remove();
    connCircles = layer4.selectAll(".conn_circle")
        .data(connEdges);

    connCircles.enter()
        .append("circle")
        .call(drag)
        .on("click", onClick)
        .attr("pathID", function (d) {
            return d.id
        })
        .attr("class", "conn_circle")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        })
        .attr("r", circleRadius * 0.75);

    connCircles.exit().remove();

    //Create path label
    layer4.selectAll(".conn_label").remove();
    connLabels = layer4.selectAll(".conn_label")
        .data(connEdges);

    connLabels.enter()
        .append("text")
        .call(drag)
        .on("click", onClick)
        .attr("class", "conn_label")
        .text(function (d) {
            return d.text
        })
        .attr("pathID", function (d) {
            return d.id
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")"
        });
    connLabels.exit().remove();


}

//Handle mouse click
//Note: if we click on a circle, then the function is called twice (from the circle & background)
//Not sure how to check if there is an object at the coordinates
function onClick(d, i) {
    console.log(d);
    if (d3.event.defaultPrevented)
        return;
    var coords = d3.mouse(this);
    var x = coords[0];
    var y = coords[1];

    //depart result mode
    if (mode == "result")
        mode = regularMode;

    console.log(d);
    switch (mode) {
        case "node":
            if ((d == undefined) && (!hasNode(x,y))) {
                //Create a new node at the click location
                maxNodeID += 1;
                nodes.push({
                    id: maxNodeID,
                    text: "node" + maxNodeID,
                    x: x / w,
                    y: y / h,
                    type: 0
                });
                updateSVG();
            }
            break;
        case "edge":
            if (d != undefined && d.type == 0) {
                //Clicked on the existing node
                if (selectedEntity == -1 || selectedEntity == i) {
                    //Select/deselect
                    selectNode(i);
                }
                else {
                    //Create a new edge
                    //Note: double sided edges are not currently allowed
                    var sourceID = nodes[selectedEntity].id;
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
                    selectNode(selectedEntity);
                }
            }
            break;
        case "conn_edge":
            if (d != undefined && d.type == 0) {
                //Clicked on the existing node
                if (selectedEntity == -1 || selectedEntity == i) {
                    //Select/deselect
                    selectNode(i);
                }
                else {
                    //Create a new connection edge
                    //Note: double sided connection edges are not currently allowed
                    var sourceID = nodes[selectedEntity].id;
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
                    selectNode(selectedEntity);
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
                    console.log("Node clicked" + i);
                }
                if (d.type == 1) {
                    //Select/deselect the edge
                    selectEdge(i);
                    console.log("Edge clicked");
                }
                if (d.type == 2) {
                    //Select/deselect the edge
                    selectPath(i);
                    console.log("Path clicked");
                }
                console.log(d);
            }
            break;
    }
}

//Define drag behavior
function onDrag(d, i) {
    //if we are selecting, and the action is coming from a node
    if (((mode == "select") || (mode != "select")) && (d.type == 0)) {
        var x = d3.event.x;
        var y = d3.event.y;
        var node = nodes[i];

        //Don't move past the svg boundary
        if ((x + circleRadius) > w)
            x = w - circleRadius - 1;
        if ((x - circleRadius) < 0)
            x = circleRadius + 1;
        if ((y + circleRadius) > h)
            y = h - circleRadius - 1;
        if ((y - circleRadius) < 0)
            y = circleRadius + 1;

        //Todo: prevent moving a node on top of another node

        //Move the node
        node.x = x / w;
        node.y = y / h;
        d3.select(nodeCircles[0][i]).attr("transform", "translate(" + x + "," + y + ")");
        d3.select(nodeLabels[0][i]).attr("transform", "translate(" + (x - 14) + "," + (y + 3) + ")");


        //Move all related edges
        for (var i = 0; i < edges.length; i++) {
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
        for (var i = 0; i < connEdges.length; i++) {
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

        updateEdgeLocation();
        updateSVG();
    }
}

//Select circle i if not selected, deselect otherwise
function selectNode(i) {
    //deselect other entities
    if (selectedEntityType != 0) {
        deselectEntity();
        selectedEntityType = 0;
    }

    if (selectedEntity != i) {
        //deselect the previously selected circle
        if (selectedEntity != -1)
            deselectNode();
        selectedEntity = i;
        selectNodeUIUpdate(i);
        editFieldset.disabled = false;
    }
    else {
        deselectNode();
    }
}

//Select edge label i if not selected, deselect otherwise
function selectEdge(i) {
    //deselect other entities
    if (selectedEntityType != 1) {
        deselectEntity();
        selectedEntityType = 1;
    }

    //if we select the same, just cancel, else also
    if (selectedEntity != i) {
        //deselect the previously selected circle
        if (selectedEntity != -1)
            deselectEdge();
        selectedEntity = i;
        selectEdgeUIUpdate(i);
        editFieldset.disabled = false;
    }
    else {
        deselectEdge();
    }
}



function selectNodeUIUpdate(i){
    //select the new node
    var circle = d3.select(nodeCircles[0][i]);
    circle.attr("class", "node_selected");
    if (mode == "select") {
        labelTextField.value = nodes[i].text;
    }
}

function selectEdgeUIUpdate(i){
    var circle = d3.select(edgeCircles[0][i]);
    circle.attr("class", "edge_circle_selected");
    if (mode == "select") {
        labelTextField.value = edges[i].text;
    }
}

//Select Path label i if not selected, deselect otherwise
function selectPath(i) {
    //deselect other entities
    if (selectedEntityType != 2) {
        deselectEntity();
        selectedEntityType = 2;
    }

    //if we select the same, just cancel, else also
    if (selectedEntity != i) {
        //deselect the previously selected circle
        if (selectedEntity != -1)
            deselectPath();
        selectedEntity = i;
        selectPathUIUpdate(i);
        editFieldset.disabled = false;
    }
    else {
        deselectPath();
    }
}

function selectPathUIUpdate(i){
    var circle = d3.select(connCircles[0][i]);
    circle.attr("class", "conn_circle_selected");
    if (mode == "select") {
        labelTextField.value = connEdges[i].text;
    }
}


//Deselect without changing mode
function deselectEntity(){
    console.log("deselecting "+ selectedEntity + " type--" + selectedEntityType);
    editFieldset.disabled = true;
    if (isSelectIdle()) {
        selectedEntity = -1;
        selectedEntityType = -1;
        return;
    }

    if (selectedEntityType == 0) {
        deselectNode();
    }

    if (selectedEntityType == 1) {
        deselectEdge();
    }

    if (selectedEntityType == 2) {
        deselectPath();
    }

    selectedEntity = -1;
    selectedEntityType = -1;
}

function isSelectIdle(){
    return ((selectedEntityType == -1) || (selectedEntity == -1));
}

function deselectNode(){
    var circle = d3.select(nodeCircles[0][selectedEntity]);
    selectedEntity = -1;
    //deselect node
    circle.attr("class", "node");
    if (mode == "select") {
        labelTextField.value = "";
    }
}

function deselectEdge(){
    var circle = d3.select(edgeCircles[0][selectedEntity]);
    selectedEntity = -1;
    //deselect edge
    circle.attr("class", "edge_circle");
    if (mode == "select") {
        labelTextField.value = "";
    }
}

function deselectPath(){
    var circle = d3.select(connCircles[0][selectedEntity]);
    selectedEntity = -1;
    //deselect Path
    circle.attr("class", "conn_circle");
    if (mode == "select") {
        labelTextField.value = "";
    }
}

//Save button clicked
function clickedSave() {
    if (mode != "select" || selectedEntity == -1)
        return;
    var newText = labelTextField.value;
    if (selectedEntityType == 0) {
        nodes[selectedEntity].text = newText;
        d3.select(nodeLabels[0][selectedEntity]).text(newText);
    } else if (selectedEntityType == 1) {
        edges[selectedEntity].text = newText;
    }
    updateSVG();
    //selectNode(selectedEntity);
}

//Delete button clicked
function clickedDelete() {
    if (selectedEntityType == 0) {
        if (mode != "select" || selectedEntity == -1)
            return;
        var node = nodes[selectedEntity];
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
        nodes.splice(selectedEntity, 1);
        selectNode(selectedEntity);
        //Redraw SVG completely
        nodeLabels.remove();
        nodeCircles.remove();
        edgeLines.remove();
        connEdgeLines.remove();
        edgeCircles.remove();
        edgeLabels.remove();
        updateSVG();
    }
    if (selectedEntityType == 1) {

        if (mode != "select" || selectedEntity == -1)
            return;
        var edge = edges[selectedEntity];
        var r = confirm("Are you sure you want to delete edge " + edge.text + "?");
        if (r == false)
            return;
        //Delete the node
        edges.splice(selectedEntity, 1);
        selectEdge(selectedEntity);
        //Redraw SVG completely
        edgeLines.remove();
        edgeCircles.remove();
        edgeLabels.remove();
        updateSVG();
        selectedEntityType = -1;
        selectedEntity = -1;
    }

}

//Change mode
function changeMode(r) {
    deselectEntity();
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
    for (var i = 0; i < edges.length; i++)
        if (edges[i].source == src && edges[i].target == trg)
            return true;
    for (var i = 0; i < connEdges.length; i++)
        if (connEdges[i].source == src && connEdges[i].target == trg)
            return true;
    return false;
}

//Get the node given id
function getNode(id) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.id == id)
            return node;
    }
    return false;
}

function getNodeLocation(id) {
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.id == id)
            return i;
    }
    return false;
}

function getEdge(edgeID) {
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if (edge.id == edgeID)
            return edge;
    }
    return false;
}

function getEdgeLocation(edgeID) {
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if (edge.id == edgeID)
            return i;
    }
    return false;
}

function hasNode(x,y){
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if ((Math.abs(w * node.x - x) <= circleRadius) && (Math.abs(h * node.y - y) <= circleRadius)) {
        console.log("Occupied");
        return true;
        }
    }
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        if ((Math.abs(edge.x - x) <= circleRadius) && (Math.abs(edge.y - y) <= circleRadius)) {
            console.log("Occupied by Edge");
            return true;
        }
    }
    return false;
}


function updateEdgeLocation() {
    for (var i = 0; i < edges.length; i++) {
        var d = edges[i];
        d.x = (w * getNode(d.source).x / 2 + w * getNode(d.target).x / 2);
        d.y = (h * getNode(d.source).y / 2 + h * getNode(d.target).y / 2);
    }

    for (var i = 0; i < connEdges.length; i++) {
        var d = connEdges[i];
        d.x = (w * getNode(d.source).x / 2 + w * getNode(d.target).x / 2);
        d.y = (h * getNode(d.source).y / 2 + h * getNode(d.target).y / 2);
    }
}



