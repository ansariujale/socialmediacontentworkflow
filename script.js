 // Constants

//Webhook URL's For Test
// const N8N_WORKFLOW_URL = "https://janhavipal.app.n8n.cloud/webhook-test/47ea1222-5f01-4089-a26e-4c46f17e3985";       // for test
// const N8N_UPDATE_WEBHOOK_URL = "https://janhavipal.app.n8n.cloud/webhook-test/fdd90d42-37bb-48e3-a7df-169574e28578"; //for test
// const N8N_GENERATE_WEBHOOK_URL= "https://janhavipal.app.n8n.cloud/webhook-test/aab70e42-31ee-4017-834c-00aa8b436bbc" //for test

//Webhook URL's For Production
const N8N_WORKFLOW_URL = "https://janhavipal.app.n8n.cloud/webhook/47ea1222-5f01-4089-a26e-4c46f17e3985"; // for prod
const N8N_UPDATE_WEBHOOK_URL = "https://janhavipal.app.n8n.cloud/webhook/fdd90d42-37bb-48e3-a7df-169574e28578"; //for prod
const N8N_GENERATE_WEBHOOK_URL= "https://janhavipal.app.n8n.cloud/webhook/aab70e42-31ee-4017-834c-00aa8b436bbc" //for prod

const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0ggy_qYLwzAc2f3iMvQ0gpuUZ8MCf5YsDGbydGaMYCneKXmGoAhtcCvBAPeHA_SljFd0pwKGd0lwq/pub?output=csv";

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const initialForm = document.getElementById('initialForm');
const initialSubmit = document.getElementById('initialSubmit');
const reviewSubmit = document.getElementById('reviewSubmit');
const finalSubmit = document.getElementById('finalSubmit');
const backToPage2= document.getElementById('goToPage2');
const backToPage1= document.getElementById('backToPage1');
const resultsLoading = document.getElementById('resultsLoading');
const resultsContent = document.getElementById('resultsContent');
const previewLoading = document.getElementById('previewLoading');
const previewContent = document.getElementById('previewContent');
const seePendingPosts = document.getElementById('seePendingPosts');
const pendingPostsSection = document.getElementById('pendingPostsSection');
const pendingPostsList = document.getElementById('pendingPostsList');
const pendingPostsLoading = document.getElementById('pendingPostsLoading');
const backToInput = document.getElementById('backToInput');
const GeneratePlatformSpecificContent= document.getElementById("generateselectedplatformcontent")
const nextToPreview = document.getElementById('nextToPreview');
const backToStepreviewpage = document.getElementById('backToStepreviewpage');

let contentData = null;
let selectedPlatforms = [];
let pendingPosts = [];
let selectedPost = null;
let configurationSubmitted = false;
let isDarkMode = false;
// Post style tab functionality
let selectedPostStyle = '';


// Initialize Lenis smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Handle Lenis events for better scroll performance
lenis.on('scroll', () => {
  // Custom scroll handling if needed
})

lenis.on('stop', () => {
  // Scroll stopped handling
})

// Make Lenis globally accessible
window.lenis = lenis;

document.addEventListener('DOMContentLoaded', function() {
  const postStyleTabs = document.querySelectorAll('.post-style-tab');

  postStyleTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove selected class from all tabs
      postStyleTabs.forEach(t => t.classList.remove('selected'));

      // Add selected class to clicked tab
      this.classList.add('selected');

      // Update hidden input value
      selectedPostStyle = this.getAttribute('data-value');
      document.getElementById('postStyle').value = selectedPostStyle;
    });
  });
  
});

// Home button functionality
const homeButton = document.getElementById('homeButton');
if (homeButton) {
  homeButton.addEventListener('click', function() {
    showStep(1);
    // Clear any messages
    clearMessage('initialMessage');
    clearMessage('step2Message');
    clearMessage('step3Message');
    // Reset form if needed
    document.getElementById('userInput').value = '';
    document.getElementById('description').value = '';
    selectedPlatforms = [];
    selectedPost = null;
    configurationSubmitted = false;
  });
}

// Dark mode toggle functionality
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
  // Load saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    enableDarkMode();
  }

  darkModeToggle.addEventListener('click', function() {
    if (isDarkMode) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  });
}

function enableDarkMode() {
  document.body.classList.add('dark-mode');
  isDarkMode = true;
  localStorage.setItem('darkMode', 'true');

  // Update toggle button icons
  const sunIcon = darkModeToggle.querySelector('.sun-icon');
  const moonIcon = darkModeToggle.querySelector('.moon-icon');
  if (sunIcon) sunIcon.style.display = 'none';
  if (moonIcon) moonIcon.style.display = 'block';
}

function disableDarkMode() {
  document.body.classList.remove('dark-mode');
  isDarkMode = false;
  localStorage.setItem('darkMode', 'false');

  // Update toggle button icons
  const sunIcon = darkModeToggle.querySelector('.sun-icon');
  const moonIcon = darkModeToggle.querySelector('.moon-icon');
  if (sunIcon) sunIcon.style.display = 'block';
  if (moonIcon) moonIcon.style.display = 'none';
}


// Utility functions
function showStep(stepNum) {
  [step1, step2, step3].forEach(step => step.classList.remove('active'));
  document.getElementById(`step${stepNum}`).classList.add('active');

  // Update progress bar
  for (let i = 1; i <= 3; i++) {
    const progressStep = document.getElementById(`progress${i}`);
    if (i < stepNum) {
      progressStep.classList.add('completed');
      progressStep.classList.remove('active');
    } else if (i === stepNum) {
      progressStep.classList.add('active');
      progressStep.classList.remove('completed');
    } else {
      progressStep.classList.remove('active', 'completed');
    }
  }
}

