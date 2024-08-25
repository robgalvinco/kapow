
// This will replace a custom field that has a label:
// Tally-1234abc
// where 1234abc is the Tally id
$(document).ready(function() {

    function getDataAsParms(formData) {
        // Parse the JSON string into an object
        const data = JSON.parse(formData);
        console.log(data);
        var parms = ""
        // Loop through the fields array
        data.fields.forEach(field => {
            // Skip fields of type HIDDEN_FIELDS
            if (field.type === "HIDDEN_FIELDS") return;

            parms +="&"+field.title+"="+field.answer.value;
            
        });
        return parms

    }

    function createDisabledInputs(formData, element) {
        // Parse the JSON string into an object
        const data = JSON.parse(formData);

        // Container to hold the dummy inputs (you can append this to a specific part of your page)
        const container = $('<div class="form__group"></div>');

        // Loop through the fields array
        data.fields.forEach(field => {
            // Skip fields of type HIDDEN_FIELDS
            if (field.type === "HIDDEN_FIELDS") return;

            // Create a label for the input
            const label = $('<label class="form__label"></label>').text(field.title);

            // Create the disabled input with the value
            const input = $('<input class="form__control custom-field">').attr({
                type: 'text',
                value: field.answer.value,
                disabled: true
            }).css({
            'background-color': '#e9ecef',
            'border': '1px solid #ced4da',
            'color': '#495057',
            'cursor': 'not-allowed',
            'opacity': '1',  // Ensure it's fully opaque
            'padding': '0.375rem 0.75rem',
            'width': '100%',
            'margin-top': '5px'
        });

            // Append the label and input to the container
            container.append(label).append(input).append('<br>');
        });

        // Append the container to a specific element on the page (e.g., a form or div)
        $(element).append(container);
    }

    // Iterate through each label within a form__group
    $('.form__group label').each(function() {
        var labelText = $(this).text();
        
        // Check if the label contains "Tally"
        if (labelText.includes('Tally')) {
            // Extract the Tally ID which comes after the "-"
            //var tallyId = labelText.split('-')[1].trim().split(' ')[0];
            var tallyId = labelText.match(/Tally-(.*?)-/)[1];
            var hiddenfields = getPreviousResponses(tallyId);

            // Get the associated form__group
            var formGroup = $(this).closest('.form__group');

            // Hide the form__group
            formGroup.hide();

            // Hide the form's submit button
            formGroup.closest('form').find('input[type="submit"], button[type="submit"]').hide();

            // Create the Tally.so embed iframe
            var tallyParams = "alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";
            if(typeof(Thinkific)!="undefined" && typeof(Thinkific.current_user)!="undefined" && Thinkific.current_user!=null){
                tallyParams += "&first_name="+Thinkific.current_user.first_name;
                tallyParams += "&last_name="+Thinkific.current_user.last_name;
                tallyParams += "&email="+Thinkific.current_user.email;
            }
            tallyParams += hiddenfields;
            var tallyEmbed = '<iframe src="https://tally.so/embed/' + tallyId + '?' + tallyParams + '" width="100%" height="500px" frameborder="0" marginheight="0" marginwidth="0" title="Tally Form"></iframe>';

            // Insert the Tally.so embed after the form__group
            formGroup.after(tallyEmbed);
        }
    });

    function getPreviousResponses (tallyId){
        console.log(`Getting FORM_DATA_${tallyId}`);
        const data = localStorage.getItem(`FORM_DATA_${tallyId}`);
        var params = "";
        if (data) {
            console.log("got previous response");
            console.log(data);
            try {
               params = getDataAsParms(data);
                console.log("Converted to params: " + params);
            } catch (error) {
                console.log("Error", error);
            }
            //createDisabledInputs(data,".my-account__form-contents");
        }  
        return params;
    }
    
    function handleTallyResponse(event) {
        // Ensure the message contains 'Tally.FormSubmitted'
        console.log("Tally event",event);
        if (event && event.data.includes('Tally.FormSubmitted')) {
            
            // Parse the message data to extract the payload
            const payload = JSON.parse(event.data).payload;
            console.log("Tally submitted payload: ",payload);
            
            // Extract the Tally ID from the payload
            const tallyId = payload.formId;

            // Get the form group associated with this Tally ID
            var formGroup = $('label:contains("Tally-' + tallyId + '")').closest('.form__group');

            // Find the corresponding input element
            var inputElement = formGroup.find('input[type="text"]');

            // Stringify the Tally form responses
            var tallyResponses = "submitted" //JSON.stringify(payload);
            
            // Save the Tally form responses to localStorage with the key `FORM_DATA_${tallyId}`
            localStorage.setItem(`FORM_DATA_${tallyId}`, JSON.stringify(payload));

            // Update the input element with the stringified responses
            inputElement.val(tallyResponses);
            
            // Find and submit the corresponding form
            var form = formGroup.closest('form');
            form.submit();

            console.log("Tally form submitted for ID: " + tallyId);
        }
    }



    // Listen for messages from Tally forms
    window.addEventListener("message", handleTallyResponse, false);    
    
});    
    

