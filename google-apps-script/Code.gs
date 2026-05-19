/**
 * o2h Travel App — Google Apps Script backend
 *
 * Setup:
 * 1. Create a Google Sheet (see docs/GOOGLE_SETUP.md for tab names)
 * 2. Extensions → Apps Script → paste this file
 * 3. Set Script property API_KEY (Project settings → Script properties)
 * 4. Run setupSheets() once from the editor
 * 5. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
 * 6. Copy the web app URL into GOOGLE_APPS_SCRIPT_URL (Vercel / .env.local)
 */

var SHEETS = {
  USERS: 'Users',
  TRAVEL: 'Travel Requests',
  APPROVALS: 'Approvals',
  EXPENSES: 'Expenses',
  CALENDAR: 'Flight Calendar',
};

var HEADERS = {};
HEADERS[SHEETS.USERS] = ['UserID', 'Name', 'Email', 'Department', 'Role', 'Reporting Manager'];
HEADERS[SHEETS.TRAVEL] = [
  'RequestID', 'UserID', 'UserName', 'From', 'To', 'Country', 'Start Date', 'End Date',
  'Purpose', 'ClientName', 'Department', 'EstimatedCost', 'HotelRequired', 'VisaRequired',
  'ForexRequired', 'AdvanceRequired', 'Status', 'FY', 'CreatedAt',
];
HEADERS[SHEETS.APPROVALS] = ['ApprovalID', 'RequestID', 'Approver', 'ApproverRole', 'Status', 'Remarks', 'Date'];
HEADERS[SHEETS.EXPENSES] = [
  'ExpenseID', 'UserID', 'UserName', 'Category', 'Amount', 'Currency', 'FY', 'Department', 'Status', 'TripRef', 'UploadedAt',
];
HEADERS[SHEETS.CALENDAR] = [
  'User', 'UserID', 'FlightDate', 'ReturnDate', 'Airline', 'PNR', 'Country', 'Purpose', 'Department', 'Status',
];

function getSpreadsheet_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('API_KEY') || '';
}

function validateKey_(e) {
  var expected = getApiKey_();
  if (!expected) return true;
  var key = (e && e.parameter && e.parameter.key) || '';
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body.key) key = body.key;
    } catch (err) { /* ignore */ }
  }
  return key === expected;
}

