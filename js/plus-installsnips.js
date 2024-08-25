(function() {
        function loadScript() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://assets.superpowerups.com/playersnips.js';
            document.head.appendChild(script);
        }
        window.addEventListener('load', loadScript);
    })();