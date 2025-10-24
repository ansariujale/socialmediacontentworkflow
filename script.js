// Constants - Replace with your n8n webhook URL
const N8N_WORKFLOW_URL = "https://ansariujale.app.n8n.cloud/webhook-test/47ea1222-5f01-4089-a26e-4c46f17e3985";

// Google Sheets CSV export URL for direct access (social posts sheet)
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0ggy_qYLwzAc2f3iMvQ0gpuUZ8MCf5YsDGbydGaMYCneKXmGoAhtcCvBAPeHA_SljFd0pwKGd0lwq/pub?output=csv";

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const initialForm = document.getElementById('initialForm');
const initialSubmit = document.getElementById('initialSubmit');
const reviewSubmit = document.getElementById('reviewSubmit');
const finalSubmit = document.getElementById('finalSubmit');
const resultsLoading = document.getElementById('resultsLoading');
const resultsContent = document.getElementById('resultsContent');
const previewLoading = document.getElementById('previewLoading');
const previewContent = document.getElementById('previewContent');

let contentData = null;
let selectedPlatforms = [];

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
      headline1: data.headline1,
      headline2: data.headline2,
      headline3: data.headline3,
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

// Update social channel and needs image in Google Sheets via n8n
async function updateSheetWithSelections(headline, platforms, includeImage) {
  try {
    const updateData = {
      headline: headline,
      socialChannel: platforms.join(','),
      needsimage: includeImage ? 'Yes' : 'No',
      action: 'update'
    };

    const response = await fetch(N8N_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      console.warn('Failed to update data in sheets:', response.status);
    } else {
      console.log('Successfully updated sheet with selections');
    }
  } catch (error) {
    console.warn('Error updating data in sheets:', error);
  }
}