// Toast notification functions
function showToast(message, type = 'error') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="toast-icon">
        ${type === 'error' ?
          '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/>' :
          '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>'
        }
      </svg>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="closeToast(this)">×</button>
    </div>
  `;

  // Add toast to body
  document.body.appendChild(toast);

  // Show toast with animation
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 10);

  // Auto-hide after 3 seconds
  setTimeout(() => {
    closeToast(toast.querySelector('.toast-close'));
  }, 3000);
}

function closeToast(button) {
  const toast = button.closest('.toast');
  if (toast) {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }
}

// Make functions globally available
window.closeToast = closeToast;

function showMessage(elementId, message, type = 'error') {
  const element = document.getElementById(elementId);
  element.innerHTML = `<div class="alert ${type}">${message}</div>`;
}

function clearMessage(elementId) {
  document.getElementById(elementId).innerHTML = '';
}

// Store data in Google Sheets via n8n
async function storeDataInSheets(data, input) {
  try {
    const sheetData = {
      input: input,
      summary: data.summary,
      headline: data.headline,
      source: 'web_interface',
      action: 'store'
    };

    const response = await fetch(N8N_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData)
    });

    if (!response.ok) {
      console.warn('Failed to store data in sheets:', response.status);
    }
  } catch (error) {
    console.warn('Error storing data in sheets:', error);
  }
}

// Update social channel and needs image via n8n webhook
async function updateSheetWithSelections(platforms, includeImage) {
  try {
    if (!selectedPost) {
      console.warn('No selected post to update');
      return;
    }

    // Map platform names to specific strings as requested
    const platformMapping = {
      linkedin: 'Linkedin',
      twitter: 'Twitter',
      instagram: 'Instagram',
      facebook: 'Facebook',
      blog: 'Blog'
    };

    const mappedPlatforms = platforms.map(platform =>
      platformMapping[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)
    );

    const socialChannelValue = mappedPlatforms.join(','); // Comma-separated string like "Twitter,Linkedin"
    const needsImageValue = includeImage ? 'yes' : 'no';

    // Send data to the update webhook
    const updateData = {
      headline: selectedPost.sourceHeadline,
      summary: selectedPost.sourceSummary,
      socialChannels: socialChannelValue,
      needsImage: needsImageValue,
      source: 'web_interface'
    };

    const response = await fetch(N8N_UPDATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.warn('Error sending update to webhook:', error);
    throw error;
  }
}




// Wait for data to be stored in sheets by polling Google Sheets directly (with timeout)
async function waitForDataStorage(input) {
  const maxAttempts = 15;
  const delay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const latestData = await fetchLatestDataFromSheets();

      // Find the row that matches the input we just submitted
      const matchingRow = latestData.find(row => row.input && row.input.trim() === input.trim());

      if (matchingRow && matchingRow.sourceHeadline && matchingRow.sourceHeadline.trim() !== '' &&
          matchingRow.sourceSummary && matchingRow.sourceSummary.trim() !== '') {
        console.log(`Data with content found in sheets on attempt ${attempt}:`, matchingRow);
        return matchingRow; // Return the matching row with content
      }

      console.log(`Attempt ${attempt}: Data not yet available in sheets for input "${input}"`);
    } catch (error) {
      console.warn(`Storage check attempt ${attempt} failed:`, error);
    }

    // Update loading message
    showMessage('initialMessage', `Processing content... (${attempt}/${maxAttempts})`, 'info');

    // Wait before next attempt
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.warn('Data storage check timed out, proceeding with available data');
}

// Polling for latest newly added row - simplified approach
async function pollForDataStorage() {
  const maxAttempts = 40; // Increased attempts for better reliability
  const delay = 5000; // 5 seconds between attempts
  let attempt = 0;
  let initialRowCount = 0;
  let lastRowCount = 0;

  console.log(`🔍 Starting polling for latest newly added row...`);

  // Get initial data to establish baseline
  try {
    const initialData = await fetchLatestDataFromSheets();
    initialRowCount = initialData.length;
    lastRowCount = initialRowCount;
    
    console.log(`📊 Initial row count: ${initialRowCount}`);
    console.log(`📊 Initial data sample:`, initialData.slice(-3)); // Show last 3 rows for debugging
    
    // Return the latest row immediately if we already have data
    if (initialData.length > 0) {
      const latestRow = initialData[initialData.length - 1];
      console.log(`📋 Latest initial row:`, {
        input: latestRow.input,
        headline: latestRow.sourceHeadline,
        summary: latestRow.sourceSummary
      });
      return latestRow;
    }
  } catch (error) {
    console.warn('Failed to get initial data:', error);
  }

  while (attempt < maxAttempts) {
    attempt++;

    try {
      const latestData = await fetchLatestDataFromSheets();
      const currentRowCount = latestData.length;
      
      console.log(`\n🔄 Polling attempt ${attempt}/${maxAttempts}`);
      console.log(`📊 Row count: ${currentRowCount} (initial: ${initialRowCount}, last: ${lastRowCount})`);

      // Check for new rows
      if (currentRowCount > lastRowCount) {
        console.log(`🆕 NEW ROW DETECTED! Row count increased from ${lastRowCount} to ${currentRowCount}`);
        
        // Get the latest row (newest addition)
        const newRow = latestData[currentRowCount - 1];
        console.log(`📋 Newest row:`, {
          input: newRow.input,
          headline: newRow.sourceHeadline,
          summary: newRow.sourceSummary
        });
        
        // Return the newest row immediately
        return newRow;
      } else {
        console.log(`⏳ No new rows. Current: ${currentRowCount}, Last: ${lastRowCount}`);
      }

    } catch (error) {
      console.warn(`❌ Storage polling attempt ${attempt}/${maxAttempts} failed:`, error);
    }

    // Update loading message with attempt count and progress
    const progressPercent = Math.round((attempt / maxAttempts) * 100);
    showMessage('initialMessage', `Processing content... (${attempt}/${maxAttempts} attempts - ${progressPercent}%)`, 'info');

    // Wait before next attempt
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Final attempt - return the most recent row with any content
  try {
    console.log(`\n=== FINAL ATTEMPT ===`);
    const finalData = await fetchLatestDataFromSheets();
    console.log(`Final data row count: ${finalData.length}`);
    
    if (finalData.length > 0) {
      const mostRecentRow = finalData[finalData.length - 1];
      console.log(`📋 Returning most recent row:`, mostRecentRow);
      return mostRecentRow;
    }
    
  } catch (error) {
    console.warn('Failed to fetch final data:', error);
  }

  // Timeout reached - throw error to be handled by caller
  console.error(`❌ Polling timed out after ${maxAttempts} attempts (${maxAttempts * delay / 1000} seconds)`);
  throw new Error(`Content generation timed out. Please check your n8n workflow and try again. If the problem persists, contact support.`);
}

// Helper function to find matching row with enhanced matching logic
function findMatchingRow(data, input, requireComplete = true) {
  if (!data || !Array.isArray(data)) return null;
  
  const normalizedInput = input.trim().toLowerCase();
  
  // Try multiple input field variations
  const inputFieldVariations = [
    'input',
    'keyword input',
    'Keyword Input',
    'Input',
    'userInput',
    'keywordInput'
  ];
  
  for (const row of data) {
    if (!row) continue;
    
    // Try different input field names
    let foundInput = false;
    let inputFieldValue = '';
    
    for (const fieldName of inputFieldVariations) {
      const fieldValue = row[fieldName] || row[fieldName?.toLowerCase()] || '';
      const normalizedFieldValue = fieldValue.trim().toLowerCase();
      
      if (normalizedFieldValue === normalizedInput) {
        foundInput = true;
        inputFieldValue = fieldValue;
        break;
      }
    }
    
    if (!foundInput) continue;
    
    console.log(`🎯 Found input match using field:`, inputFieldValue);
    
    // If complete content is required, check both headline and summary
    if (requireComplete) {
      const hasHeadline = row.sourceHeadline && row.sourceHeadline.trim() !== '';
      const hasSummary = row.sourceSummary && row.sourceSummary.trim() !== '';
      
      if (hasHeadline && hasSummary) {
        console.log(`✅ Found complete row with both headline and summary`);
        return row;
      } else {
        console.log(`⚠️ Row matches input but content incomplete:`, {
          hasHeadline,
          hasSummary,
          headlinePreview: row.sourceHeadline?.substring(0, 50),
          summaryPreview: row.sourceSummary?.substring(0, 50)
        });
      }
    } else {
      // If not requiring complete content, return the row if it has any content
      if (row.sourceHeadline || row.sourceSummary) {
        console.log(`✅ Found row with any content (relaxed matching)`);
        return row;
      }
    }
  }
  
  return null;
}

// Helper function for partial matching when exact match fails
function findPartialMatchingRow(data, normalizedInput) {
  if (!data || !Array.isArray(data)) return null;
  
  const inputVariations = [
    'input',
    'keyword input',
    'Keyword Input',
    'Input',
    'userInput',
    'keywordInput'
  ];
  
  for (const row of data) {
    if (!row) continue;
    
    for (const fieldName of inputVariations) {
      const fieldValue = row[fieldName] || row[fieldName?.toLowerCase()] || '';
      const normalizedFieldValue = fieldValue.trim().toLowerCase();
      
      // Try exact match first
      if (normalizedFieldValue === normalizedInput) {
        console.log(`🎯 Partial match - exact match found using field "${fieldName}":`, fieldValue);
        if (row.sourceHeadline && row.sourceSummary) {
          return row;
        }
      }
      
      // Try partial match (input is contained within the field value)
      if (normalizedFieldValue.includes(normalizedInput) || normalizedInput.includes(normalizedFieldValue)) {
        console.log(`🎯 Partial match - containment found using field "${fieldName}":`, fieldValue);
        if (row.sourceHeadline && row.sourceSummary) {
          return row;
        }
      }
      
      // Try similarity match (words overlap)
      const inputWords = normalizedInput.split(/\s+/);
      const fieldWords = normalizedFieldValue.split(/\s+/);
      const commonWords = inputWords.filter(word => fieldWords.includes(word));
      
      if (commonWords.length > 0 && commonWords.length >= Math.min(inputWords.length, fieldWords.length) * 0.7) {
        console.log(`🎯 Partial match - similarity found using field "${fieldName}":`, {
          fieldValue,
          commonWords,
          matchPercentage: Math.round((commonWords.length / Math.max(inputWords.length, fieldWords.length)) * 100)
        });
        if (row.sourceHeadline && row.sourceSummary) {
          return row;
        }
      }
    }
  }
  
  return null;
}

// Simple CSV row parser that handles quoted fields
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.replace(/"/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current.replace(/"/g, '').trim());

  return result;
}

// Fetch latest data directly from Google Sheets CSV with cache-busting
async function fetchLatestDataFromSheets() {
  try {
    // Add cache-busting parameter to prevent stale data
    const cacheBuster = Date.now();
    const urlWithCacheBuster = `${GOOGLE_SHEETS_CSV_URL}&_cb=${cacheBuster}`;
    
    console.log('Fetching data from:', urlWithCacheBuster.replace(/&_cb=\d+/, '...[CACHE_BUSTER]'));
    
    const response = await fetch(urlWithCacheBuster);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    console.log('Raw CSV response length:', csvText.length);
    console.log('CSV preview (first 500 chars):', csvText.substring(0, 500));

    // Parse CSV properly handling multiline fields
    const rows = parseCSV(csvText);
    console.log('Parsed rows count:', rows.length);

    if (rows.length < 2) {
      console.log('No data rows found in CSV');
      return []; // No data rows
    }

    // First row is headers
    const headers = rows[0];
    console.log('CSV Headers:', headers);
    const dataRows = rows.slice(1);
    console.log('Data rows count:', dataRows.length);

    // Convert to objects with enhanced debugging
    const parsedData = dataRows.map((row, index) => {
      const obj = {};
      headers.forEach((header, headerIndex) => {
        const value = row[headerIndex] || '';
        obj[header] = value;
        
        // Log key fields for debugging
        if (header.toLowerCase().includes('input') || header.toLowerCase().includes('headline') || header.toLowerCase().includes('summary')) {
          console.log(`Row ${index + 1}, Column "${header}":`, value);
        }
      });
      return obj;
    });

    return parsedData;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

// Improved CSV parser that handles multiline fields
function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < csvText.length) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Row separator
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      }
      // Skip \r\n sequence
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }

    i++;
  }

  // Add the last field and row if any
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// Fetch latest data from Google Sheets CSV
async function fetchLatestData() {
  return await fetchLatestDataFromSheets();
}

// Fetch unique status values from Google Sheets
async function fetchUniqueStatuses() {
  try {
    const allData = await fetchLatestDataFromSheets();
    const statuses = new Set();

    allData.forEach(row => {
      const status = row.Status;
      if (status && status.trim()) {
        statuses.add(status.trim());
      }
    });

    return Array.from(statuses).sort();
  } catch (error) {
    console.error('Error fetching unique statuses:', error);
    return ['Waiting for Content']; // Fallback
  }
}

// Fetch pending posts with optional status filter
async function fetchPendingPosts(statusFilter = null) {
  try {
    const allData = await fetchLatestDataFromSheets();
    console.log('All data fetched:', allData);
    console.log('Total rows:', allData.length);

    let filteredPosts;
    if (statusFilter && statusFilter.trim() !== '') {
      // Filter by specific status
      filteredPosts = allData.filter(row => {
        const status = row.Status;
        return status && status.trim() === statusFilter;
      });
    }else {
      // Show all posts when "All Statuses" is selected or no filter
      filteredPosts = allData;
    }


    console.log('Filtered posts count:', filteredPosts.length);
    console.log('Filtered posts:', filteredPosts.map(p => ({ headline: p.sourceHeadline, status: p.Status })));
    return filteredPosts;
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    throw error;
  }
}

// Add event listener for "Next" button validation in Step 1
if (backToStepreviewpage) {
  backToStepreviewpage.addEventListener('click', function(e) {
    e.preventDefault();
    
    const input = document.getElementById('userInput').value.trim();
    const postStyle = document.getElementById('postStyle').value.trim();
    
    if (!input) {
      showToast('Please enter a keyword, URL, or text prompt.', 'error');
      return;
    }
    
    if (!postStyle) {
      showToast('Please select a post style type.', 'error');
      return;
    }
    
    // If validation passes, proceed with navigation
    showToast('Validation successful! Use "Generate Content" to proceed.', 'success');
  });
}

// Step 1: Initial form submission
initialForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const input = document.getElementById('userInput').value.trim();
  const description = document.getElementById('description').value.trim();
  const postStyle = document.getElementById('postStyle').value.trim();

  if (!input) {
    showToast('Please enter a keyword, URL, or text prompt.', 'error');
    return;
  }

  if (!postStyle) {
    showToast('Please select a post style type.', 'error');
    return;
  }

  initialSubmit.disabled = true;
  initialSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Generating...</span>';
  clearMessage('initialMessage');

  try {
    // Show loading state immediately
    resultsLoading.style.display = 'block';
    resultsContent.style.display = 'none';
    showMessage('initialMessage', 'Processing...', 'info');

    // Send input to n8n webhook and wait for response
    try {
      const webhookResponse = await fetch(N8N_WORKFLOW_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          description: description,
          postStyle: postStyle,
          source: 'web_interface'
        })
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook response error: ${webhookResponse.status}`);
      }

      console.log('Webhook sent successfully, waiting for data processing...');
    } catch (error) {
      console.warn('Webhook call failed:', error);
      showMessage('initialMessage', 'Failed to send request. Please try again.', 'error');
      return;
    }

    // Stay on step 1 and show loading state until data is ready
    showMessage('initialMessage', 'Processing...', 'info');

    // Start polling for data while staying on step 1
    const storedData = await pollForDataStorage();

    if (storedData) {
      // Set selectedPost to the stored data row
      selectedPost = storedData;

      // Use data directly from the dedicated columns
      contentData = {
        summary: storedData.sourceSummary || 'Summary not available',
        headline: storedData.sourceHeadline || 'Headline not available',
        content: storedData.twitterCopy || 'Content will be generated based on your input.',
        input: input,
        description: description,
        postStyle: postStyle
      };

      console.log('Final content data to display:', contentData);

      // Move to step 2 and display results
      showStep(2);
      displayResults(contentData);
    } else {
      showMessage('initialMessage', 'Data processed but not found in database. Please try again.', 'error');
    }

  } catch (error) {
    console.error('❌ Error during content generation:', error);

    // Provide specific error messages based on error type
    let errorMessage = 'Failed to generate content. Please try again.';
    if (error.message.includes('timed out')) {
      errorMessage = 'Content generation is taking longer than expected. Please check your n8n workflow status and try again.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error occurred. Please check your internet connection and try again.';
    } else if (error.message.includes('webhook')) {
      errorMessage = 'Failed to send request to processing service. Please try again.';
    }

    showMessage('initialMessage', `❌ Error: ${errorMessage}`, 'error');

    // Reset to step 1 on error
    showStep(1);
  } finally {
    initialSubmit.disabled = false;
    initialSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/></svg>Generate Content</span>';
  }
});

