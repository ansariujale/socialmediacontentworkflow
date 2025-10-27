// Constants
const N8N_WORKFLOW_URL = "https://ansariujale.app.n8n.cloud/webhook-test/47ea1222-5f01-4089-a26e-4c46f17e3985";
const N8N_UPDATE_WEBHOOK_URL = "https://ansariujale.app.n8n.cloud/webhook-test/fdd90d42-37bb-48e3-a7df-169574e28578";
const N8N_GENERATE_WEBHOOK_URL= "https://ansariujale.app.n8n.cloud/webhook-test/aab70e42-31ee-4017-834c-00aa8b436bbc"
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

let contentData = null;
let selectedPlatforms = [];
let pendingPosts = [];
let selectedPost = null;
let configurationSubmitted = false;


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




// Wait for data to be stored in sheets by polling Google Sheets directly
async function waitForDataStorage(input) {
  const maxAttempts = 15;
  const delay = 5000; // 3 seconds

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

    // Parse CSV properly handling multiline fields
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return []; // No data rows
    }

    // First row is headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Convert to objects
    const parsedData = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
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
    if (statusFilter) {
      filteredPosts = allData.filter(row => {
        const status = row.Status;
        return status && status.trim() === statusFilter;
      });
    } else {
      // Default behavior - show "Waiting for Content"
      filteredPosts = allData.filter(row => {
        const status = row.Status;
        return status && status.trim() === 'Waiting for Content';
      });
    }

    console.log('Filtered posts count:', filteredPosts.length);
    console.log('Filtered posts:', filteredPosts.map(p => ({ headline: p.sourceHeadline, status: p.Status })));
    return filteredPosts;
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    throw error;
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


      // Set selectedPost to the stored data row
      selectedPost = storedData;

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

