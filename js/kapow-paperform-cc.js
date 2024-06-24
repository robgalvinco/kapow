
$(document).ready(function(){
    if(typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            $('#course-player-footer').show();
            if(data.lesson.contentable_type=="Iframe"){
                var intervalId = setInterval(function() {
                    $('iframe').each(function() {
                        var src = $(this).attr('src');
                        if (src && src.includes('paperform.co')) {
                            console.log('Found an iframe with src containing paperform.co:', this);
                            clearInterval(intervalId); // Stop the timer
                            $('#course-player-footer').hide();
                        }
                    });
                }, 500); // Check every 500 milliseconds                
            }
       
        });
    }
});    
