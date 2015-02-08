var message;
self.port.on("show", function (text) {
  console.log(text);
  message = text;
  document.getElementById('seconds').innerHTML = message;

  if(message >=3 && message <= 10){
  	document.getElementById('end').innerHTML = "You could have gone for a walk";
  }
  else if(message > 10 && message <= 60){
  	document.getElementById('end').innerHTML = "You could have excercised";
  }
  else if(message > 60 && message <= 120){
  	document.getElementById('end').innerHTML = "You could have read a book";
  }
  else if (message > 120){
  	document.getElementById('end').innerHTML = "You could have been a productive member of society";
  }
});

function getText(){
	return message;
}