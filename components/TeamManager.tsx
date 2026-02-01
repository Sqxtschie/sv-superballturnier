'use client'

import { useState } from 'react'
import { Team, CategoryType } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

interface TeamManagerProps {
  teams: Team[]
  category: CategoryType
  onUpdate: () => void
}

export default function TeamManager({ teams, category, onUpdate }: TeamManagerProps) {
  const [editingTeam, setEditingTeam] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [editName, setEditName] = useState('')
  const [editClassName, setEditClassName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamClassName, setNewTeamClassName] = useState('')
  const [newTeamNickname, setNewTeamNickname] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const categoryTeams = teams.filter(t => t.category === category)

  const handleSave = async (teamId: string) => {
    console.log('Saving team:', teamId, { name: editName.trim(), class_name: editClassName.trim(), nickname: nickname.trim() || null })

    const updateData = {
      name: editName.trim(),
      class_name: editClassName.trim(),
      nickname: nickname.trim() || null
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updateData as never)
      .eq('id', teamId)
      .select()

    console.log('Update result:', { data, error })

    if (error) {
      alert('Fehler beim Speichern: ' + error.message)
    } else if (!data || data.length === 0) {
      alert('Keine Berechtigung zum Bearbeiten. Bitte stelle sicher, dass du als Admin eingeloggt bist.')
    } else {
      setEditingTeam(null)
      setNickname('')
      setEditName('')
      setEditClassName('')
      onUpdate()
    }
  }

  const startEdit = (team: Team) => {
    setEditingTeam(team.id)
    setNickname(team.nickname || '')
    setEditName(team.name)
    setEditClassName(team.class_name)
  }

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      alert('Bitte einen Teamnamen eingeben!')
      return
    }
    if (!newTeamClassName.trim()) {
      alert('Bitte eine Klasse eingeben!')
      return
    }

    console.log('Adding team:', { name: newTeamName.trim(), class_name: newTeamClassName.trim(), nickname: newTeamNickname.trim() || null, category })

    const insertData = {
      name: newTeamName.trim(),
      class_name: newTeamClassName.trim(),
      nickname: newTeamNickname.trim() || null,
      category: category
    }

    const { data, error } = await supabase
      .from('teams')
      .insert(insertData as never)
      .select()

    console.log('Insert result:', { data, error })

    if (error) {
      alert('Fehler beim Hinzufügen: ' + error.message)
    } else if (!data || data.length === 0) {
      alert('Keine Berechtigung zum Hinzufügen. Bitte stelle sicher, dass du als Admin eingeloggt bist.')
    } else {
      setNewTeamName('')
      setNewTeamClassName('')
      setNewTeamNickname('')
      setIsAdding(false)
      onUpdate()
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (confirm(`Möchtest du "${teamName}" wirklich löschen? Dies kann nicht rückgängig gemacht werden!`)) {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) {
        alert('Fehler beim Löschen: ' + error.message)
      } else {
        onUpdate()
      }
    }
  }

  return (
    <div className="mb-8">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto px-6 py-3 bg-tournament-yellow text-tournament-purple rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl mb-4"
      >
        {isOpen ? '👥 Teams ausblenden' : '👥 Teams verwalten'}
      </button>

      {/* Team Manager Panel */}
      {isOpen && (
        <div className="bg-tournament-purple-dark/50 rounded-lg p-4 md:p-6 animate-[fadeInDown_0.5s_ease-out]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-tournament-yellow">
              Teams - {category.toUpperCase()} ({categoryTeams.length})
            </h3>

            {/* Add Team Button */}
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
              >
                ➕ Neues Team hinzufügen
              </button>
            )}
          </div>

          {/* Add New Team Form */}
          {isAdding && (
            <div className="bg-white/10 rounded-lg p-4 mb-6 animate-[fadeInDown_0.3s_ease-out]">
              <h4 className="text-white font-bold mb-3">Neues Team erstellen</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Teamname *</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="z.B. FC München..."
                    className="w-full px-3 py-2 text-sm md:text-base rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Klasse *</label>
                  <input
                    type="text"
                    value={newTeamClassName}
                    onChange={(e) => setNewTeamClassName(e.target.value)}
                    placeholder="z.B. 5a, U8..."
                    className="w-full px-3 py-2 text-sm md:text-base rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1 block">Spitzname (optional)</label>
                  <input
                    type="text"
                    value={newTeamNickname}
                    onChange={(e) => setNewTeamNickname(e.target.value)}
                    placeholder="z.B. Die Löwen..."
                    className="w-full px-3 py-2 text-sm md:text-base rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddTeam}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors"
                >
                  ✓ Hinzufügen
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewTeamName('')
                    setNewTeamClassName('')
                    setNewTeamNickname('')
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors"
                >
                  ✕ Abbrechen
                </button>
              </div>
            </div>
          )}

          {/* Team List */}
          {categoryTeams.length === 0 ? (
            <div className="text-white/50 text-center py-8">
              Noch keine Teams in dieser Kategorie. Füge oben ein neues Team hinzu!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {categoryTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white/10 rounded-lg p-3 md:p-4 transform transition-all duration-300 hover:bg-white/20"
                >
                  {editingTeam === team.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/70 text-xs mb-1 block">Teamname</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Teamname..."
                          className="w-full px-3 py-2 text-sm rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-xs mb-1 block">Klasse</label>
                        <input
                          type="text"
                          value={editClassName}
                          onChange={(e) => setEditClassName(e.target.value)}
                          placeholder="Klasse..."
                          className="w-full px-3 py-2 text-sm rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                        />
                      </div>
                      <div>
                        <label className="text-white/70 text-xs mb-1 block">Spitzname</label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="Spitzname (optional)..."
                          className="w-full px-3 py-2 text-sm rounded border border-tournament-yellow bg-white/90 text-tournament-purple focus:ring-2 focus:ring-tournament-yellow"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(team.id)}
                          className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          ✓ Speichern
                        </button>
                        <button
                          onClick={() => {
                            setEditingTeam(null)
                            setNickname('')
                            setEditName('')
                            setEditClassName('')
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          ✕ Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-white font-bold text-sm md:text-base">
                          {team.name} ({team.class_name})
                        </div>
                        <button
                          onClick={() => handleDeleteTeam(team.id, `${team.name} (${team.class_name})`)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors p-1"
                          title="Team löschen"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="text-tournament-yellow text-sm mb-3 min-h-[20px]">
                        {team.nickname ? `"${team.nickname}"` : '—'}
                      </div>
                      <button
                        onClick={() => startEdit(team)}
                        className="w-full px-3 py-1.5 text-sm bg-tournament-yellow text-tournament-purple rounded font-bold hover:bg-tournament-yellow/80 transition-all duration-300"
                      >
                        ✏️ Bearbeiten
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info Text */}
          <div className="mt-6 p-3 bg-white/5 rounded-lg text-white/60 text-sm">
            💡 <strong>Tipp:</strong> Nachdem du Teams hinzugefügt oder gelöscht hast, klicke auf "Turnierbäume initialisieren", um die Brackets neu zu erstellen.
          </div>
        </div>
      )}
    </div>
  )
}