// Display pending posts section with filter
function displayPendingPostsSection(statuses, posts) {
  pendingPostsLoading.style.display = 'none';

  // Create filter section
  const filterHTML = `
    <div class="status-filter-section">
      <h4>🔍 Filter by Status</h4>
      <select id="statusFilter" class="status-filter-dropdown">
        <option value="">All Statuses</option>
        ${statuses.map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>
    </div>
  `;

  // Update the pending posts section structure
  const sectionContent = document.querySelector('#pendingPostsSection .section-content');
  if (!sectionContent) {
    // If no section content wrapper, create one
    const originalContent = pendingPostsSection.innerHTML;
    pendingPostsSection.innerHTML = `
      <h3>📋 Pending Posts</h3>
      <p>Select a post to continue:</p>
      ${filterHTML}
      <div id="pendingPostsList" class="pending-posts-list">
        <div class="loading" id="pendingPostsLoading">
          <div class="spinner"></div>
          <p>Loading pending posts...</p>
        </div>
      </div>
      <div class="btn-group">
        <button id="backToInput" class="btn btn-secondary">
          <span>⬅ Back to Input</span>
        </button>
      </div>
    `;
  } else {
    // Insert filter before the posts list
    const postsList = document.getElementById('pendingPostsList');
    postsList.insertAdjacentHTML('beforebegin', filterHTML);
  }

  // Display posts
  displayPendingPosts(posts);

  // Add filter event listener
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', async function() {
      const selectedStatus = this.value;
      try {
        const loadingElement = document.getElementById('pendingPostsLoading');
        const postsListElement = document.getElementById('pendingPostsList');

        if (loadingElement) loadingElement.style.display = 'block';
        if (postsListElement) postsListElement.style.display = 'none';

        const filteredPosts = await fetchPendingPosts(selectedStatus || null);
        displayPendingPosts(filteredPosts);
      } catch (error) {
        console.error('Error filtering posts:', error);
        showMessage('initialMessage', 'Failed to filter posts. Please try again.', 'error');
      }
    });
  }
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
          <p><strong>Input:</strong> ${post.input || 'N/A'}</p>
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
    await updateSheetWithSelections(selectedPlatforms, includeImage);

    // Mark configuration as submitted and show Next button
    configurationSubmitted = true;
    nextToPreview.style.display = 'inline-block';

    showMessage('step2Message', 'Configuration saved successfully! Click "Next" to proceed to preview.', 'success');
    reviewSubmit.disabled = false;
    reviewSubmit.innerHTML = '<span>✅ Submit Configuration</span>';
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

  selectedPlatforms.forEach((platform, index) => {
    const platformContent = generatePlatformContent(platform, contentData);
    const charCount = platformContent.length;
    const truncatedContent = platformContent.length > 150 ? platformContent.substring(0, 150) + '...' : platformContent;
    const isExpanded = false; // Default collapsed state

    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="${isExpanded}">
        <div class="content-preview-header" onclick="toggleContentPreview(${index})">
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
            <p><small>📊 Character count: ${charCount}</small></p>
            ${includeImage ? '<p><em>📷 Image will be included</em></p>' : ''}
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
  let previewHTML = '<h3>🚀 Ready to Post - Final Preview</h3><p>Review your content for each selected platform:</p>';

  selectedPlatforms.forEach((platform, index) => {
    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="false">
        <div class="content-preview-header">
          <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
          <span class="expand-icon">⏳</span>
        </div>
        <div class="content-preview-body">
          <div class="content-text collapsed">
            <strong>Content:</strong>
            <div class="skeleton skeleton-text large"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
          <div class="content-meta">
            <p><small>📊 Character count: <span class="skeleton skeleton-text small" style="display: inline-block; width: 30px;"></span></small></p>
            ${includeImage ? '<p><em>📷 Image will be included</em></p>' : ''}
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

// Convert Google Drive sharing link to direct view link
function convertGoogleDriveLink(url) {
  if (!url || typeof url !== 'string') return url;

  // Check if it's a Google Drive sharing link
  const driveMatch = url.match(/https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    // Use the direct download link which works for publicly shared files
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

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
  clearMessage('initialMessage');

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

// Handle back to input button
backToInput.addEventListener('click', function() {
  pendingPostsSection.style.display = 'none';
  initialForm.style.display = 'block';
  clearMessage('initialMessage');
});

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

  // Check if post has "Need Approval" status
  const needsApproval = post.Status && post.Status.trim() === 'Need Approval';

  if (needsApproval) {
    // Load pre-configured data for approved posts
    loadPreConfiguredPost(post);
  } else {
    // Normal flow for posts that need configuration
    resetConfigurationState();
    showStep(2);
    displayResults(contentData);
  }
}

// Load pre-configured post data and skip to Step 3
function loadPreConfiguredPost(post) {
  // Parse social channels from the socialChannel column
  // Try different possible column names
  const socialChannelValue = post.socialChannel || post.socialChannels || post.SocialChannel || '';
  const socialChannels = socialChannelValue ? socialChannelValue.split(',').map(s => s.trim().toLowerCase()) : [];
  selectedPlatforms = socialChannels;

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
    // Store image data - try different possible column names
    postImage: post.postImage || '',
  };

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

// Generate preview for pre-configured posts
function generatePreConfiguredPreview() {
  const includeImage = document.getElementById('includeImage')?.checked || false;
  let previewHTML = '<h3>🚀 Ready to Post - Pre-Configured Content</h3><p>Review your pre-approved content for each selected platform:</p>';

  // Add image section if post has an image
  if (contentData.postImage && contentData.postImage.trim() !== '') {
    previewHTML += `
      <div class="image-preview-section">
        <h4>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px; vertical-align: middle;">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#2196F3"/>
          </svg>
          Post Image
        </h4>
        <div class="image-preview-container">
          <img src="${convertGoogleDriveLink(contentData.postImage)}" alt="Post Image" class="post-image-preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" onload="console.log('✅ Image loaded successfully!')" onerror="handleImageError(this)">
        </div>
      </div>
    `;
  }

  selectedPlatforms.forEach((platform, index) => {
    // Get platform-specific content from the selectedPost data (fresh from sheet)
    const columnName = getPlatformContentColumn(platform);
    let platformContent = selectedPost[columnName] || contentData.content || 'Content not available';

    // Debug logging for each platform
    console.log(`Platform: ${platform}, Column: ${columnName}, Content:`, platformContent);

    // Remove any default placeholder text
    if (platformContent === 'Content will be generated based on your input.') {
      platformContent = 'Content not available';
    }

    const charCount = platformContent.length;
    const truncatedContent = platformContent.length > 150 ? platformContent.substring(0, 150) + '...' : platformContent;
    const isExpanded = false;

    previewHTML += `
      <div class="content-preview-card" data-platform="${platform}" data-expanded="${isExpanded}">
        <div class="content-preview-header" onclick="toggleContentPreview(${index})">
          <h4>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
          <span class="expand-icon">${isExpanded ? '🔽' : '▶️'}</span>
        </div>
        <div class="content-preview-body">
          <div class="content-text ${isExpanded ? 'expanded' : 'collapsed'}">
            <strong>Content:</strong> <span class="content-display">${isExpanded ? platformContent : truncatedContent}</span>
          </div>
          <div class="content-meta">
            <p><small>📊 Character count: ${charCount}</small></p>
            ${includeImage ? '<p><em>📷 Image will be included</em></p>' : ''}
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
  document.querySelectorAll('#socialOptions input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.social-option').classList.remove('selected');
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
    generatePreview();
    clearMessage('step2Message');
  }
});

// Back button event listener
backToPage2.addEventListener('click', function() {
  showStep(2);
  clearMessage('step3Message');
});

if (GeneratePlatformSpecificContent) {
    GeneratePlatformSpecificContent.addEventListener('click', async function(e) {
        e.preventDefault();

        GeneratePlatformSpecificContent.disabled = true;
        GeneratePlatformSpecificContent.innerHTML = '<span>⏳ Generating...</span>';
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
                // Update content data with newly generated content
                contentData = {
                    summary: currentPost.sourceSummary || contentData.summary,
                    headline: currentPost.sourceHeadline || contentData.headline,
                    content: currentPost.twitterCopy || currentPost.linkedinCopy || currentPost.facebookCopy || contentData.content
                };

                // Show the actual generated content
                generatePreview();
                showMessage('step3Message', '✅ Platform-specific content generated successfully!', 'success');
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
            GeneratePlatformSpecificContent.innerHTML = '<span>✍️ Generate Platform-Specific Content</span>';
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

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'content-modal-overlay';
  modal.innerHTML = `
    <div class="content-modal">
      <div class="content-modal-header">
        <h3>${getPlatformIcon(platform)} ${platform.charAt(0).toUpperCase() + platform.slice(1)} Content</h3>
        <button class="modal-close-btn" onclick="closeContentModal()">✕</button>
      </div>
      <div class="content-modal-body">
        <div class="content-text-full">
          ${platformContent}
        </div>
        <div class="content-modal-meta">
          <p><small>📊 Character count: ${platformContent.length}</small></p>
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

// Show generate button when no platform content exists
function showGenerateButton() {
  const previewHTML = `
    <h3>🚀 Ready to Post - Content Generation Required</h3>
    <p>This post has been pre-approved but needs platform-specific content generation.</p>
    <div class="btn-group">
      <button id="generateSpecificContent" class="btn">
        <span>✍️ Generate Platform-Specific Content</span>
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
      generateBtn.innerHTML = '<span>⏳ Generating...</span>';

      try {
        // Generate platform-specific content
        await generatePlatformSpecificContent();
        // Show the generated content
        generatePreConfiguredPreview();
      } catch (error) {
        console.error('Error generating content:', error);
        showMessage('step3Message', 'Failed to generate content. Please try again.', 'error');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span>✍️ Generate Platform-Specific Content</span>';
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
    // Update content data with newly generated content
    contentData = {
      summary: currentPost.sourceSummary || contentData.summary,
      headline: currentPost.sourceHeadline || contentData.headline,
      content: currentPost.twitterCopy || currentPost.linkedinCopy || currentPost.facebookCopy || contentData.content,
      twitterCopy: currentPost.twitterCopy || '',
      linkedinCopy: currentPost.linkedinCopy || '',
      facebookCopy: currentPost.facebookCopy || '',
      instagramCopy: currentPost.instagramCopy || '',
      blogCopy: currentPost.blogCopy || ''
    };
  } else {
    throw new Error('Could not find updated post data after generation.');
  }
}

// Handle image loading errors
function handleImageError(imgElement) {
  console.error('❌ Image failed to load');
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; background: rgba(255,0,0,0.1); border: 1px solid #ff6b6b; border-radius: 8px; color: #d63031; text-align: center;';
  errorDiv.innerHTML = '⚠️ Image could not be loaded<br><small>Check if the Google Drive file is publicly shared</small>';
  imgElement.parentNode.replaceChild(errorDiv, imgElement);
}

// Make functions globally available
window.toggleContentPreview = toggleContentPreview;
window.closeContentModal = closeContentModal;
window.handleImageError = handleImageError;

// Final submit
finalSubmit.addEventListener('click', async function() {
  finalSubmit.disabled = true;
  finalSubmit.innerHTML = '<span>⏳ Posting...</span>';
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