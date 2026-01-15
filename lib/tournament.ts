import { Team, Match, CategoryType, BracketType } from './database.types'
import { supabase } from './supabase'

// Funktion zum Erstellen eines Double Elimination Brackets
export async function createDoubleEliminationBracket(
  category: CategoryType,
  teams: Team[]
): Promise<void> {
  const numTeams = teams.length

  // Erstelle Winner Bracket und erhalte die Matches zurück
  const winnerMatches = await createWinnerBracket(category, teams)

  // Erstelle Loser Bracket und verknüpfe mit Winner Bracket
  await createLoserBracket(category, numTeams, winnerMatches)
}

async function createWinnerBracket(
  category: CategoryType,
  teams: Team[]
): Promise<{ [round: number]: any[] }> {
  const numTeams = teams.length
  const rounds = Math.ceil(Math.log2(numTeams))
  const allWinnerMatches: { [round: number]: any[] } = {}

  // Runde 1: Erste Matches mit Teams
  const round1Matches: any[] = []
  let matchNumber = 1

  for (let i = 0; i < numTeams; i += 2) {
    const team1 = teams[i]
    const team2 = i + 1 < numTeams ? teams[i + 1] : null

    round1Matches.push({
      category,
      bracket: 'winner' as BracketType,
      round: 1,
      match_number: matchNumber,
      team1_id: team1.id,
      team2_id: team2?.id || null,
      status: team2 ? 'pending' : 'completed',
      winner_id: team2 ? null : team1.id,
      position_in_round: Math.floor(i / 2)
    })

    matchNumber++
  }

  // Erstelle Runde 1
  const { data: insertedRound1, error: error1 } = await supabase
    .from('matches')
    .insert(round1Matches)
    .select()

  if (error1) {
    console.error('Fehler beim Erstellen von Runde 1:', error1)
    throw new Error(`Fehler beim Erstellen von Runde 1 (${category}): ${error1.message}`)
  }

  allWinnerMatches[1] = insertedRound1 || []

  // Erstelle weitere Runden
  let previousRoundMatches = insertedRound1 || []

  for (let round = 2; round <= rounds; round++) {
    const numMatchesInRound = Math.ceil(previousRoundMatches.length / 2)
    const currentRoundMatches: any[] = []

    for (let i = 0; i < numMatchesInRound; i++) {
      currentRoundMatches.push({
        category,
        bracket: 'winner' as BracketType,
        round,
        match_number: matchNumber,
        team1_id: null,
        team2_id: null,
        status: 'pending',
        position_in_round: i
      })
      matchNumber++
    }

    const { data: insertedMatches, error } = await supabase
      .from('matches')
      .insert(currentRoundMatches)
      .select()

    if (error) {
      console.error(`Fehler beim Erstellen von Runde ${round}:`, error)
      throw new Error(`Fehler beim Erstellen von Runde ${round} (${category}): ${error.message}`)
    }

    allWinnerMatches[round] = insertedMatches || []

    // Verknüpfe vorherige Runde mit aktueller Runde
    for (let i = 0; i < previousRoundMatches.length; i++) {
      const nextMatchIndex = Math.floor(i / 2)
      const nextMatchPosition = (i % 2) + 1
      const nextMatch = insertedMatches?.[nextMatchIndex]

      if (nextMatch) {
        await supabase
          .from('matches')
          .update({
            next_match_id: nextMatch.id,
            next_match_position: nextMatchPosition
          })
          .eq('id', previousRoundMatches[i].id)
      }
    }

    previousRoundMatches = insertedMatches || []
  }

  return allWinnerMatches
}

