
  $crisp = [];
  if (typeof(Thinkific) !== "undefined" && typeof(Thinkific.current_user) !== "undefined"){
    let CRISP_TOKEN_ID = Thinkific.current_user.id +"-"+Thinkific.current_user.created_at;
  } else {
    let CRISP_TOKEN_ID = null;
  }
  
  CRISP_WEBSITE_ID = 'e68cd695-0a35-44d7-bcc2-48caccc59598';
  (function(){d=document;s=d.createElement('script');s.src='//client.crisp.chat/l.js';s.async=1;d.getElementsByTagName('head')[0].appendChild(s);})();
