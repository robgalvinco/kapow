$(document).ready(function(){
    let lastUrl = window.location.href;
    function process_group_content(){
        // Hide all group-content elements initially
        $('.group-content').hide();
    
        // Get the user's groups from Thinkific.current_user.groups
        const userGroups = Thinkific.current_user.groups.map(group => group.name);
    
        // Loop through each .group-content element
        $('.group-content').each(function() {
            // Get the data-groups attribute and split it into an array
            const contentGroups = $(this).data('groups').split(',');
    
            // Check if any of the user's groups are in the contentGroups array
            const hasAccess = contentGroups.some(group => userGroups.includes(group.trim()));
    
            // Show the element if the user has access
            if (hasAccess) {
                $(this).show();
            }
        });    
    }
    function checkUrlChange() {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            // Check if the new URL contains "/completion"
            if (currentUrl.endsWith('/completion')) {
                console.log("The custom completion page URL has been detected!");
                // Perform any additional actions needed for the completion page
                process_group_content()
            } else {
                // Optionally, handle when URL no longer ends with /completion
            }
        }
        // Call this function again on the next animation frame
        requestAnimationFrame(checkUrlChange);
    }    
    if(typeof(CoursePlayerV2) !== 'undefined') {
        // Start the URL check loop for custom completion page
        requestAnimationFrame(checkUrlChange);
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            // Look for the element
            window.setTimeout(() => {
                process_group_content()
            });            
        }); 
        // catch cc on page load
        window.setTimeout(() => {
            process_group_content()
        },1000);        
        
    }
    
});