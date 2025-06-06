
    const STORAGE_KEY = 'offline-notes';
    let notes = {};
    let activeNoteId = null;
    let isEditing = false;

    const notesList = document.getElementById('notesList');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-btn');

    // Load notes from localStorage
    function loadNotes() {
      const saved = localStorage.getItem(STORAGE_KEY);
      notes = saved ? JSON.parse(saved) : {};
    }

    // Save notes to localStorage
    function saveNotes() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    // Save current note content if in editing mode
    function saveCurrentNote() {
      if (!activeNoteId || !isEditing) return;
      notes[activeNoteId].title = noteTitle.value.trim() || 'Untitled Note';
      notes[activeNoteId].content = noteContent.value;
      saveNotes();
      renderNotesList();
    }

    // Render the notes list with edit and delete buttons
    function renderNotesList() {
      notesList.innerHTML = '';
      for (const id in notes) {
        const li = document.createElement('li');
        li.dataset.id = id;

        // Title span - clicking it loads note in view mode
        const titleSpan = document.createElement('span');
        titleSpan.textContent = notes[id].title || 'Untitled Note';
        titleSpan.style.flexGrow = "1";
        titleSpan.style.userSelect = "none";
        titleSpan.style.cursor = "pointer";
        titleSpan.addEventListener('click', () => {
          if (activeNoteId !== id) {
            switchNote(id);
          }
        });

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'editBtn';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent triggering li click
          if (activeNoteId !== id) {
            switchNote(id, true);
          } else {
            toggleEditing(true);
          }
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'deleteBtn';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent triggering li click
          if (confirm(`Delete note "${notes[id].title}"?`)) {
            delete notes[id];
            // If deleted note was active, clear editor or switch to another note
            if (activeNoteId === id) {
              activeNoteId = null;
              isEditing = false;
              noteTitle.value = '';
              noteContent.value = '';
              noteTitle.disabled = true;
              noteContent.disabled = true;

              // Try to switch to another note if available
              const ids = Object.keys(notes);
              if (ids.length > 0) {
                switchNote(ids[0], false);
              }
            }
            saveNotes();
            renderNotesList();
          }
        });

        li.appendChild(titleSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        if (id === activeNoteId) li.classList.add('active');
        notesList.appendChild(li);
      }
    }

    // Switch active note, load in view mode or optionally edit mode
    function switchNote(id, startEditing = false) {
      saveCurrentNote();
      activeNoteId = id;
      noteTitle.value = notes[id].title;
      noteContent.value = notes[id].content;
      renderNotesList();
      toggleEditing(startEditing);
    }

    // Enable or disable editing mode
    function toggleEditing(enable) {
      isEditing = enable;
      noteTitle.disabled = !enable;
      noteContent.disabled = !enable;
      if (!enable) {
        saveCurrentNote();
      }
      if (enable) {
        noteTitle.focus();
      }
    }

    // Create a new note and open it in edit mode
    function createNewNote() {
      saveCurrentNote();
      const id = 'note-' + Date.now();
      notes[id] = { title: 'New Note', content: '' };
      activeNoteId = id;
      noteTitle.value = notes[id].title;
      noteContent.value = '';
      saveNotes();
      renderNotesList();
      toggleEditing(true);
    }

    // Autosave while editing
    noteTitle.addEventListener('input', saveCurrentNote);
    noteContent.addEventListener('input', saveCurrentNote);
    newNoteBtn.addEventListener('click', createNewNote);

    // Toggle sidebar collapse/expand
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });

    // Initialize app
    loadNotes();
    renderNotesList();

    // Open first note or create new if none in storage
    const noteIds = Object.keys(notes);
    if (noteIds.length > 0) {
      switchNote(noteIds[0], false);
    } else {
      createNewNote();
    }
  

