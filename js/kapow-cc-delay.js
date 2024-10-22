$(document).ready(function(){

    // Function to hide and show a button based on the element with class 'ccdelay'
    function startButtonDelay() {
            var delayElement = $('.ccdelay');
            // Get the data-delay value in seconds
            var delayTime = parseInt(delayElement.attr('data-delay'), 10);
            
            // Call the function to hide the button
            hideButton();
            
            // Start countdown and log it
            var countdown = delayTime;
            console.log("Countdown: " + countdown + " seconds remaining.");
            
            // Countdown interval to log each second
            timerInterval = setInterval(function() {
                countdown--;
                if (countdown > 0) {
                    console.log("Countdown: " + countdown + " seconds remaining.");
                } else {
                    clearInterval(timerInterval); // Clear the interval when the countdown ends
                    showButton(); // Show the button after the delay
                    console.log("Button revealed!");
                }
            }, 1000);
        
    }

    // Function to hide the button (you can customize this)
    function hideButton() {
        $('#course-player-footer button').hide();
    }

    // Function to show the button (you can customize this)
    function showButton() {
        $('#course-player-footer button').show();
    }

    // Function to stop all timers (clears any active timer)
    function stopAllTimers() {
        clearInterval(timerInterval); // Assuming 'timerInterval' is a global variable for the countdown
    }

    // Global variable to store the countdown timer
    var timerInterval = null;
    if(typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
           
            stopAllTimers();
            hideButton();
            // Look for the element
            window.setTimeout(() => {
                var delayElement = $('.ccdelay');
                
                // If the element exists
                if (delayElement.length) {
                    console.log("found delay");
                    hideButton();
                    startButtonDelay();
                } else {
                    console.log("did not find delay");
                    showButton();
                }                
            }, 500);    


        });
    }
});    
    