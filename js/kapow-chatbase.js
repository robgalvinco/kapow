
  
$(document).ready(function(){
    let loaded=false;
    if(typeof(CoursePlayerV2) !== 'undefined') {
        function loadChatbase(id,domain){
            let loaded=true;
            if(!window.chatbase||window.chatbase("getState")!=="initialized"){
                window.chatbase=(...arguments)=>{
                    if(!window.chatbase.q){
                        window.chatbase.q=[]
                    }
                    window.chatbase.q.push(arguments)
                };
                window.chatbase=new Proxy(window.chatbase,{
                    get(target,prop){
                        if(prop==="q"){
                            return target.q
                        }
                        return(...args)=>target(prop,...args)
                    }
                })
            }
            const onLoad=function(){
                const script=document.createElement("script");
                script.src="https://chat.piano.fit/embed.min.js";
                script.id=id;
                script.domain=domain;
                document.body.appendChild(script)
            };
            if(document.readyState==="complete"){
                onLoad()
            }
            else{
                window.addEventListener("load",onLoad)
            }            
        }
      
        CoursePlayerV2.on('hooks:contentDidChange', function(data) {
            console.log(data);
            if(!loaded && window.kapow_chatbase_id && window.kapow_chatbase_domain){
                loadChatbase(window.kapow_chatbase_id,window.kapow_chatbase_domain);
            }
            
        });
    }
});    
    