// Wait for data to be stored in sheets by polling Google Sheets directly
async function waitForDataStorage(input) {
  const maxAttempts = 15;
  const delay = 3000; // 3 seconds

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const latestData = await fetchLatestDataFromSheets();

      // Check if we have a new row with actual content in sourceHeadline and sourceSummary
      // Get the most recent row (last in the array)
      const mostRecentRow = latestData[latestData.length - 1];

      if (mostRecentRow && mostRecentRow.sourceHeadline && mostRecentRow.sourceHeadline.trim() !== '' &&
          mostRecentRow.sourceSummary && mostRecentRow.sourceSummary.trim() !== '') {
        console.log(`Data with content found in sheets on attempt ${attempt}:`, mostRecentRow);
        return mostRecentRow; // Return the most recent row with content
      }

      console.log(`Attempt ${attempt}: Data not yet available in sheets`);
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

// Fetch latest data directly from Google Sheets CSV
async function fetchLatestDataFromSheets() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n').filter(row => row.trim());

    if (rows.length < 2) {
      return []; // No data rows
    }

    // Parse CSV properly handling quoted fields with commas
    const headers = rows[0].split(',').map(h => h.replace(/"/g, '').trim());
    const dataRows = rows.slice(1);

    // Convert to objects with proper CSV parsing
    const parsedData = dataRows.map(row => {
      // Simple CSV parser that handles quoted fields
      const values = parseCSVRow(row);
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    // Sort by a more reliable field - let's use the row index or ID if available
    // For now, assume the last row in the CSV is the most recent
    // parsedData.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    // Keep the original order from CSV (most recent should be last)

    return parsedData;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

// Fetch latest data from Google Sheets (fallback to n8n if direct access fails)
async function fetchLatestData() {
  try {
    // Try direct Google Sheets access first
    return await fetchLatestDataFromSheets();
  } catch (error) {
    console.warn('Direct Google Sheets access failed, trying n8n fallback:', error);

    // Fallback to n8n endpoint
    try {
      const response = await fetch(N8N_WORKFLOW_URL.replace('/webhook', '/get-latest'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (n8nError) {
      console.error('Both Google Sheets and n8n access failed:', n8nError);
      throw n8nError;
    }
  }
}

// Step 1: Initial form submission
initialForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const input = document.getElementById('userInput').value.trim();

  if (!input) {
    showMessage('initialMessage', 'Please enter a keyword, URL, or text prompt.');
    return;
  }

  initialSubmit.disabled = true;
  initialSubmit.innerHTML = '<span>⏳ Generating...</span>';
  clearMessage('initialMessage');

  try {
    // Show loading state immediately
    resultsLoading.style.display = 'block';
    resultsContent.style.display = 'none';
    showMessage('initialMessage', 'Sending to workflow and waiting for processing...', 'info');

    // Send input to n8n webhook
    const response = await fetch(N8N_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: input,
        source: 'web_interface'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Don't wait for response body, just acknowledge the request was sent
    showMessage('initialMessage', 'Request sent to workflow. Waiting for data to be stored...', 'info');

    // Wait for the workflow to execute and store data in sheets
    const storedData = await waitForDataStorage(input);

    // Clear the waiting message and show loading on step 2
    clearMessage('initialMessage');
    showStep(2); // Move to step 2 immediately to show loading state

    // Keep showing loading state on step 2 until data is ready
    resultsLoading.style.display = 'block';
    resultsContent.style.display = 'none';

    if (storedData) {
      // Use the data that was found during polling
      console.log('Using stored data from polling:', storedData);

      console.log('Raw stored data:', storedData);
      console.log('sourceSummary field:', storedData.sourceSummary);
      console.log('sourceHeadline field:', storedData.sourceHeadline);
      console.log('sourceSummary length:', storedData.sourceSummary ? storedData.sourceSummary.length : 0);
      console.log('Full sourceSummary content:', JSON.stringify(storedData.sourceSummary));

      // Check if data is being truncated during CSV parsing
      console.log('Raw CSV row data:', storedData);
      console.log('All fields in row:', Object.keys(storedData));
      console.log('Complete sourceSummary value:', storedData['sourceSummary']);

      // Use data directly from the dedicated columns
      contentData = {
        summary: storedData.sourceSummary || 'Summary not available',
        headline: storedData.sourceHeadline || 'Headline not available',
        content: storedData.twitterCopy || 'Content will be generated based on your input.'
      };

      console.log('Final content data to display:', contentData);

      displayResults(contentData);
    } else {
      // If no data from polling, get the most recent from sheets
      const latestData = await fetchLatestDataFromSheets();
      if (latestData && latestData.length > 0) {
        // Get the last row (most recently added)
        const mostRecentData = latestData[latestData.length - 1];
        console.log('Using most recent data from sheets:', mostRecentData);

        contentData = {
          summary: mostRecentData.sourceSummary || 'Summary not available',
          headline: mostRecentData.sourceHeadline || 'Headline not available',
          content: mostRecentData.twitterCopy || 'Content will be generated based on your input.'
        };

        displayResults(contentData);
      } else {
        showMessage('initialMessage', 'Data processed but not found in database. Please try again.', 'error');
      }
    }

  } catch (error) {
    console.error('Error:', error);
    showMessage('initialMessage', `Error: ${error.message || 'Failed to generate content. Please try again.'}`);
  } finally {
    initialSubmit.disabled = false;
    initialSubmit.innerHTML = '<span>🚀 Generate Content</span>';
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

// Social media selection
document.getElementById('socialOptions').addEventListener('change', function(e) {
  if (e.target.type === 'checkbox') {
    const option = e.target.closest('.social-option');
    if (e.target.checked) {
      option.classList.add('selected');
      selectedPlatforms.push(e.target.value);
    } else {
      option.classList.remove('selected');
      selectedPlatforms = selectedPlatforms.filter(p => p !== e.target.value);
    }
  }
});

// Review submit button
reviewSubmit.addEventListener('click', async function() {
  if (selectedPlatforms.length === 0) {
    showMessage('step2Message', 'Please select at least one social media platform.');
    return;
  }

  clearMessage('step2Message');
  reviewSubmit.disabled = true;
  reviewSubmit.innerHTML = '<span>⏳ Processing...</span>';

  try {
    // Update the sheet with selected platforms and include image
    const includeImage = document.getElementById('includeImage').checked;
    await updateSheetWithSelections(contentData.headline, selectedPlatforms, includeImage);

    // Move to preview step
    setTimeout(() => {
      showStep(3);
      generatePreview();
      reviewSubmit.disabled = false;
      reviewSubmit.innerHTML = '<span>✅ Submit Configuration</span>';
    }, 1000);
  } catch (error) {
    console.error('Error updating sheet:', error);
    showMessage('step2Message', 'Failed to save selections. Please try again.', 'error');
    reviewSubmit.disabled = false;
    reviewSubmit.innerHTML = '<span>✅ Submit Configuration</span>';
  }
});

// Generate content preview
function generatePreview() {
  const includeImage = document.getElementById('includeImage').checked;
  let previewHTML = '<h3>🚀 Ready to Post - Final Preview</h3><p>Review your content for each selected platform:</p>';

  selectedPlatforms.forEach(platform => {
    const platformContent = generatePlatformContent(platform, contentData);
    const charCount = platformContent.length;

    previewHTML += `
      <div class="content-preview">
        <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
        <p><strong>Content:</strong> ${platformContent}</p>
        <p><small>📊 Character count: ${charCount}</small></p>
        ${includeImage ? '<p><em>📷 Image will be included</em></p>' : ''}
      </div>
    `;
  });

  document.getElementById('finalContent').innerHTML = previewHTML;
  previewLoading.style.display = 'none';
  previewContent.style.display = 'block';
}

// Get platform icon
function getPlatformIcon(platform) {
  const icons = {
    linkedin: '💼',
    twitter: '🐦',
    instagram: '📷',
    facebook: '📘',
    blog: '📝'
  };
  return icons[platform] || '📱';
}

// Generate platform-specific content (mock implementation)
function generatePlatformContent(platform, data) {
  const baseContent = data.content || "Generated content based on your input will appear here.";
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

// Final submit
finalSubmit.addEventListener('click', async function() {
  finalSubmit.disabled = true;
  finalSubmit.innerHTML = '<span>⏳ Posting...</span>';
  clearMessage('step3Message');

  try {
    // Send posting data to n8n webhook
    const postData = {
      platforms: selectedPlatforms,
      content: contentData,
      includeImage: document.getElementById('includeImage').checked,
      source: 'web_interface'
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

    showMessage('step3Message', '🎉 Content posted successfully to selected platforms!', 'success');

    // Reset form after successful post
    setTimeout(() => {
      location.reload();
    }, 3000);

  } catch (error) {
    console.error('Error posting:', error);
    showMessage('step3Message', `❌ Error: ${error.message || 'Failed to post content. Please try again.'}`);
  } finally {
    finalSubmit.disabled = false;
    finalSubmit.innerHTML = '<span>📤 Post to Selected Platforms</span>';
  }
});