<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>


<script>
	
	
	function doSomething(data){
		alert(data["one"]);
	}
	
	/*$.getJSON("data.json", function(data) {
		doSomething(data);
	});
	*/
	
	$.ajax({
		type: "POST",
		url: "ajaxFunctions.php", //Relative or absolute path to response.php file
		data: {
				action:'GetEdges',
				databaseName: 'LUMBOld',
				tableName: 'LUBM'
			  },
		success: function(ret) {
			$("body").html(ret);
		}
		}).done(function() {alert("done");})
		.fail(function(){ alert("fail");});
	
</script>
<h2>
<?php
	echo "<i>Hello</i>";
?>
</h2>