// Display results in step 2
function displayResults(data) {
  resultsLoading.style.display = 'none';
  resultsContent.style.display = 'block';

  // Only display if we have actual data from sheets
  if (data.summary && data.headline) {
    // Display data from Google Sheets
    document.getElementById('contentSummary').innerHTML = `
      <div class="summary-text">
        <strong>Summary:</strong><br>${data.summary}
      </div>
    `;

    document.getElementById('sourceHeadlines').innerHTML = `
      <p><strong>Source Headline:</strong> ${data.headline}</p>
    `;
  } else {
    // Show loading state while waiting for real data
    document.getElementById('contentSummary').innerHTML = `
      <p><strong>Summary:</strong> <em>Processing your content...</em></p>
    `;

    document.getElementById('sourceHeadlines').innerHTML = `
      <p><strong>Source Headline:</strong> <em>Generating headline...</em></p>
    `;
  }
}

// Display pending posts section with filter
function displayPendingPostsSection(statuses, posts) {
  pendingPostsLoading.style.display = 'none';

  // Create filter, search, and sort section
  const filterAndSearchHTML = `
    <div class="pending-posts-controls">
      <div class="control-row">
        <div class="control-section">
          <div class="control-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="control-icon">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
            </svg>
            Filter by Status
          </div>
          <select id="statusFilter" class="control-dropdown">
            <option value="">All Statuses</option>
            ${statuses.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        
        <div class="control-section">
          <div class="control-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="control-icon">
              <path d="M3 18h6v-2H3v2zm0-5h12v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
            </svg>
            Sort by
          </div>
          <select id="sortBy" class="control-dropdown">
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      <div class="control-section full-width">
        <div class="control-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="control-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
          </svg>
          Search by Headline
        </div>
        <div class="search-container">
          <input type="text" id="headlineSearch" class="search-input" placeholder="Enter headline to search...">
          <button id="clearSearch" class="search-clear-btn" style="display: none;">×</button>
        </div>
      </div>
    </div>
  `;

  // Update the pending posts section structure
  const sectionContent = document.querySelector('#pendingPostsSection .section-content');
  if (!sectionContent) {
    // If no section content wrapper, create one
    const originalContent = pendingPostsSection.innerHTML;
    pendingPostsSection.innerHTML = `
      <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="#2196F3"/></svg>Pending Posts</h3>
      <p>Select a post to continue:</p>
      ${filterAndSearchHTML}
      <div id="pendingPostsList" class="pending-posts-list">
        <div class="loading" id="pendingPostsLoading">
          <div class="spinner"></div>
          <p>Loading pending posts...</p>
        </div>
      </div>
      <div class="btn-group">
        <button id="backToInput" class="btn btn-secondary">
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>Back to Input</span>
        </button>
      </div>
    `;
  } else {
    // Insert filter and search before the posts list
    const postsList = document.getElementById('pendingPostsList');
    postsList.insertAdjacentHTML('beforebegin', filterAndSearchHTML);
  }

  // Display posts
  displayPendingPosts(posts);

  // Add filter event listener
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', async function() {
      const selectedStatus = this.value;
      const searchTerm = document.getElementById('headlineSearch').value.trim();
      const sortBy = document.getElementById('sortBy').value;
      try {
        const loadingElement = document.getElementById('pendingPostsLoading');
        const postsListElement = document.getElementById('pendingPostsList');

        if (loadingElement) loadingElement.style.display = 'block';
        if (postsListElement) postsListElement.style.display = 'none';

        const filteredPosts = await fetchPendingPosts(selectedStatus || null);
        
        // Apply search filter if there's a search term
        const searchFilteredPosts = searchTerm ?
          filteredPosts.filter(post =>
            post.sourceHeadline && post.sourceHeadline.toLowerCase().includes(searchTerm.toLowerCase())
          ) : filteredPosts;
        
        // Apply sorting
        const sortedPosts = sortPosts(searchFilteredPosts, sortBy);
        
        displayPendingPosts(sortedPosts);
      } catch (error) {
        console.error('Error filtering posts:', error);
        showMessage('initialMessage', 'Failed to filter posts. Please try again.', 'error');
      }
    });
  }

  // Add sort event listener
  const sortBySelect = document.getElementById('sortBy');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', function() {
      const sortBy = this.value;
      const selectedStatus = document.getElementById('statusFilter').value;
      const searchTerm = document.getElementById('headlineSearch').value.trim();
      
      // Get currently displayed posts
      const currentPosts = Array.from(document.querySelectorAll('.pending-post-item')).map((item, index) => {
        const headline = item.querySelector('h4')?.textContent || '';
        const status = item.querySelector('.status-badge')?.textContent || '';
        const input = item.querySelector('.post-content p:first-child')?.textContent || '';
        const summary = item.querySelector('.post-content p:nth-child(2)')?.textContent || '';
        
        return {
          element: item,
          index: index,
          headline: headline,
          status: status,
          input: input,
          summary: summary
        };
      });
      
      // Filter and sort posts
      const filteredPosts = currentPosts.filter(post => {
        const matchesSearch = !searchTerm ||
          post.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.summary.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !selectedStatus ||
          post.status.toLowerCase().includes(selectedStatus.toLowerCase());
        
        return matchesSearch && matchesStatus;
      });
      
      // Sort the filtered posts
      const sortedPosts = sortPostsByData(filteredPosts, sortBy);
      
      // Reorder the DOM elements
      const postsGrid = document.querySelector('.pending-posts-grid');
      if (postsGrid) {
        sortedPosts.forEach(post => {
          postsGrid.appendChild(post.element);
        });
      }
    });
  }

  // Add search event listener
    const headlineSearch = document.getElementById('headlineSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (headlineSearch) {
      headlineSearch.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        const selectedStatus = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        
        // Show/hide clear button
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
        }
        
        // Apply search filter with smooth animations
        applySearchFilter(searchTerm, selectedStatus, sortBy);
      });
    }
  
    // Add clear search button event listener
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function() {
        const headlineSearch = document.getElementById('headlineSearch');
        if (headlineSearch) {
          headlineSearch.value = '';
          this.style.display = 'none';
          applySearchFilter('', document.getElementById('statusFilter').value, document.getElementById('sortBy').value);
        }
      });
    }

  // Add back to input button event listener
  const backToInputBtn = document.getElementById('backToInput');
  if (backToInputBtn) {
    backToInputBtn.addEventListener('click', function() {
      showStep(1);
      pendingPostsSection.style.display = 'none';
      initialForm.style.display = 'block';
      clearMessage('initialMessage');
    });
  }
}

