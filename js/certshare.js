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
