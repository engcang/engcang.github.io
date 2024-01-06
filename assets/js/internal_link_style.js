document.addEventListener('DOMContentLoaded', function() {
    const internalLinks = document.querySelectorAll('section a[href^="/"], section a[href^="' + window.location.origin + '"]');
    internalLinks.forEach(function(link) {
        link.classList.add('internal-link');
    });
});