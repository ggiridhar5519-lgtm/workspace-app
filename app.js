// Load notes on page load
window.onload = () => {
  const savedNotes = localStorage.getItem("notes");
  if (savedNotes) {
    document.getElementById("notes").value = savedNotes;
  }
};

// Save notes
function saveNotes() {
  const notes = document.getElementById("notes").value;
  localStorage.setItem("notes", notes);
  alert("Notes saved");
}