function unauthorized_() {
  return ContentService.createTextOutput(
    JSON.stringify({ success: false, error: 'Unauthorized' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function setupSheets() {
  var ss = getSpreadsheet_();
  Object.keys(HEADERS).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  seedDemoData_();
}

function seedDemoData_() {
  var ss = getSpreadsheet_();
  var users = ss.getSheetByName(SHEETS.USERS);
  if (users.getLastRow() > 1) return;

  var rows = [
    ['U001', 'Pragnesh', 'pragnesh@o2h.com', 'Admin', 'admin', '-'],
    ['U002', 'Siddhi', 'siddhi@o2h.com', 'Chemistry', 'employee', 'Rajeshree'],
    ['U003', 'Rajeshree', 'rajeshree@o2h.com', 'Chemistry', 'hod', 'Pragnesh'],
    ['U004', 'Muskan', 'muskan@o2h.com', 'Biology', 'employee', 'Swaroop'],
    ['U005', 'Swaroop', 'swaroop@o2h.com', 'Biology', 'hod', 'Pragnesh'],
    ['U006', 'Chandrakant', 'chandrakant@o2h.com', 'Finance', 'finance', 'Pragnesh'],
  ];
  users.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function sheetToObjects_(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var out = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    out.push(row);
  }
  return out;
}

function mapUsers_(rows) {
  return rows.map(function (r) {
    return {
      userId: String(r.UserID || ''),
      name: String(r.Name || ''),
      email: String(r.Email || ''),
      department: String(r.Department || ''),
      role: String(r.Role || 'employee'),
      reportingManager: String(r['Reporting Manager'] || ''),
    };
  });
}

function mapTravel_(rows) {
  return rows.map(function (r) {
    return {
      requestId: String(r.RequestID || ''),
      userId: String(r.UserID || ''),
      userName: String(r.UserName || ''),
      from: String(r.From || ''),
      to: String(r.To || ''),
      country: String(r.Country || ''),
      startDate: formatDate_(r['Start Date']),
      endDate: formatDate_(r['End Date']),
      purpose: String(r.Purpose || ''),
      clientName: String(r.ClientName || ''),
      department: String(r.Department || ''),
      estimatedCost: Number(r.EstimatedCost) || 0,
      hotelRequired: r.HotelRequired === true || r.HotelRequired === 'TRUE',
      visaRequired: r.VisaRequired === true || r.VisaRequired === 'TRUE',
      forexRequired: r.ForexRequired === true || r.ForexRequired === 'TRUE',
      advanceRequired: r.AdvanceRequired === true || r.AdvanceRequired === 'TRUE',
      status: String(r.Status || 'pending_manager'),
      fy: String(r.FY || ''),
      createdAt: formatDate_(r.CreatedAt),
    };
  });
}

function mapExpenses_(rows) {
  return rows.map(function (r) {
    return {
      expenseId: String(r.ExpenseID || ''),
      userId: String(r.UserID || ''),
      userName: String(r.UserName || ''),
      category: String(r.Category || ''),
      amount: Number(r.Amount) || 0,
      currency: String(r.Currency || 'INR'),
      fy: String(r.FY || ''),
      department: String(r.Department || ''),
      status: String(r.Status || 'uploaded'),
      tripRef: String(r.TripRef || ''),
      uploadedAt: formatDate_(r.UploadedAt),
    };
  });
}

function mapCalendar_(rows) {
  return rows.map(function (r) {
    return {
      user: String(r.User || ''),
      userId: String(r.UserID || ''),
      flightDate: formatDate_(r.FlightDate),
      returnDate: r.ReturnDate ? formatDate_(r.ReturnDate) : '',
      airline: String(r.Airline || ''),
      pnr: String(r.PNR || ''),
      country: String(r.Country || ''),
      purpose: String(r.Purpose || ''),
      department: String(r.Department || ''),
      status: String(r.Status || 'pending'),
    };
  });
}

function formatDate_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(val);
}

function doGet(e) {
  if (!validateKey_(e)) return unauthorized_();
  var action = (e && e.parameter && e.parameter.action) || '';
  var ss = getSpreadsheet_();

  try {
    switch (action) {
      case 'users':
        return json_({
          data: mapUsers_(sheetToObjects_(ss.getSheetByName(SHEETS.USERS))),
        });
      case 'travel':
        return json_({
          data: mapTravel_(sheetToObjects_(ss.getSheetByName(SHEETS.TRAVEL))),
        });
      case 'expenses':
        return json_({
          data: mapExpenses_(sheetToObjects_(ss.getSheetByName(SHEETS.EXPENSES))),
        });
      case 'calendar':
        return json_({
          data: mapCalendar_(sheetToObjects_(ss.getSheetByName(SHEETS.CALENDAR))),
        });
      case 'approvals':
        return json_({ data: sheetToObjects_(ss.getSheetByName(SHEETS.APPROVALS)) });
      case 'health':
        return json_({ success: true, message: 'o2h Travel App API is running' });
      default:
        return json_({ success: false, error: 'Unknown action. Use: users, travel, expenses, calendar, approvals, health' });
    }
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function doPost(e) {
  if (!validateKey_(e)) return unauthorized_();
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ success: false, error: 'Invalid JSON body' });
  }

  var action = body.action || '';
  var ss = getSpreadsheet_();

  try {
    switch (action) {
      case 'createTravel':
        return json_(createTravel_(ss, body.payload || body));
      case 'createExpense':
        return json_(createExpense_(ss, body.payload || body));
      case 'updateApproval':
        return json_(updateApproval_(ss, body));
      default:
        return json_({ success: false, error: 'Unknown action' });
    }
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function createTravel_(ss, p) {
  var sheet = ss.getSheetByName(SHEETS.TRAVEL);
  var id = 'TR' + new Date().getTime();
  var row = [
    id,
    p.userId || '',
    p.userName || '',
    p.from || '',
    p.to || '',
    p.country || '',
    p.startDate || '',
    p.endDate || '',
    p.purpose || '',
    p.clientName || '',
    p.department || '',
    Number(p.estimatedCost) || 0,
    p.hotelRequired ? 'TRUE' : 'FALSE',
    p.visaRequired ? 'TRUE' : 'FALSE',
    p.forexRequired ? 'TRUE' : 'FALSE',
    p.advanceRequired ? 'TRUE' : 'FALSE',
    'pending_manager',
    p.fy || '',
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
  ];
  sheet.appendRow(row);

  var approvals = ss.getSheetByName(SHEETS.APPROVALS);
  approvals.appendRow([
    'A' + new Date().getTime(),
    id,
    p.reportingManager || 'Manager',
    'Reporting Manager',
    'pending',
    '',
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
  ]);

  return { success: true, requestId: id };
}

function createExpense_(ss, p) {
  var sheet = ss.getSheetByName(SHEETS.EXPENSES);
  var id = 'E' + new Date().getTime();
  sheet.appendRow([
    id,
    p.userId || '',
    p.userName || '',
    p.category || 'Miscellaneous',
    Number(p.amount) || 0,
    p.currency || 'INR',
    p.fy || '',
    p.department || '',
    'uploaded',
    p.tripRef || '',
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
  ]);
  return { success: true, expenseId: id };
}

function updateApproval_(ss, body) {
  var sheet = ss.getSheetByName(SHEETS.APPROVALS);
  var data = sheet.getDataRange().getValues();
  var id = body.approvalId;
  var status = body.status;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, 5).setValue(status);
      if (body.remarks) sheet.getRange(i + 1, 6).setValue(body.remarks);
      return { success: true };
    }
  }
  return { success: false, error: 'Approval not found' };
}
