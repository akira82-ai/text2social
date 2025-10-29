// Popup script
document.addEventListener('DOMContentLoaded', function() {
  // You can add any popup-specific functionality here
  // For now, we'll just update the status
  const statusElement = document.getElementById('status');
  
  // Check if content script is working (this is just for demo purposes)
  // In a real extension, you might communicate with the content script
  setTimeout(() => {
    statusElement.textContent = 'Working... Select text on a webpage!';
  }, 1000);
});