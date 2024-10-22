// add the following to the code view of a lesson (video, text) to control lesson specific delays
/*
<p class="kapow-ccdelay" data-delay="30">
	<br>
</p>
*/

// for a global delay on all lessons add this to SFC
/*
<script>
    let kapowCCDelay = 10;
</script>
*/
$(document).ready(function(){

    function startButtonDelay(delayTime) {
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
            var delayElement = $('.kapow-ccdelay');
            var delayTime = null;

            // Check if delayElement exists and has a valid data-delay attribute
            if (delayElement.length && delayElement.attr('data-delay')) {
                console.log("found delay element with delay");
                delayTime = parseInt(delayElement.attr('data-delay'), 10);  // Get delay value in seconds
                hideButton();
                startButtonDelay(delayTime);
            } else {
                console.log("did not find delay element or no valid delay value");

                // Check for kapowCCDelay if no delayElement or invalid delay found
                if (typeof kapowCCDelay !== 'undefined' && kapowCCDelay !== null) {
                    console.log("Using global delay");
                    hideButton();
                    startButtonDelay(kapowCCDelay);
                } else {
                    console.log("No global delay found, showing button immediately");
                    showButton();
                }
            }              
            }, 500);    


        });
    }
});    
    