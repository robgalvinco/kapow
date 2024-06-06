
window.addEventListener('message', (e) => {
    if (e?.data?.includes('Tally.FormLoaded')) {
        const payload = JSON.parse(e.data).payload;
        // ...
        console.log("Tally Form loaded");
        $('#course-player-footer').hide();
    }
});   
window.addEventListener('message', (e) => {
    if (e?.data?.includes('Tally.FormSubmitted')) {
        const payload = JSON.parse(e.data).payload;
        // ...
        console.log("Tally form submitted");
        $('#course-player-footer').show();    		
    }
});    
$(document).ready(function(){
    if(typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            $('#course-player-footer').show();
        });
    }
});