// Sort posts by data (used for real-time sorting)
function sortPostsByData(posts, sortBy) {
  // For now, we'll simulate sorting by rearranging elements
  // In a real implementation, you would sort based on actual date fields
  const sortedPosts = [...posts];

  if (sortBy === 'latest') {
    // Reverse order for latest first
    return sortedPosts.reverse();
  }

  return sortedPosts; // oldest first (default)
}

// Sort posts array (used for initial loading)
function sortPosts(posts, sortBy) {
  const sortedPosts = [...posts];

  if (sortBy === 'latest') {
    // Reverse the array to show latest first
    // In a real implementation, sort by actual timestamp/date field
    return sortedPosts.reverse();
  }

  return sortedPosts; // oldest first (default)
}

// Apply search filter with smooth animations
function applySearchFilter(searchTerm, selectedStatus, sortBy) {
  const postsList = document.getElementById('pendingPostsList');
  const postsGrid = document.querySelector('.pending-posts-grid');
  const postItems = document.querySelectorAll('.pending-post-item');
  
  if (!postsList || !postsGrid) return;
  
  // Add transition class to grid
  postsGrid.classList.add('filtering');
  
  // Get all current posts and filter them
  const allPosts = Array.from(postItems).map((item, index) => {
    const headline = item.querySelector('h4')?.textContent || '';
    const statusBadge = item.querySelector('.status-badge')?.textContent || '';
    const input = item.querySelector('.post-content p:first-child')?.textContent || '';
    const summary = item.querySelector('.post-content p:nth-child(2)')?.textContent || '';
    
    return {
      element: item,
      index: index,
      headline: headline,
      status: statusBadge,
      input: input,
      summary: summary
    };
  });
  
  // Filter posts based on search term and status
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = !searchTerm ||
      post.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus ||
      post.status.toLowerCase().includes(selectedStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort the filtered posts
  const sortedPosts = sortPostsByData(filteredPosts, sortBy);
  
  // Create a set of matching post indices for quick lookup
  const matchingIndices = new Set(sortedPosts.map(post => post.index));
  
  // Animate filtered posts
  allPosts.forEach(post => {
    const isMatching = matchingIndices.has(post.index);
    const element = post.element;
    
    if (isMatching) {
      // Show matching posts
      element.classList.remove('filtering-out');
      element.classList.add('filtering-in');
      element.style.display = 'block';
    } else {
      // Hide non-matching posts with animation
      element.classList.remove('filtering-in');
      element.classList.add('filtering-out');
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        if (element.classList.contains('filtering-out')) {
          element.style.display = 'none';
        }
      }, 400); // Match the CSS transition duration
    }
  });
  
  // Update result count
  const currentFilter = selectedStatus ? ` with status "${selectedStatus}"` : ' with status "Waiting For Content"';
  const searchText = searchTerm ? ` matching "${searchTerm}"` : '';
  const sortText = sortBy === 'oldest' ? ' (oldest first)' : ' (latest first)';
  
  if (sortedPosts.length === 0) {
    postsList.innerHTML = `<p>No pending posts found${searchText}${currentFilter}.</p>`;
  } else {
    // Update the visible count by adding a subtle indicator
    const header = document.querySelector('#pendingPostsSection h3');
    if (header && (searchTerm || selectedStatus)) {
      const originalText = 'Pending Posts';
      const countText = ` (${sortedPosts.length} found${sortText})`;
      header.innerHTML = originalText + countText;
      
      // Reset header after 3 seconds
      setTimeout(() => {
        if (header) {
          header.innerHTML = originalText;
        }
      }, 3000);
    }
  }
  
  // Remove transition class after animation
  setTimeout(() => {
    postsGrid.classList.remove('filtering');
  }, 500);
}

