import React, { useState } from 'react'

interface Note {
  id: string
  content: string
}

function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  function addNote() {
    const newNote: Note = {
      id: Date.now().toString(),
      content: ''
    }
    setNotes([newNote, ...notes])
    setSelectedNoteId(newNote.id)
  }

  function updateNoteContent(id: string, content: string) {
    setNotes(notes.map(note => note.id === id ? { ...note, content } : note))
  }

  function selectNote(id: string) {
    setSelectedNoteId(id)
  }

  const selectedNote = notes.find(note => note.id === selectedNoteId)

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b border-gray-300">
        <div className="w-full max-w-5xl min-w-[320px] mx-auto">
          <h1 className="text-2xl font-bold">My Notes</h1>
        </div>
      </header>
      <div className="flex flex-1 justify-center items-start p-4">
        <div className="flex h-full w-full max-w-5xl min-w-[320px] border border-gray-300 rounded shadow overflow-hidden">
          <aside className="w-64 border-r border-gray-300 p-4">
            <button
              className="w-full mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              onClick={addNote}
            >
              New Note
            </button>
            <ul className="list-none p-0">
              {notes.map(note => (
                <li key={note.id}>
                  <button
                    className={`block w-full px-2 py-2 mt-2 border text-left rounded ${
                      note.id === selectedNoteId ? 'bg-gray-300' : 'bg-white'
                    } border-gray-300 hover:bg-gray-200`}
                    onClick={() => selectNote(note.id)}
                  >
                    {(note.content.split('\n')[0] || 'Untitled').substring(0, 20)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <main className="flex-1 p-4">
            {selectedNote ? (
              <textarea
                className="w-full h-full border border-gray-300 rounded p-2"
                value={selectedNote.content}
                onChange={e => updateNoteContent(selectedNote.id, e.target.value)}
              />
            ) : (
              <p>Select or create a note</p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default NoteApp
