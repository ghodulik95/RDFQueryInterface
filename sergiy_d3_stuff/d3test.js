var w = 500;
var h = 500;

//Create data
var dataset = [];
var minSize = 10;
var maxSize = 20;
var numElements = 10;
for (var i=0; i<numElements; i++) {
	newElement = {
		number : minSize+Math.round(Math.random()*(maxSize-minSize)),
		x : maxSize+Math.random()*(w-2*maxSize),
		y : maxSize+Math.random()*(h-2*maxSize),
	};
	dataset.push(newElement);
}
connections = [];

//Create drag behavior
var drag = d3.behavior.drag()
	.on("drag", dragmove)
	
//Create svg
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)   
            .attr("height", h);
//Create circles
var circles = svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.call(drag)
	.on("click", click)
	.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	})
	.attr("r", function(d) {
		return d.number;
	})
	.attr("fill", "#FFF380")
	.attr("stroke", "orange");
//Create text labels
var labels = svg.selectAll("text")
	.data(dataset)
	.enter()
	.append("text")
	.call(drag)
	.text(function(d) {
		return d.number;
	})
	.attr("transform", function(d) {
		return "translate(" + (d.x-6) + "," + (d.y+2) + ")";
	})
	.attr("font-size", "12px");

//Move an item when dragging
function dragmove(d, i) {
	var x = d3.event.x;
	var y = d3.event.y;
	d3.select(circles[0][i]).attr("transform", "translate(" + x + "," + y + ")");
	d3.select(labels[0][i]).attr("transform", "translate(" + (x-6) + "," + (y+2) + ")");
}

var selected = -1; // selected circle	   
//Connect elements on click
function click(d, i){
	switch (selected) {
		case -1:
		case i: {
			select(i);
			break;
		}
		default: {
			connect(selected,i);
			break;
		}
	}
}

//select circle i if not selected, deselect otherwise
function select(i) {
	var circle = d3.select(circles[0][i]);
	if (selected != i) {
		//deselect the previously selected circle
		if (selected != -1)
			select(selected);
		//select
		circle.attr("fill", "#CDC14E");
		selected = i;
	}
	else {
		//deselect
		circle.attr("fill", "#FFF380");
		selected = -1;
	}
}

//connect circles i,j if not connected, disconnect otherwise
function connect(i,j) {
	var circle1 = d3.select(circles[0][i]);
	var circle2 = d3.select(circles[0][j]);
	select(selected); 
	index1 = -1;
	index2 = -1;
	for (var k=0; k<connections.length; k++) {
		if (JSON.stringify([i,j])==JSON.stringify(connections[k]))
			index1 = k;
		if (JSON.stringify([j,i])==JSON.stringify(connections[k]))
			index2 = k;
	}
	console.log(index1 + " " + index2);
	if (index1 == -1 && index2 == -1) {
		//circles are not connected
		connections.push([i,j]);
		//draw the line
	}
	else {
		//disconnect the circles
		if (index1 != -1)
			connections.splice(index1, 1);
		if (index2 != -1)
			connections.splice(index2, 1);
		//remove the line
	}
	console.log(connections);
}



	   
	