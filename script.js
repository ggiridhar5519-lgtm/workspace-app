// Load saved data on page load
document.addEventListener("DOMContentLoaded", loadData);

function addRow() {
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const status = document.getElementById("status").value;
  const notes = document.getElementById("notes").value;

  if (!title || !date || !time) {
    alert("Title, Date and Time are required");
    return;
  }

  const data = { title, date, time, status, notes };
  saveToLocalStorage(data);
  appendRow(data);
  clearForm();
}

function appendRow(data) {
  const table = document
    .getElementById("trackerTable")
    .querySelector("tbody");

  const row = table.insertRow();
  row.innerHTML = `
    <td>${data.title}</td>
    <td>${data.date}</td>
    <td>${data.time}</td>
    <td>${data.status}</td>
    <td>${data.notes}</td>
  `;
}

function saveToLocalStorage(data) {
  const rows = JSON.parse(localStorage.getItem("trackerData")) || [];
  rows.push(data);
  localStorage.setItem("trackerData", JSON.stringify(rows));
}

function loadData() {
  const rows = JSON.parse(localStorage.getItem("trackerData")) || [];
  rows.forEach(appendRow);
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("notes").value = "";
}
