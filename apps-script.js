// Google Apps Script code to deploy as web app for updating Google Sheets
// Deploy this script as a web app with "Execute as: Me" and "Who has access: Anyone"

function doPost(e) {
  try {
    // Handle both direct JSON and form-encoded data
    let data;
    if (e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // Try parsing as form data
        const params = e.parameter;
        if (params.data) {
          data = JSON.parse(params.data);
        } else {
          throw new Error('Invalid data format');
        }
      }
    } else {
      // Handle form parameters
      const params = e.parameter;
      if (params.data) {
        data = JSON.parse(params.data);
      } else {
        throw new Error('No data provided');
      }
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Sheet not found'}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    const values = sheet.getDataRange().getValues();

    if (values.length < 1) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'No data in sheet'}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    const headers = values[0];
    const sourceHeadlineIndex = headers.indexOf('sourceHeadline');
    const socialChannelIndex = headers.indexOf('socialChannel');
    const needsImageIndex = headers.indexOf('needsimage');

    if (sourceHeadlineIndex === -1 || socialChannelIndex === -1 || needsImageIndex === -1) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Required columns not found'}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    // Find the row where sourceHeadline matches
    let found = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][sourceHeadlineIndex] === data.headline) {
        // Update socialChannel
        sheet.getRange(i + 1, socialChannelIndex + 1).setValue(data.socialChannel);
        // Update needsimage
        sheet.getRange(i + 1, needsImageIndex + 1).setValue(data.needsimage);
        found = true;
        break;
      }
    }

    if (!found) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Matching headline not found'}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'Google Apps Script is running'}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}