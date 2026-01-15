/**
 * Navigation utility functions
 */

/**
 * Set up navigation functionality
 */
function setupNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section from the href
            const targetSection = this.getAttribute('href').substring(1);
            
            // Hide all sections
            hideAllSections();
            
            // Show the target section
            showSection(targetSection);
            
            // Update active navigation state
            updateActiveNav(this);
        });
    });
    
    // Also handle direct anchor clicks (like from the dashboard cards)
    const directLinks = document.querySelectorAll('a[href^="#"]');
    directLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('href').substring(1);
            
            // Hide all sections
            hideAllSections();
            
            // Show the target section
            showSection(targetSection);
            
            // Update active navigation state
            updateActiveNav(document.querySelector(`a[href="#${targetSection}"]`));
        });
    });
    
    // Show dashboard by default
    hideAllSections();
    showSection('dashboard');
}

/**
 * Hide all sections except the header and footer
 */
function hideAllSections() {
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

/**
 * Show a specific section
 */
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        // Trigger a custom event for the section being shown
        const event = new CustomEvent('sectionShown', { detail: { sectionId } });
        document.dispatchEvent(event);
    }
}

/**
 * Update the active state of navigation items
 */
function updateActiveNav(activeLink) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to the clicked link
    activeLink.classList.add('active');
}

// Export functions for module use
export { setupNavigation, hideAllSections, showSection, updateActiveNav };