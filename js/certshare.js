if (window.location.href.includes('/certificates/')) {
    if (typeof sharecolor != 'undefined') {
    var a2a_config = a2a_config || {};
    a2a_config.icon_color = sharecolor;
    }
    $('.student-certificate__share').prepend(`
    <style>
    .student-certificate__share .button {margin-bottom: 0px !important;}
    .a2a_full_footer{display:none !important;}
    </style>
    <div class="a2a_kit a2a_kit_size_32 a2a_default_style" style="display:block">
        <a class="a2a_dd" href="https://www.addtoany.com/share"></a>
        <a class="a2a_button_linkedin "></a> 
        <a class="a2a_button_facebook"></a>
        <a class="a2a_button_twitter"></a>
        
    </div>

    <script async src="https://static.addtoany.com/menu/page.js"><//script>`);  
}

if (window.location.href.includes('/take/')) {
$(document).ready(function () {
    var injected = false;
    if(typeof(CoursePlayerV2) !== 'undefined') {
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
        var certLink = $('.take a[href*="/certificates/"]:first').attr('href'); 
        var baseUrl = window.location.origin;
        if(typeof(certLink)!="undefined" && certLink !=""){
            if (typeof sharecolor != 'undefined') {
                a2a_sharecolor = 'data-a2a-icon-color="'+sharecolor+'"';
            } else {
                a2a_sharecolor="";
            }
            $('.course-progress__inner-container').append(`
            <style>
            .student-certificate__share .button {margin-bottom: 0px !important;}
            .a2a_full_footer{display:none !important;}
            .certshare {margin-top:10px;width:100%;display: flex;align-items: center;justify-content: center;}
            </style>
            <div class="certshare">
                <div data-a2a-url="${baseUrl+certLink}" ${a2a_sharecolor}  class="a2a_kit a2a_kit_size_32 a2a_default_style" style="display:block">
                    <a class="a2a_dd" href="https://www.addtoany.com/share"></a>
                    <a class="a2a_button_linkedin "></a> 
                    <a class="a2a_button_facebook"></a>
                    <a class="a2a_button_twitter"></a>
                    
                </div>
            </div>
            <script async src="https://static.addtoany.com/menu/page.js"><//script>`);  
                

            injected= true;

        }

        });
    }
});
}