async function createLoserBracket(
  category: CategoryType,
  numTeams: number,
  winnerMatches: { [round: number]: any[] }
): Promise<void> {
  const winnerRounds = Math.ceil(Math.log2(numTeams))

  // Für ein Double Elimination brauchen wir ein vereinfachtes Loser Bracket
  // Loser aus Winner R1 -> Loser R1
  // Loser aus Winner R2 -> Loser R2 (gegen Sieger aus Loser R1)
  // usw.

  let matchNumber = 1
  const allLoserMatches: { [round: number]: any[] } = {}

  // Berechne die Struktur des Loser Brackets
  // Runde 1: Verlierer aus Winner R1 spielen gegeneinander
  // Runde 2: Sieger aus Loser R1 gegen Verlierer aus Winner R2
  // usw.

  const loserRounds = (winnerRounds - 1) * 2 + 1

  for (let loserRound = 1; loserRound <= loserRounds; loserRound++) {
    // Gerade Runden: Verlierer aus Winner Bracket kommen rein
    // Ungerade Runden (außer R1): Nur Loser Bracket intern

    let numMatchesInRound: number

    if (loserRound === 1) {
      // Erste Loser Runde: Hälfte der Verlierer aus Winner R1
      numMatchesInRound = Math.floor(winnerMatches[1]?.length / 2) || 1
    } else if (loserRound % 2 === 0) {
      // Gerade Runden: Gleiche Anzahl wie vorherige ungerade Runde
      numMatchesInRound = allLoserMatches[loserRound - 1]?.length || 1
    } else {
      // Ungerade Runden (3, 5, ...): Hälfte der vorherigen Runde
      numMatchesInRound = Math.ceil((allLoserMatches[loserRound - 1]?.length || 2) / 2)
    }

    // Mindestens 1 Match
    numMatchesInRound = Math.max(1, numMatchesInRound)

    const matches: any[] = []
    for (let i = 0; i < numMatchesInRound; i++) {
      matches.push({
        category,
        bracket: 'loser' as BracketType,
        round: loserRound,
        match_number: matchNumber,
        team1_id: null,
        team2_id: null,
        status: 'pending',
        position_in_round: i
      })
      matchNumber++
    }

    if (matches.length > 0) {
      const { data: insertedMatches, error } = await supabase
        .from('matches')
        .insert(matches)
        .select()

      if (error) {
        console.error(`Fehler beim Erstellen von Loser Runde ${loserRound}:`, error)
      } else {
        allLoserMatches[loserRound] = insertedMatches || []
      }
    }
  }

  // Verknüpfe Loser Bracket intern (jede Runde mit der nächsten)
  for (let loserRound = 1; loserRound < loserRounds; loserRound++) {
    const currentRoundMatches = allLoserMatches[loserRound] || []
    const nextRoundMatches = allLoserMatches[loserRound + 1] || []

    for (let i = 0; i < currentRoundMatches.length; i++) {
      let nextMatchIndex: number
      let nextMatchPosition: number

      if ((loserRound + 1) % 2 === 0) {
        // Nächste Runde ist gerade: 1:1 Mapping, Sieger geht auf Position 1
        nextMatchIndex = i
        nextMatchPosition = 1
      } else {
        // Nächste Runde ist ungerade: 2:1 Mapping
        nextMatchIndex = Math.floor(i / 2)
        nextMatchPosition = (i % 2) + 1
      }

      const nextMatch = nextRoundMatches[nextMatchIndex]

      if (nextMatch) {
        await supabase
          .from('matches')
          .update({
            next_match_id: nextMatch.id,
            next_match_position: nextMatchPosition
          })
          .eq('id', currentRoundMatches[i].id)
      }
    }
  }

  // Verknüpfe Winner Bracket Verlierer mit Loser Bracket
  // Winner R1 Verlierer -> Loser R1
  const winnerR1 = winnerMatches[1] || []
  const loserR1 = allLoserMatches[1] || []

  for (let i = 0; i < winnerR1.length; i++) {
    const loserMatchIndex = Math.floor(i / 2)
    const loserMatchPosition = (i % 2) + 1
    const loserMatch = loserR1[loserMatchIndex]

    if (loserMatch) {
      await supabase
        .from('matches')
        .update({
          loser_next_match_id: loserMatch.id,
          loser_next_match_position: loserMatchPosition
        })
        .eq('id', winnerR1[i].id)
    }
  }

  // Winner R2+ Verlierer -> Loser gerade Runden (R2, R4, ...)
  for (let winnerRound = 2; winnerRound <= winnerRounds; winnerRound++) {
    const loserRound = (winnerRound - 1) * 2 // Winner R2 -> Loser R2, Winner R3 -> Loser R4
    const winnerRoundMatches = winnerMatches[winnerRound] || []
    const loserRoundMatches = allLoserMatches[loserRound] || []

    for (let i = 0; i < winnerRoundMatches.length; i++) {
      const loserMatch = loserRoundMatches[i]

      if (loserMatch) {
        await supabase
          .from('matches')
          .update({
            loser_next_match_id: loserMatch.id,
            loser_next_match_position: 2 // Verlierer aus Winner geht auf Position 2
          })
          .eq('id', winnerRoundMatches[i].id)
      }
    }
  }
}

