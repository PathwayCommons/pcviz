$(document).ready(function() {
    $(".ui-slider").each(function() {
	    var sliderVal = Math.floor(Math.random()*5) + 1; 

	    $(this).slider({
        	min: 1,
        	max: 5,
       		value: sliderVal, 
        	orientation: "horizontal",
        	range: "min",
    	    });
    });
});

