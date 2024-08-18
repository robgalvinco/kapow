// In Genially you can then trigger these events by insert external content

//<script>
//window.parent.postMessage('show_cc', '*');
//</script>

  
$(document).ready(function(){
    if(typeof(CoursePlayerV2) !== 'undefined') {
      window.addEventListener(
          "message",
          function (e) {
              console.log("Got message: "+e.data);
              switch (e.data) {
                  case "hide_cc":
                      $('#course-player-footer button').hide();
                      break;
                  case "show_cc":
                      $('#course-player-footer button').show();
                      break;
                  case "click_cc":
                      $("#course-player-footer button[data-qa='complete-continue__btn']").click();
                      break;
                  case "click_ic":
                      $("#course-player-footer .btn--incomplete button").click();
                      break;
                  case "hide_chapters":
                      $(".course-player__left-drawer").hide();
                      break;
                  case "show_chapters":
                      $(".course-player__left-drawer").show();
                      break;
              }
          },
          false
      );
      
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            console.log(data);
            if (data.lesson.source_url.indexOf("genially.com") !== -1) {
                console.log("The source URL contains 'genially.com'");
                // Add your logic here for when the URL contains "genially.com"
                $('#course-player-footer button').hide();

            } else {
                $('#course-player-footer button').show();

            }            
            
        });
    }
});    
    