// Display pending posts list
function displayPendingPosts(posts) {
  const postsList = document.getElementById('pendingPostsList');
  const loading = document.getElementById('pendingPostsLoading');

  if (loading) loading.style.display = 'none';
  if (postsList) postsList.style.display = 'block';

  const currentFilter = document.getElementById('statusFilter')?.value || '';
  const statusText = currentFilter ? ` with status "${currentFilter}"` : ' with status "Waiting For Content"';

  if (posts.length === 0) {
    postsList.innerHTML = `<p>No pending posts found${statusText}.</p>`;
    return;
  }

  let postsHTML = '<div class="pending-posts-grid">';
  posts.forEach((post, index) => {
    postsHTML += `
      <div class="pending-post-item" data-index="${index}">
        <div class="post-header">
          <h4>${post.sourceHeadline || 'No headline available'}</h4>
          <span class="status-badge">${post.Status || 'Unknown Status'}</span>
        </div>
        <div class="post-content">
          <p><strong>Input:</strong> ${post['Keyword Input'].toUpperCase() || 'N/A'}</p>
          <p><strong>Summary:</strong> ${post.sourceSummary ? post.sourceSummary.substring(0, 100) + '...' : 'N/A'}</p>
        </div>
        <button class="btn btn-small select-post-btn" data-index="${index}">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
            Select Post
          </span>
        </button>
      </div>
    `;
  });
  postsHTML += '</div>';

  postsList.innerHTML = postsHTML;

  // Add event listeners for select buttons
  document.querySelectorAll('.select-post-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      selectPendingPost(posts[index]);
    });
  });
}

// Social media selection - Button click handling
document.getElementById('socialOptions').addEventListener('click', function(e) {
  if (e.target.closest('.social-option-btn')) {
    const button = e.target.closest('.social-option-btn');
    const platform = button.getAttribute('data-platform');

    // Toggle selection
    if (button.classList.contains('selected')) {
      // Remove selection
      button.classList.remove('selected');
      selectedPlatforms = selectedPlatforms.filter(p => p !== platform);
    } else {
      // Add selection
      button.classList.add('selected');
      selectedPlatforms.push(platform);
    }
    console.log('Selected platforms:', selectedPlatforms);
  }
});

// Review submit button
reviewSubmit.addEventListener('click', async function() {
  if (selectedPlatforms.length === 0) {
    showToast('Please select at least one social media platform.', 'error');
    return;
  }

  clearMessage('step2Message');
  reviewSubmit.disabled = true;
  reviewSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Processing...</span>';

  try {
    // Update the sheet with selected platforms and include image
    const includeImage = document.getElementById('includeImage').checked;
    await updateSheetWithSelections(selectedPlatforms, includeImage);

    // Mark configuration as submitted and show Next button
    configurationSubmitted = true;
    nextToPreview.style.display = 'inline-block';

    showToast('Configuration saved successfully! Click "Next" to proceed to preview.', 'success');
    clearMessage('step2Message');
    reviewSubmit.disabled = false;
    reviewSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Submit Configuration</span>';
  } catch (error) {
    console.error('Error updating sheet:', error);
    showToast('Failed to save selections. Please try again.', 'error');
    clearMessage('step2Message');
    reviewSubmit.disabled = false;
    reviewSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Submit Configuration</span>';
  }
});

