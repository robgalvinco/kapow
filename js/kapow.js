const endpoint = "https://parseapi.back4app.com/functions/pagesbeacon";
const headers = {
  "X-Parse-Application-Id": "G3jWuOFhgW831cYxRbxwKlco8iklwdeKjRBI3GZx",
  "X-Parse-REST-API-Key": "3dsu1YIrPHuRqZGhxy2JebN2Ii9kmWjhYTfuSTq7",
  "Content-Type": "application/json"
};
const body = {
  url: window.location.href
};

fetch(endpoint, {
  method: "POST",
  headers: headers,
  body: JSON.stringify(body)
})
  .then(response => response.json())
  .then(data => {
    // Handle the response data
    //console.log(data);
  })
  .catch(error => {
    // Handle any errors
    //console.error(error);
  });