// Funktion zum Aktualisieren eines Match-Ergebnisses
export async function updateMatchResult(
  matchId: string,
  winnerId: string
): Promise<void> {
  // Hole das Match
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    console.error('Match nicht gefunden:', matchError)
    return
  }

  // Bestimme den Verlierer
  const loserId = match.team1_id === winnerId ? match.team2_id : match.team1_id

  // Aktualisiere das Match
  await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      status: 'completed'
    })
    .eq('id', matchId)

  // Wenn es ein nächstes Match gibt, füge den Gewinner hinzu
  if (match.next_match_id && match.next_match_position) {
    const updateField = match.next_match_position === 1 ? 'team1_id' : 'team2_id'

    await supabase
      .from('matches')
      .update({ [updateField]: winnerId })
      .eq('id', match.next_match_id)
  }

  // Wenn es ein Loser Bracket Match gibt, füge den Verlierer hinzu
  if (loserId && match.loser_next_match_id && match.loser_next_match_position) {
    const updateField = match.loser_next_match_position === 1 ? 'team1_id' : 'team2_id'

    await supabase
      .from('matches')
      .update({ [updateField]: loserId })
      .eq('id', match.loser_next_match_id)
  }
}

// Funktion zum Abrufen aller Matches für eine Kategorie
export async function getMatchesForCategory(
  category: CategoryType
): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('category', category)
    .order('bracket', { ascending: true })
    .order('round', { ascending: true })
    .order('position_in_round', { ascending: true })

  if (error) {
    console.error('Fehler beim Abrufen der Matches:', error)
    return []
  }

  return data || []
}

// Funktion zum Initialisieren aller Turnierbäume
export async function initializeTournaments(): Promise<void> {
  // Hole alle Teams
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')

  if (error) {
    console.error('Fehler beim Abrufen der Teams:', error)
    throw new Error('Fehler beim Abrufen der Teams: ' + error.message)
  }

  if (!teams || teams.length === 0) {
    throw new Error('Keine Teams in der Datenbank gefunden! Bitte füge zuerst Teams hinzu.')
  }

  console.log(`${teams.length} Teams gefunden`)

  // Gruppiere Teams nach Kategorie
  const unterstufeTeams = teams.filter(t => t.category === 'unterstufe')
  const mittelstufeTeams = teams.filter(t => t.category === 'mittelstufe')
  const oberstufeTeams = teams.filter(t => t.category === 'oberstufe')

  console.log(`Unterstufe: ${unterstufeTeams.length}, Mittelstufe: ${mittelstufeTeams.length}, Oberstufe: ${oberstufeTeams.length}`)

  // Erstelle Brackets für jede Kategorie
  if (unterstufeTeams.length > 0) {
    await createDoubleEliminationBracket('unterstufe', unterstufeTeams)
    console.log('Unterstufe Bracket erstellt')
  }

  if (mittelstufeTeams.length > 0) {
    await createDoubleEliminationBracket('mittelstufe', mittelstufeTeams)
    console.log('Mittelstufe Bracket erstellt')
  }

  if (oberstufeTeams.length > 0) {
    await createDoubleEliminationBracket('oberstufe', oberstufeTeams)
    console.log('Oberstufe Bracket erstellt')
  }
}
