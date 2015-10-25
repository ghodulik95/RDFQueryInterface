<?php

	if(isset($_POST['action']) && !empty($_POST['action'])) {
		$action = $_POST['action'];
		switch($action) {
			case 'test' : test();break;
		}
	}
	
	function test(){
		$json = array("one" => "two", 2 => 3);
		$decode = json_encode($json);
		if($decode == null){
			echo "[0,1]";
		}else{
			echo $decode;
		}
	}


?>