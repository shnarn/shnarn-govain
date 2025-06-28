var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};
function filledCell(cell) {
  return cell !== '' && cell != null;
}
function loadFileData(filename) {
  if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
    try {
      var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
      var firstSheetName = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[firstSheetName];
      // Convert sheet to JSON to filter blank rows
      var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
      // Filter out blank rows (rows where all cells are empty, null, or undefined)
      var filteredData = jsonData.filter(row => row.some(filledCell));
      // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
      var headerRowIndex = filteredData.findIndex((row, index) =>
        row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
      );
      // Fallback
      if (headerRowIndex === -1 || headerRowIndex > 25) {
        headerRowIndex = 0;
      }
      // Convert filtered JSON back to CSV
      var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex)); // Create a new sheet from filtered array of arrays
      csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
      return csv;
    } catch (e) {
      console.error(e);
      return "";
    }
  }
  return gk_fileData[filename] || "";
}

function loadNavbar() {
  var placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;
  
  // Determine the correct path to navbar.html based on current page location
  var path = 'navbar.html';
  var currentPath = window.location.pathname;
  
  // If we're in a subdirectory, we need to go up one level
  if (currentPath.includes('/primary/') || currentPath.includes('/secondary/') || currentPath.includes('/schoolVisit/')) {
    path = '../navbar.html';
  }
  
  // Add cache-busting parameter to prevent browser caching
  var cacheBuster = '?v=' + Date.now();
  path += cacheBuster;
  
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      placeholder.innerHTML = xhr.responseText;
    } else if (xhr.readyState === 4 && xhr.status === 404) {
      // If the first path failed, try the alternative
      if (path.includes('../navbar.html')) {
        var fallbackPath = 'navbar.html' + cacheBuster;
        var fallbackXhr = new XMLHttpRequest();
        fallbackXhr.open('GET', fallbackPath, true);
        fallbackXhr.onreadystatechange = function() {
          if (fallbackXhr.readyState === 4 && fallbackXhr.status === 200) {
            placeholder.innerHTML = fallbackXhr.responseText;
          }
        };
        fallbackXhr.send();
      }
    }
  };
  xhr.send();
}

document.addEventListener('DOMContentLoaded', loadNavbar);
