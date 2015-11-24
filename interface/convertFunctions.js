function javascriptToJSON(nodes, edges, connEdges){
	//Ignoring connEdges for now
	var nodesJSON = "[";
	$(nodes).each(function(index, value){
		nodesJSON += "{ id: "+value.id+", label: '"+value.text+"' },";
	});
	nodesJSON = nodesJSON.substring(0,nodesJSON.length - 1) + "]";
	
	var edgesJSON = "[";
	$(edges).each(function(index, value){
		edgesJSON += "{ source: "+value.source+", target: "+value.target+", label: '"+value.text+"' },";
	});
	edgesJSON = edgesJSON.substring(0,edgesJSON.length - 1) + "]";
	return "{ nodes: "+nodesJSON+", edges: "+edgesJSON+" }";
}