// Generate content preview
function generatePreview() {
  const includeImage = document.getElementById('includeImage').checked;
  let previewHTML = '';

  selectedPlatforms.forEach((platform, index) => {
    const platformContent = generatePlatformContent(platform, contentData);
    const charCount = platformContent.length;
    const truncatedContent = platformContent.length > 150 ? platformContent.substring(0, 150) + '...' : platformContent;
    const isExpanded = false; // Default collapsed state

    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="${isExpanded}" onclick="toggleContentPreview(${index})">
        <div class="content-preview-header">
          <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
          <span class="expand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <div class="content-preview-body">
          <div class="content-text ${isExpanded ? 'expanded' : 'collapsed'}">
            <strong>Content:</strong> <span class="content-display">${isExpanded ? platformContent : truncatedContent}</span>
          </div>
          <div class="content-meta">
            <p><small><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/></svg>Character count: ${charCount}</small></p>
            ${includeImage ? '<p><em><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/></svg>Image will be included</em></p>' : ''}
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('finalContent').innerHTML = previewHTML;
  previewLoading.style.display = 'none';
  previewContent.style.display = 'block';
}

// Generate skeleton loading preview for content generation
function generateSkeletonPreview() {
  const includeImage = document.getElementById('includeImage').checked;
  let previewHTML = '<h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Generating Content...</h3><p>Please wait while we create platform-specific content:</p>';

  selectedPlatforms.forEach((platform, index) => {
    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="false" onclick="toggleContentPreview(${index})">
        <div class="content-preview-header">
          <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
          <span class="expand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <div class="content-preview-body">
          <div class="content-text collapsed">
            <strong>Content:</strong>
            <div class="skeleton skeleton-text large"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
          <div class="content-meta">
            <p><small><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/></svg>Character count: <span class="skeleton skeleton-text small" style="display: inline-block; width: 30px;"></span></small></p>
            ${includeImage ? '<p><em><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/></svg>Image will be included</em></p>' : ''}
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('finalContent').innerHTML = previewHTML;
  previewLoading.style.display = 'none';
  previewContent.style.display = 'block';
}

// Get platform icon (using SVG icons for better quality)
function getPlatformIcon(platform) {
  const icons = {
    linkedin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
    </svg>`,
    twitter: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000000"/>
    </svg>`,
    instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#E4405F"/>
    </svg>`,
    facebook: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
    </svg>`,
    blog: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4CAF50"/>
    </svg>`
  };
  return icons[platform] || `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#666666"/>
  </svg>`;
}

// Convert URLs to ensure they have proper protocol for image display
function convertImageLink(url) {
  if (!url || typeof url !== 'string') return url;

  // If it's already an absolute URL starting with https://, return as-is
  if (url.startsWith('https://')) {
    return url;
  }

  // For relative URLs or other formats, ensure they start with https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // If it looks like a URL without protocol, add https://
    if (url.includes('dropbox.com') || url.includes('.')) {
      return `https://${url}`;
    }
  }

  // For all other URLs, return as-is
  return url;
}

// Get button icon (minimalist SVG icons for buttons)
function getButtonIcon(type) {
  const icons = {
    generate: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
    </svg>`,
    post: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
    </svg>`,
    back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
    </svg>`,
    next: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"/>
    </svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
    </svg>`
  };
  return icons[type] || '';
}

// Generate platform-specific content (mock implementation)
function generatePlatformContent(platform, data) {
  const baseContent = data.content || "Waiting for you to generate Content.";
  switch(platform) {
    case 'linkedin':
      return baseContent.substring(0, 3000) + (baseContent.length > 3000 ? '...' : '');
    case 'twitter':
      return baseContent.substring(0, 280) + (baseContent.length > 280 ? '...' : '');
    case 'instagram':
      return baseContent.substring(0, 2200) + (baseContent.length > 2200 ? '...' : '');
    case 'facebook':
      return baseContent;
    case 'blog':
      return baseContent; // No character limit for blog posts
    default:
      return baseContent;
  }
}

// Handle pending posts button click
seePendingPosts.addEventListener('click', async function() {
  // Hide initial form and show pending posts section
  initialForm.style.display = 'none';
  pendingPostsSection.style.display = 'block';
  
  // Close any existing toast notifications
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    closeToast(existingToast.querySelector('.toast-close'));
  }
  
  // Clear all messages when navigating to pending posts
  clearMessage('initialMessage');
  clearMessage('step2Message');
  clearMessage('step3Message');

  try {
    pendingPostsLoading.style.display = 'block';

    // Fetch unique statuses and pending posts simultaneously
    const [statuses, posts] = await Promise.all([
      fetchUniqueStatuses(),
      fetchPendingPosts()
    ]);

    pendingPosts = posts;
    displayPendingPostsSection(statuses, posts);
  } catch (error) {
    console.error('Error loading pending posts:', error);
    showMessage('initialMessage', 'Failed to load pending posts. Please try again.', 'error');
    // Show form again on error
    initialForm.style.display = 'block';
    pendingPostsSection.style.display = 'none';
  }
});

// Handle back to input button - moved to displayPendingPostsSection function

// Handle selecting a pending post
function selectPendingPost(post) {
  // Set selectedPost to the selected post data
  selectedPost = post;

  // Set content data from selected post
  contentData = {
    summary: post.sourceSummary || 'Summary not available',
    headline: post.sourceHeadline || 'Headline not available',
    content: post.twitterCopy || 'Content will be generated based on your input.'
  };

  //check if post has "Approved" status
  const Approvedpost= post.Status && post.Status.trim() === 'Approved';

  // Check if post has "Need Approval" status
  const needsApproval = post.Status && post.Status.trim() === 'Need Approval';

  if ( Approvedpost) {
    // Load pre-configured data for approved posts
    loadaApprovalPage(post);
  }else if( needsApproval){
    loadaApprovalPage(post);
  }
   else {
    // Normal flow for posts that need configuration
    resetConfigurationState();

    // Check if this post has pre-selected social channels
    const socialChannelValue = post.socialChannel || post.socialChannels || post.SocialChannel || '';
    const socialChannels = socialChannelValue ? socialChannelValue.split(',').map(s => s.trim().toLowerCase()) : [];

    if (socialChannels.length > 0) {
      // Update UI buttons to reflect pre-selected platforms
      document.querySelectorAll('#socialOptions .social-option-btn').forEach(btn => {
        const platform = btn.getAttribute('data-platform');
        const isSelected = socialChannels.includes(platform.toLowerCase());
        if (isSelected) {
          btn.classList.add('selected');
          selectedPlatforms.push(platform);
        } else {
          btn.classList.remove('selected');
        }
      });

      console.log('Pre-selected platforms for regular post:', socialChannels);
    }

    showStep(2);
    displayResults(contentData);
  }
}

// Load pre-configured post data and skip to Step 3
function loadaApprovalPage(post) {
  // Parse social channels from the socialChannel column
  // Try different possible column names
  const socialChannelValue = post.socialChannel || post.socialChannels || post.SocialChannel || '';
  const socialChannels = socialChannelValue ? socialChannelValue.split(',').map(s => s.trim().toLowerCase()) : [];
  selectedPlatforms = socialChannels;

  console.log('Social channel value from sheet:', socialChannelValue);
  console.log('Parsed social channels:', socialChannels);

  // Set image checkbox state from needsimage column
  const includeImage = post.needsimage && post.needsimage.trim().toLowerCase() === 'yes';

  // Update checkbox state
  const imageCheckbox = document.getElementById('includeImage');
  if (imageCheckbox) {
    imageCheckbox.checked = includeImage;
  }

  // Load platform-specific content
  contentData = {
    summary: post.sourceSummary || 'Summary not available',
    headline: post.sourceHeadline || 'Headline not available',
    content: post.twitterCopy || post.linkedinCopy || post.facebookCopy || post.instagramCopy || 'Content will be generated based on your input.',
    // Store platform-specific content
    twitterCopy: post.twitterCopy || '',
    linkedinCopy: post.linkedinCopy || '',
    facebookCopy: post.facebookCopy || '',
    instagramCopy: post.instagramCopy || '',
    blogCopy: post.blogCopy || '',
    // Store channel-specific image data
    twitterImage: post.twitterImageCopy || '',
    linkedinImage: post.linkedinImageCopy || '',
    facebookImage: post.facebookImageCopy || '',
    instagramImage: post.instagramImageCopy || '',
    blogImage: post.blogImageCopy || '',
  };

  // // Update UI buttons to reflect pre-selected platforms
  // document.querySelectorAll('#socialOptions .social-option-btn').forEach(btn => {
  //   const platform = btn.getAttribute('data-platform');
  //   const isSelected = selectedPlatforms.includes(platform.toLowerCase());
  //   if (isSelected) {
  //     btn.classList.add('selected');
  //   } else {
  //     btn.classList.remove('selected');
  //   }
  // });

  // Mark as configured and go directly to Step 3
  configurationSubmitted = true;
  showStep(3);

  // Debug: Log the post data to see what's available
  console.log('Need Approval Post Data:', post);
  console.log('Selected Platforms:', selectedPlatforms);
  console.log('Social Channel Column:', post.socialChannel);
  console.log('Social Channels Column:', post.socialChannels);
  console.log('SocialChannel Column:', post.SocialChannel);
  console.log('Platform Content Columns:');
  console.log('- twitterCopy:', post.twitterCopy);
  console.log('- linkedinCopy:', post.linkedinCopy);
  console.log('- instagramCopy:', post.instagramCopy);
  console.log('- facebookCopy:', post.facebookCopy);
  console.log('- blogCopy:', post.blogCopy);
  console.log('Image Column:');
  console.log('- postImage:', post.postImage);
  console.log('- PostImage:', post.PostImage);
  console.log('- postimage:', post.postimage);

  // Always show pre-configured preview - the content will be loaded from sheet columns
  generatePreConfiguredPreview();
}

function loadPreConfiguredPost(post){
  const socialChannelValue= post.socialChannels
  const socialchannels= socialChannelValue ? socialChannelValue.split(',').map(s=> s.trim().toLowerCase()): [];
  selectedPlatforms= socialchannels;

  console.log('socialchannels from sheet: ', socialchannels);
  console.log('parsed social channels: ', selectedPlatforms);

  const includeImage= post.needsImage && post.needsImage.trim().tolowerCase() ==="yes";

  const imageCheckbox= document.getElementById('includeImage');
  if(imageCheckbox){
    imageCheckbox.checked= includeImage;
  }

  //load platform specific content
  contentData={
    headline:post.sourceHeadline || 'source Headline not available',
    summary:post.sourceSummary || 'summary not available',
    content: post.twitterCopy || post.linkedinCopy ||post.instagramCopy ||post.facebookCopy ||post.blogCopy,
    //store platform specific content
    twitterCopy:post.twitterCopy || '',
    linkedinCopy:post.linkedinCopy || '',
    instagramCpoy:post.instagramCopy || '',
    facebookCopy:post.facebookCopy || '',
    blogCopy:post.blogCopy || '',

    //store channel specific image data
    twitterImageCopy:post.twitterImageCopy || '',
    instagramImageCopy: post.instagramImageCopy || '',
    linkedinImageCopy:post.linkedinImageCopy || '',
    facebookImageCopy: post.facebookImageCopy || '',
    blogImageCopy: post.blogImageCopy || ''
  }

  showStep(3);
  generatePreConfiguredPreview();
}

// Generate preview for pre-configured posts
function generatePreConfiguredPreview() {
  const includeImage = document.getElementById('includeImage')?.checked || false;
  let previewHTML = '<h3>✅ Ready to Post - Pre-Configured Content</h3><p>Review your pre-approved content for each selected platform:</p>';

  selectedPlatforms.forEach((platform, index) => {
    // Get platform-specific content from the selectedPost data (fresh from sheet)
    const columnName = getPlatformContentColumn(platform);
    let platformContent = selectedPost[columnName] || contentData[platform + 'Copy'] || contentData.content || 'Content not available';

    // Get platform-specific image from contentData
    const imageColumnName = getPlatformImageColumn(platform);
    const platformImage = contentData[imageColumnName] || '';

    // Debug logging for each platform
    console.log(`Platform: ${platform}, Column: ${columnName}, Content:`, platformContent);
    console.log(`Platform: ${platform}, Image Column: ${imageColumnName}, Image:`, platformImage);

    // Remove any default placeholder text
    if (platformContent === 'Content will be generated based on your input.') {
      platformContent = 'Waiting for content';
    }

    const charCount = platformContent.length;
    const truncatedContent = platformContent.length > 150 ? platformContent.substring(0, 150) + '...' : platformContent;
    const isExpanded = false;

    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="${isExpanded}">
        <div class="content-preview-header" onclick="toggleContentPreview(${index})">
          <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
          <div class="header-image-preview">
            ${platformImage && platformImage.trim() !== '' ? `
              <div class="image-loading-spinner-small" id="headerImageLoadingSpinner-${platform}">
                <div class="spinner-small"></div>
              </div>
              <img src="${convertImageLink(platformImage)}" alt="${platform.charAt(0).toUpperCase() + platform.slice(1)} Image" class="header-image-preview-img" style="display: none;" onload="handleHeaderImageLoad(this)" onerror="handleHeaderImageError(this)" onclick="openImageModal(this.src, this.alt); event.stopPropagation();">
            ` : `
              <div class="header-image-placeholder">
                <span class="placeholder-icon-small">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                  </svg>
                </span>
              </div>
            `}
          </div>
          <span class="expand-icon">${isExpanded ?
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>' :
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor"/></svg>'}
          </span>
        </div>
        <div class="content-preview-body">
          <div class="content-text ${isExpanded ? 'expanded' : 'collapsed'}">
            <strong>Content:</strong> <span class="content-display">${isExpanded ? platformContent : truncatedContent}</span>
          </div>
          <div class="content-meta">
            <p><small><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/></svg>Character count: ${charCount}</small></p>
            ${includeImage ? '<p><em><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/></svg>Image will be included</em></p>' : ''}
          </div>
        </div>
      </div>
    `;
  });

  document.getElementById('finalContent').innerHTML = previewHTML;
  previewLoading.style.display = 'none';
  previewContent.style.display = 'block';
}


// Reset configuration state helper
function resetConfigurationState() {
  configurationSubmitted = false;
  if (nextToPreview) nextToPreview.style.display = 'none';

  // Clear any previous selections
  selectedPlatforms = [];
  document.querySelectorAll('#socialOptions .social-option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
}


//Back button to the first page
backToPage1.addEventListener('click', function(){
  showStep(1);
  clearMessage('step2Message');
})

// Next button to preview step
nextToPreview.addEventListener('click', function() {
  if (configurationSubmitted) {
    showStep(3);
    // Show loading state first
    previewLoading.style.display = 'block';
    previewContent.style.display = 'none';
    clearMessage('step2Message');

    // Use the same preview function as pre-configured posts for consistency
    generatePreConfiguredPreview();
  }
});

// Back button event listener
backToPage2.addEventListener('click', function() {
  showStep(2);
  clearMessage('step3Message');

  // If this is a "Need Approval" post, display its content in step 2
  if (selectedPost && selectedPost.Status && selectedPost.Status.trim() === 'Need Approval') {
    displayResults({
      summary: selectedPost.sourceSummary || 'Summary not available',
      headline: selectedPost.sourceHeadline || 'Headline not available'
    });
  }
});

if (GeneratePlatformSpecificContent) {
    GeneratePlatformSpecificContent.addEventListener('click', async function(e) {
        e.preventDefault();

        GeneratePlatformSpecificContent.disabled = true;
        GeneratePlatformSpecificContent.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Generating...</span>';
        clearMessage('step3Message');

        // Show skeleton loading immediately
        generateSkeletonPreview();

        try {
            // We need to send the Source Headline (key to find the row) and the platforms/image config.
            // Since the updateSheetWithSelections function already updated the platforms/image config,
            // we only need to send the key (Source Headline) to the generate webhook
            // OR ensure the webhook looks up the most recently configured post.

            if (!selectedPost || !selectedPost.sourceHeadline) {
                throw new Error("No post selected or Source Headline missing.");
            }

            const generateData = {
                headline: selectedPost.sourceHeadline,
                action: 'generate_specific'
            };

            const response = await fetch(N8N_GENERATE_WEBHOOK_URL, {
                method: "POST", // CORRECT: Use POST since it triggers an action (content generation)
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generateData)
            });

            if (!response.ok) {
                throw new Error(`Failed to trigger generation: HTTP status ${response.status}`);
            }

            // Wait for generation to complete and fetch updated data
            await waitForContentGeneration();

            // Refresh the content data from sheets
            const updatedData = await fetchLatestDataFromSheets();
            const currentPost = updatedData.find(row =>
                row.sourceHeadline === selectedPost.sourceHeadline
            );

            if (currentPost) {
                // Update selectedPost with fresh data from sheets
                selectedPost = currentPost;

                // Update content data with newly generated content
                contentData = {
                    summary: currentPost.sourceSummary || contentData.summary,
                    headline: currentPost.sourceHeadline || contentData.headline,
                    content: currentPost.twitterCopy || currentPost.linkedinCopy || currentPost.facebookCopy || contentData.content,
                    // Store platform-specific content
                    twitterCopy: currentPost.twitterCopy || '',
                    linkedinCopy: currentPost.linkedinCopy || '',
                    facebookCopy: currentPost.facebookCopy || '',
                    instagramCopy: currentPost.instagramCopy || '',
                    blogCopy: currentPost.blogCopy || '',
                    // Store image data
                    postImage: currentPost.postImage || contentData.postImage || ''
                };

                // Show the actual generated content using the same function as pre-configured posts
                generatePreConfiguredPreview();
                showMessage('step3Message', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Platform-specific content generated successfully!', 'success');
            } else {
                throw new Error('Could not find updated post data after generation.');
            }

        } catch (error) {
            console.error('Error triggering specific content generation:', error);
            showMessage('step3Message', `Error triggering generation: ${error.message}.`, 'error');
            // Revert to original preview on error
            generatePreview();
        } finally {
            GeneratePlatformSpecificContent.disabled = false;
            GeneratePlatformSpecificContent.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>Generate Platform-Specific Content</span>';
        }
    });
}

// Wait for content generation to complete
async function waitForContentGeneration() {
    const maxAttempts = 10;
    const delay = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const latestData = await fetchLatestDataFromSheets();
            const currentPost = latestData.find(row =>
                row.sourceHeadline === selectedPost.sourceHeadline
            );

            // Check if any platform-specific content has been generated
            if (currentPost && (
                (currentPost.twitterCopy && currentPost.twitterCopy !== 'Content will be generated based on your input.') ||
                (currentPost.linkedinCopy && currentPost.linkedinCopy !== 'Content will be generated based on your input.') ||
                (currentPost.facebookCopy && currentPost.facebookCopy !== 'Content will be generated based on your input.') ||
                (currentPost.instagramCopy && currentPost.instagramCopy !== 'Content will be generated based on your input.')
            )) {
                console.log(`Content generation completed on attempt ${attempt}`);
                return currentPost;
            }

            console.log(`Waiting for content generation... attempt ${attempt}/${maxAttempts}`);
        } catch (error) {
            console.warn(`Content generation check attempt ${attempt} failed:`, error);
        }

        if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.warn('Content generation check timed out, proceeding with available data');
}

// Toggle content preview expansion with modal popup
function toggleContentPreview(cardIndex) {
  const cards = document.querySelectorAll('.content-preview-card');
  const card = cards[cardIndex];
  if (!card) return;

  const platform = card.getAttribute('data-platform');

  // Get platform-specific content from selectedPost for pre-configured posts
  const columnName = getPlatformContentColumn(platform);
  let platformContent = selectedPost[columnName] || contentData.content || 'Content not available';

  // Remove any default placeholder text
  if (platformContent === 'Content will be generated based on your input.') {
    platformContent = 'Content not available';
  }

  // Get platform-specific image for the modal
  const imageColumnName = getPlatformImageColumn(platform);
  const platformImage = contentData[imageColumnName] || '';

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'content-modal-overlay';
  modal.innerHTML = `
    <div class="content-modal">
      <div class="content-modal-header">
        <h3>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)} Content</h3>
        <button class="modal-close-btn" onclick="closeContentModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div class="content-modal-body">
        ${platformImage && platformImage.trim() !== '' ? `
          <div class="modal-image-preview">
            <div class="image-loading-spinner" id="modalImageLoadingSpinner-${platform}">
              <div class="spinner"></div>
              <p>Loading image...</p>
            </div>
            <img src="${convertImageLink(platformImage)}" alt="${platform.charAt(0).toUpperCase() + platform.slice(1)} Image" class="modal-post-image" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: none; cursor: zoom-in;" onload="handleModalImageLoad(this)" onerror="handleModalImageError(this)" onclick="openImageModal(this.src, this.alt)">
          </div>
        ` : `
          <div class="modal-image-placeholder">
            <div class="placeholder-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
              </svg>
            </div>
            <div class="placeholder-text">Image not available</div>
          </div>
        `}
        <div class="content-text-full">
          ${platformContent}
        </div>
        <div class="content-modal-meta">
          <p><small><svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px; vertical-align: middle;"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill="currentColor"/></svg>Character count: ${platformContent.length}</small></p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add fade-in animation
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);

  // Close modal when clicking overlay
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeContentModal();
    }
  });

  // Prevent scroll propagation to background
  modal.addEventListener('wheel', function(e) {
    e.stopPropagation();
  });

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeContentModal();
    }
  });
}

