$(document).ready(function() {
    function clickContinueButton() {
        $('[data-qa="complete-continue__btn"]').click();
    }

    function showad(videourl, isAutocompleteEnabled, courseid, lessonid) {
        let adId = 'adShown-' + courseid + "-" + lessonid;

        if (sessionStorage.getItem(adId) === 'true') {
            return;
        }

        sessionStorage.setItem(adId, 'true');

        // Create a full-screen overlay with centered video and countdown
        const $overlay = $('<div>', {
            id: 'video-overlay',
            css: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',  // Semi-transparent black
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }
        });

        const $videoElement = $('<video>', {
            src: videourl,
            autoplay: true,
            muted: false,
            playsinline: true,
            css: {
                maxWidth: '80%',
                maxHeight: '80%',
                outline: 'none'
            }
        });

        // Create a new span for the countdown message with inline styling
        const $countdownSpan = $('<span>', {
            css: {
                padding: '5px 10px',
                backgroundColor: 'black',
                color: 'white',
                marginTop: '15px',
                borderRadius: '5px',
                fontSize: '16px',
                textAlign: 'center',
                display: 'inline-block'
            }
        });

        // Append the video and countdown to the overlay
        $overlay.append($videoElement, $countdownSpan);
        $('body').append($overlay);

        $videoElement.prop('controls', false);

        // Update countdown in the span
        function updateCountdown() {
            const timeLeft = Math.ceil($videoElement[0].duration - $videoElement[0].currentTime);
            $countdownSpan.text(`Your lesson will resume in ${timeLeft} seconds`);
        }

        // Start countdown update interval
        $videoElement.on('play', function() {
            countdownInterval = setInterval(updateCountdown, 1000);
        });

        // Stop countdown, remove the overlay after video ends
        $videoElement.on('ended', function() {
            clearInterval(countdownInterval);
            $overlay.remove();  // Remove the overlay, including the countdown span
            if (isAutocompleteEnabled) {
                clickContinueButton();
            }
        });
    }

    if (typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            window.setTimeout(() => {
                const userGroups = Thinkific.current_user.groups || [];
                const $ads = $('.kapow-ad');

                let videoUrl = null;
                let isAutocompleteEnabled = null;
                let autocompleteAttr = null;

                for (let i = 0; i < userGroups.length; i++) {
                    const groupName = userGroups[i].name;
                    const $ad = $ads.filter(`[data-group="${groupName}"]`);
                    if ($ad.length > 0) {
                        videoUrl = $ad.data('mp4');
                        autocompleteAttr = $ad.attr('data-autocomplete');
                        isAutocompleteEnabled = autocompleteAttr === "true";
                        break;
                    }
                }

                if (!videoUrl) {
                    const $defaultAd = $ads.filter('[data-group="default"]');
                    if ($defaultAd.length > 0) {
                        videoUrl = $defaultAd.data('mp4');
                        autocompleteAttr = $defaultAd.attr('data-autocomplete');
                        isAutocompleteEnabled = autocompleteAttr === "true";
                    }
                }

                if (videoUrl) {
                    showad(videoUrl, isAutocompleteEnabled, data.course.id, data.lesson.id);
                }
            });
        });
    }
});