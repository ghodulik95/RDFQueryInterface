<?php
	require_once 'HTTP/Request2.php';

	$request = new HTTP_Request2('http://localhost:8080/RDFQueryWebService/RDFQueryWebService.asmx/Hello', HTTP_Request2::METHOD_POST);
	try {
		$request->setHeader('Content-type: application/x-www-form-urlencoded');
		$names = array('names' => array('Jon', 'Joe', 'Jim'));
		$request->addPostParameter(array('names' => json_encode($names)));
		$response = $request->send();
		if (200 == $response->getStatus()) {
			$raw_body = $response->getBody();
			$body = simplexml_load_string($raw_body);
			$body = json_decode($body, true);
			if($body !== null){
				foreach($body["lines"] as $k=>$s){
					echo $s."<br/>";
				}
			}
		} else {
			echo 'Unexpected HTTP status: ' . $response->getStatus() . ' ' .
				 $response->getReasonPhrase();
		}
	} catch (HTTP_Request2_Exception $e) {
		echo 'Error: ' . $e->getMessage();
	}
	/*
	$r = new HttpRequest('http://localhost:8080/RDFQueryWebService/RDFQueryWebService.asmx?op=HelloWorld', HttpRequest::METH_POST);
	$r->setOptions(array('cookies' => array('lang' => 'de')));
	$r->addPostFields(array('user' => 'mike', 'pass' => 's3c|r3t'));
	$r->addPostFile('image', 'profile.jpg', 'image/jpeg');
	try {
		echo $r->send()->getBody();
	} catch (HttpException $ex) {
		echo $ex;
	}
	*/
?>