// Close content modal
function closeContentModal() {
  const modal = document.querySelector('.content-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Get platform content column name
function getPlatformContentColumn(platform) {
  const columnMap = {
    'twitter': 'twitterCopy',
    'linkedin': 'linkedinCopy',
    'facebook': 'facebookCopy',
    'instagram': 'instagramCopy',
    'blog': 'blogCopy'
  };
  return columnMap[platform.toLowerCase()] || 'twitterCopy';
}

// Get platform image column name
function getPlatformImageColumn(platform) {
  const columnMap = {
    'twitter': 'twitterImage',
    'linkedin': 'linkedinImage',
    'facebook': 'facebookImage',
    'instagram': 'instagramImage',
    'blog': 'blogImage'
  };
  return columnMap[platform.toLowerCase()] || 'twitterImage';
}

// Show generate button when no platform content exists
function showGenerateButton() {
  const previewHTML = `
    <h3>⚡ Content Generation Required</h3>
    <p>This post has been pre-approved but needs platform-specific content generation.</p>
    <div class="btn-group">
      <button id="generateSpecificContent" class="btn">
        <span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>
          </svg>
          Generate Platform-Specific Content
        </span>
      </button>
    </div>
  `;

  document.getElementById('finalContent').innerHTML = previewHTML;
  previewLoading.style.display = 'none';
  previewContent.style.display = 'block';

  // Add event listener for generate button
  const generateBtn = document.getElementById('generateSpecificContent');
  if (generateBtn) {
    generateBtn.addEventListener('click', async function() {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Generating...</span>';

      try {
        // Generate platform-specific content
        await generatePlatformSpecificContent();
        // Show the generated content
        generatePreConfiguredPreview();
      } catch (error) {
        console.error('Error generating content:', error);
        showMessage('step3Message', 'Failed to generate content. Please try again.', 'error');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>Generate Platform-Specific Content</span>';
      }
    });
  }
}

// Generate platform-specific content for approved posts
async function generatePlatformSpecificContent() {
  if (!selectedPost || !selectedPost.sourceHeadline) {
    throw new Error("No post selected or Source Headline missing.");
  }

  const generateData = {
    headline: selectedPost.sourceHeadline,
    action: 'generate_specific'
  };

  const response = await fetch(N8N_GENERATE_WEBHOOK_URL, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateData)
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger generation: HTTP status ${response.status}`);
  }

  // Wait for generation to complete and fetch updated data
  await waitForContentGeneration();

  // Refresh the content data from sheets
  const updatedData = await fetchLatestDataFromSheets();
  const currentPost = updatedData.find(row =>
    row.sourceHeadline === selectedPost.sourceHeadline
  );

  if (currentPost) {
    // Update selectedPost with fresh data from sheets
    selectedPost = currentPost;

    // Update content data with newly generated content
    contentData = {
      summary: currentPost.sourceSummary || contentData.summary,
      headline: currentPost.sourceHeadline || contentData.headline,
      content: currentPost.twitterCopy || currentPost.linkedinCopy || currentPost.facebookCopy || contentData.content,
      // Store platform-specific content
      twitterCopy: currentPost.twitterCopy || '',
      linkedinCopy: currentPost.linkedinCopy || '',
      facebookCopy: currentPost.facebookCopy || '',
      instagramCopy: currentPost.instagramCopy || '',
      blogCopy: currentPost.blogCopy || '',
      // Store image data
      postImage: currentPost.postImage || contentData.postImage || ''
    };

    // Show the generated content using the same function as pre-configured posts
    generatePreConfiguredPreview();
  } else {
    throw new Error('Could not find updated post data after generation.');
  }
}

// Handle image loading success
function handleImageLoad(imgElement) {
  console.log('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Image loaded successfully!');
  // Hide loading spinner and show image
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
  imgElement.style.display = 'block';

  // Add click event to expand image
  imgElement.style.cursor = 'zoom-in';
  imgElement.addEventListener('click', function() {
    openImageModal(imgElement.src, imgElement.alt);
  });
}

// Handle header image loading success
function handleHeaderImageLoad(imgElement) {
  console.log('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Header image loaded successfully!');
  // Hide loading spinner and show image
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner-small');
  if (spinner) {
    spinner.style.display = 'none';
  }
  imgElement.style.display = 'block';
}

// Handle header image loading errors
function handleHeaderImageError(imgElement) {
  console.error('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>Header image failed to load');
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner-small');
  if (spinner) {
    spinner.innerHTML = '<div style="color: #d63031; font-size: 12px; text-align: center;">⚠️</div>';
  }
  imgElement.style.display = 'none';
}

// Handle modal image loading success
function handleModalImageLoad(imgElement) {
  console.log('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>Modal image loaded successfully!');
  // Hide loading spinner and show image
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner');
  if (spinner) {
    spinner.style.display = 'none';
  }
  imgElement.style.display = 'block';
}

// Handle modal image loading errors
function handleModalImageError(imgElement) {
  console.error('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>Modal image failed to load');
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner');
  if (spinner) {
    spinner.innerHTML = '<div style="color: #d63031; text-align: center;"><div>⚠️</div><div>Image could not be loaded</div><small>Check if the file is publicly accessible</small></div>';
  }
  imgElement.style.display = 'none';
}

// Handle image loading errors
function handleImageError(imgElement) {
  console.error('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>Image failed to load');
  const container = imgElement.parentNode;
  const spinner = container.querySelector('.image-loading-spinner');
  if (spinner) {
    spinner.innerHTML = '<div style="color: #d63031; text-align: center;"><div>⚠️</div><div>Image could not be loaded</div><small>Check if the file is publicly accessible</small></div>';
  }
  imgElement.style.display = 'none';
}

// Open image modal for expanded view
function openImageModal(imageSrc, altText) {
  const modal = document.createElement('div');
  modal.className = 'image-modal-overlay';
  modal.innerHTML = `
    <div class="image-modal">
      <button class="image-modal-close" onclick="closeImageModal()">×</button>
      <img src="${imageSrc}" alt="${altText}" onload="this.style.display='block'">
    </div>
  `;

  document.body.appendChild(modal);

  // Add fade-in animation
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);

  // Close modal when clicking overlay
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeImageModal();
    }
  });

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeImageModal();
    }
  });
}

// Close image modal
function closeImageModal() {
  const modal = document.querySelector('.image-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Make functions globally available
window.toggleContentPreview = toggleContentPreview;
window.closeContentModal = closeContentModal;
window.handleImageLoad = handleImageLoad;
window.handleImageError = handleImageError;
window.handleHeaderImageLoad = handleHeaderImageLoad;
window.handleHeaderImageError = handleHeaderImageError;
window.handleModalImageLoad = handleModalImageLoad;
window.handleModalImageError = handleModalImageError;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;

// Final submit
finalSubmit.addEventListener('click', async function() {
  finalSubmit.disabled = true;
  finalSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Posting...</span>';
  clearMessage('step3Message');

  try {
    // Ensure we have content data before proceeding
    if (!contentData || !contentData.content || contentData.content === 'Content will be generated based on your input.') {
      throw new Error('Content not available. Please generate platform-specific content first.');
    }

    // Send posting data to n8n webhook
    const postData = {
      platforms: selectedPlatforms,
      content: contentData,
      includeImage: document.getElementById('includeImage').checked,
      source: 'web_interface',
      topic: contentData.input,
      description: contentData.description,
      postStyle: contentData.postStyle
    };

    const response = await fetch(N8N_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    showMessage('step3Message', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>Content posted successfully to selected platforms!', 'success');

    // Reset form after successful post
    setTimeout(() => {
      location.reload();
    }, 3000);

  } catch (error) {
    console.error('Error posting:', error);
    showMessage('step3Message', `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px;"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>Error: ${error.message || 'Failed to post content. Please try again.'}`);
  } finally {
    finalSubmit.disabled = false;
    finalSubmit.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/></svg>Post to Selected Platforms</span>';
  }
});