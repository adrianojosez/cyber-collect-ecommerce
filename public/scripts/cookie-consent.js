// Cookie Consent Banner Script
document.addEventListener('DOMContentLoaded', function() {
  const cookieConsent = document.getElementById('cookie-consent');
  const acceptButton = document.getElementById('cookie-accept');

  // Check if user has already accepted cookies
  if (!localStorage.getItem('cookieConsentAccepted')) {
    // Show the banner
    cookieConsent.classList.add('show');
  }

  // Handle accept button click
  acceptButton.addEventListener('click', function() {
    // Save acceptance to localStorage
    localStorage.setItem('cookieConsentAccepted', 'true');

    // Hide the banner with animation
    cookieConsent.classList.remove('show');

    // Remove from DOM after animation (optional)
    setTimeout(function() {
      cookieConsent.style.display = 'none';
    }, 300);
  });
});