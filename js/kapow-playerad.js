/*
<div class="kapow-ad" data-group="group1" data-autocomplete="false" data-mp4="https://import.cdn.thinkific.com/244754/74J3N4cSAek2mDY4fZpT_cnotheqj3djc72u2perg.mp4">&nbsp;</div>
<div class="kapow-ad" data-group="group2" data-autocomplete="false"  data-mp4="https://import.cdn.thinkific.com/244754/2T95GtR1mfpL7i9uq9wI_cml0j7aq9n7s72scu4cg.mp4">&nbsp;</div>
<div class="kapow-ad" data-group="default" data-autocomplete="false" data-mp4="https://import.cdn.thinkific.com/244754/GDyFp6GRRS1W0qUOFRYA_conthiovbf0c72uag9b0.mp4">&nbsp;</div>

*/


$(document).ready(function(){
    function clickContinueButton() {
        // Find the button with the data-qa attribute and trigger a click event
        $('[data-qa="complete-continue__btn"]').click();
    }    
    function showad(videourl, isAutocompleteEnabled,courseid,lessonid) {
        let adId = 'adShown-'+courseid+"-"+lessonid;
        // Check if the ad has already been shown in this session
        if (sessionStorage.getItem(adId) === 'true') {
            return;  // Exit the function if the ad was already shown
        }
    
        // Mark the ad as shown in session storage
        sessionStorage.setItem(adId, 'true');
    
        // Create a full-screen overlay with a video element
        const $overlay = $('<div>', {
            id: 'video-overlay',
            css: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                zIndex: 9999,  // Ensures it stays on top
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        });
    
        const $videoElement = $('<video>', {
            src: videourl,  // Your new video URL
            autoplay: true,
            muted: false,  // If you want the video to have sound
            playsinline: true,
            css: {
                width: '100%',
                height: 'auto'
            }
        });
    
        // Append the video to the overlay
        $overlay.append($videoElement);
    
        // Append the overlay to the body
        $('body').append($overlay);
    
        // Disable controls (user cannot interact with the video)
        $videoElement.prop('controls', false);
    
        // Listen for the video 'ended' event
        $videoElement.on('ended', function() {
            // Remove the overlay when the video ends
            $overlay.remove();
            if (isAutocompleteEnabled) {
                clickContinueButton();
            }
        });
    }


    if(typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            // Look for the element
            window.setTimeout(() => {
                // Get the user's groups from the Thinkific object
                const userGroups = Thinkific.current_user.groups || [];

                // Find all the kapow-ad elements
                const $ads = $('.kapow-ad');
                
                // Variable to hold the video URL if found
                let videoUrl = null;
                // Initialize a variable for the boolean
                let isAutocompleteEnabled = null;
                let autocompleteAttr = null;

                // Iterate through the user's groups to find the first matching ad
                for (let i = 0; i < userGroups.length; i++) {
                    const groupName = userGroups[i].name; // Access the "name" attribute
                    console.log("Looking for user group: "+groupName);
                    const $ad = $ads.filter(`[data-group="${groupName}"]`);
                    console.log($ad.length + " ads found");
                    if ($ad.length > 0) {
                        videoUrl = $ad.data('mp4');
                        // Select the element and get the data-autocomplete attribute value
                        autocompleteAttr = $ad.attr('data-autocomplete');
                        // Check if the attribute exists and contains "true" or "false"
                        if (autocompleteAttr === "true") {
                            isAutocompleteEnabled = true;
                        } else if (autocompleteAttr === "false") {
                            isAutocompleteEnabled = false;
                        }
                        console.log(videoUrl);
                        console.log("showing ad for group: "+groupName);
                        break;
                    }
                }

                // If no group match was found, look for the default ad
                if (!videoUrl) {
                    const $defaultAd = $ads.filter('[data-group="default"]');
                    if ($defaultAd.length > 0) {
                        console.log("showing default ad");
                        videoUrl = $defaultAd.data('mp4');
                        autocompleteAttr = $defaultAd.attr('data-autocomplete');
                        // Check if the attribute exists and contains "true" or "false"
                        if (autocompleteAttr === "true") {
                            isAutocompleteEnabled = true;
                        } else if (autocompleteAttr === "false") {
                            isAutocompleteEnabled = false;
                        }                        
                    }
                }

                // If a video URL was found, call showad with the URL
                if (videoUrl) {
                    console.log("showing ad: "+videoUrl);
                    showad(videoUrl,isAutocompleteEnabled,data.course.id, data.lesson.id);
                }                
            });            
        });
    }
});
