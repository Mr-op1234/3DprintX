document.addEventListener('DOMContentLoaded', function() {

    function navigateIframe(targetPage) {
        try {
            if (window.parent && window.parent.document.getElementById('content-frame')) {
                const iframe = window.parent.document.getElementById('content-frame');
                if (iframe.src !== window.parent.location.origin + '/' + targetPage) {
                    iframe.src = targetPage;
                    // Optional: Update parent URL hash for bookmarking/history (simple version)
                    // window.parent.location.hash = targetPage;
                }
            } else {
                // Fallback if not in an iframe or parent iframe not found
                console.warn('Parent iframe not found, navigating current window.');
                window.location.href = targetPage;
            }
        } catch (e) {
            // Fallback for cross-origin or other errors
            console.error('Error navigating iframe:', e);
            window.location.href = targetPage;
        }
    }

    // Intercept clicks on links intended for iframe navigation
    document.body.addEventListener('click', function(event) {
        const link = event.target.closest('a');
        if (!link) return; // Exit if the click wasn't on or within a link

        const href = link.getAttribute('href');

        // Target specific pages to load in the iframe
        if (href === 'homepage.html' || href === 'team.html') {
            event.preventDefault(); // Prevent default link navigation
            navigateIframe(href);
        } 
        // Handle hash links for scrolling within the current iframe page
        else if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                event.preventDefault(); // Prevent default hash jump
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Optional: Update iframe's internal hash
                // history.pushState(null, '', href);
            }
        } 
        // Handle links like homepage.html#section
        else if (href && href.includes('homepage.html#')) {
            const parts = href.split('#');
            const page = parts[0];
            const targetId = parts[1];
            
            event.preventDefault();
            
            // Check if we are already on homepage.html
            if (window.location.pathname.endsWith('homepage.html')) {
                // Just scroll if already on the page
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // history.pushState(null, '', '#' + targetId);
                }
            } else {
                // Navigate to homepage.html first, then scroll (more complex)
                // For simplicity here, just navigate to homepage.html
                navigateIframe(page);
                // Note: Scrolling to the hash after page load requires more logic
            }
        }
        
        // Let other links behave normally (e.g., external links, placeholder '#')

    }, false); // Use capture phase potentially if needed, but bubble is usually fine

}); 