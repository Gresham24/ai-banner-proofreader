/**
 * Banner Proofreader Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const bannerUrlInput = document.getElementById('banner-url');
  const submitButton = document.getElementById('submit-btn');
  const resultsArea = document.getElementById('results-area');
  const loadingIndicator = document.getElementById('loading');
  
  // Get API endpoint URL based on environment
  function getApiEndpoint() {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const port = isLocal ? ':8000' : '';
    const protocol = window.location.protocol;
    
    return `${protocol}//${hostname}${port}/api/proofread`;
  }
  
  // Event Listeners
  submitButton.addEventListener('click', handleSubmit);
  
  // Main submission handler
  async function handleSubmit() {
    const bannerUrl = bannerUrlInput.value.trim();
    
    // Validate input
    if (!bannerUrl) {
      showError('Please enter a banner URL');
      return;
    }
    
    // Clear previous results and show loading
    resultsArea.innerHTML = '';
    resultsArea.classList.remove('has-results');
    showLoading(true);
    
    // Show detailed processing message
    resultsArea.innerHTML = `
      <p class="text-gray-500 text-center">
        <strong>Analyzing banner animation over 15 seconds...</strong><br>
        This process takes approximately 20-25 seconds to complete.
      </p>
      <p class="text-gray-500 text-center text-sm mt-2">
        We're capturing 8 screenshots across a 15-second period to analyze all text that appears during the banner animation.
      </p>
    `;
    
    try {
      const apiEndpoint = getApiEndpoint();
      console.log('Making request to:', apiEndpoint);
      
      // Send request to endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          bannerUrl,
          multiScreenshot: true,
          durationSeconds: 15 // Request 15-second capture
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      
      // Display results
      displayResults(data.results, data.screenshotCount || 1, data.durationSeconds || 0);
    } catch (error) {
      console.error('Detailed error:', error);
      showError(error.message || 'An unexpected error occurred');
    } finally {
      showLoading(false);
    }
  }
  
  // Helper Functions
  function displayResults(results, screenshotCount, durationSeconds) {
    resultsArea.innerHTML = '';
    resultsArea.classList.add('has-results', 'fade-in');
    
    // Add screenshot and duration info - make it smaller and more subtle
    let analysisInfo = '';
    if (screenshotCount > 1 && durationSeconds > 0) {
      analysisInfo = `<div class="text-xs text-gray-500 mb-2">Analysis based on ${screenshotCount} screenshots over ${durationSeconds}s</div>`;
    }
    
    const formattedResults = formatResults(results);
    resultsArea.innerHTML = analysisInfo + formattedResults;
  }
  
  function formatResults(results) {
    // If results are empty or undefined
    if (!results) {
      return '<p class="text-gray-700">No issues found in the banner.</p>';
    }
    
    // Clean up unnecessary labels or markers that might come from the AI
    let cleanResults = results
      .replace(/^errors:/i, '')
      .replace(/^issues:/i, '')
      .replace(/^summary:/i, '')
      .replace(/^findings:/i, '')
      .replace(/no (spelling |grammar |)errors (were |)found/i, 'No issues found in the banner.')
      .replace(/the banner (appears to be|is) error-free/i, 'No issues found in the banner.')
      .trim();
    
    // Simple formatting - convert newlines to <br> and highlight issues
    const formatted = cleanResults
      .replace(/\n/g, '<br>')
      .replace(/(errors|issues|mistakes|incorrect|typos|misspellings)/gi, '<span class="font-bold text-red-600">$1</span>');
    
    return `<p class="text-gray-700">${formatted}</p>`;
  }
  
  function showError(message) {
    // Remove previous error messages
    const existingError = resultsArea.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Create and add new error message
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    resultsArea.innerHTML = '';
    resultsArea.appendChild(errorElement);
  }
  
  function showLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove('hidden');
      submitButton.disabled = true;
      submitButton.classList.add('opacity-70');
    } else {
      loadingIndicator.classList.add('hidden');
      submitButton.disabled = false;
      submitButton.classList.remove('opacity-70');
    }
  }
});
  