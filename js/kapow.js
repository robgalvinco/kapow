(function() {
  const endpoint = "https://parseapi.back4app.com/functions/pagesbeacon";
  const headers = {
    "X-Parse-Application-Id": "G3jWuOFhgW831cYxRbxwKlco8iklwdeKjRBI3GZx",
    "X-Parse-REST-API-Key": "3dsu1YIrPHuRqZGhxy2JebN2Ii9kmWjhYTfuSTq7",
    "Content-Type": "application/json"
  };
  const currentUrl = window.location.href;
  const urlWithoutQueryParams = currentUrl.split('?')[0].split('#')[0];

  // Check if the currentUrl contains "/manage/site_builder"
  //console.log(currentUrl);
  if (currentUrl.includes("/manage/site_builder")) {
    // Skip the fetch POST request
    //console.log("skipping");
  } else {
    //console.log("kapow");
    const body = {
      url: urlWithoutQueryParams
    };
  
    fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })
      .then(response => response.json())
      .then(data => {
        // Handle the response data
        // console.log(data);
      })
      .catch(error => {
        // Handle any errors
        // console.error(error);
      });    
  }


})();
