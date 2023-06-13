fetch('https://www.robgalvin.co/kapow/?l='+window.location.href)
  .then(response => response.text())
  .then(html => {
  })
  .catch(error => {
  });
