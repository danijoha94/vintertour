'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchApi } from '@/lib/api/matchApi';
import { Match } from '@/lib/types/match';
import Modal from '@/components/Modal';

export default function MatchViewPage() {
  const params = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHole, setSelectedHole] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadMatch();
  }, []);

  const loadMatch = async () => {
    try {
      const id = parseInt(params.id as string);
      const data = await matchApi.getById(id);
      if (!data) {
        router.push('/');
        return;
      }
      setMatch(data);
    } catch (error) {
      console.error('Failed to load match:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = async (holeNumber: number, team: 'team1' | 'team2', playerId: number) => {
    if (!match) return;

    const updatedHoles = match.holes.map(hole => {
      if (hole.number === holeNumber) {
        return {
          ...hole,
          [team === 'team1' ? 'team1_player' : 'team2_player']: playerId
        };
      }
      return hole;
    });

    const updatedMatch = { ...match, holes: updatedHoles };
    await matchApi.update(match.id, { holes: updatedHoles });
    setMatch(updatedMatch);
    setSelectedHole(null);
    setSelectedTeam(null);
  };

  const handlePlayerRemove = async (holeNumber: number, team: 'team1' | 'team2') => {
    if (!match) return;

    const updatedHoles = match.holes.map(hole => {
      if (hole.number === holeNumber) {
        return {
          ...hole,
          [team === 'team1' ? 'team1_player' : 'team2_player']: 0
        };
      }
      return hole;
    });

    const updatedMatch = { ...match, holes: updatedHoles };
    await matchApi.update(match.id, { holes: updatedHoles });
    setMatch(updatedMatch);
    setSelectedHole(null);
    setSelectedTeam(null);
  };

  const handleScoreChange = async (team: 'team1' | 'team2', score: number) => {
    if (!match) return;

    const updatedMatch = {
      ...match,
      [team]: {
        ...match[team],
        score
      }
    };

    await matchApi.update(match.id, {
      team1: updatedMatch.team1,
      team2: updatedMatch.team2
    });
    setMatch(updatedMatch);
  };

  const getPlayerName = (team: 'team1' | 'team2', playerId: number): string => {
    if (!match || playerId === 0) return '';
    const teamObj = team === 'team1' ? match.team1 : match.team2;
    if (teamObj.player1.id === playerId) return teamObj.player1.name;
    if (teamObj.player2.id === playerId) return teamObj.player2.name;
    return '';
  };

  const showRemoveOption = (holeNumber: number, team: 'team1' | 'team2') => {
    setSelectedHole(holeNumber);
    setSelectedTeam(team);
  };

  const closeRemoveOption = () => {
    setSelectedHole(null);
    setSelectedTeam(null);
  };

  const validateAllHoles = (): boolean => {
    if (!match) return false;
    return match.holes.every(hole => hole.team1_player !== 0 && hole.team2_player !== 0);
  };

  const handleSend = () => {
    if (!match) return;

    if (!validateAllHoles()) {
      setModalMessage('Alle hull må ha en valgt spiller for begge lag før du kan sende inn.');
      setModalOpen(true);
      return;
    }

    const subject = `${match.title}, ${match.team1.title} vs ${match.team2.title}`;
    
    let body = `Kamp: ${match.title}\n`;
    body += `${match.team1.title} vs ${match.team2.title}\n\n`;
    body += `Resultat:\n`;
    body += `${match.team1.title}: ${match.team1.score || 0}\n`;
    body += `${match.team2.title}: ${match.team2.score || 0}\n\n`;
    body += `Hull | ${match.team1.title} | ${match.team2.title}\n`;
    body += `${'─'.repeat(50)}\n`;
    
    match.holes.forEach(hole => {
      const team1Player = getPlayerName('team1', hole.team1_player);
      const team2Player = getPlayerName('team2', hole.team2_player);
      body += `${hole.number.toString().padStart(2, ' ')}   | ${team1Player.padEnd(20)} | ${team2Player}\n`;
    });

    const mailtoLink = `mailto:daniel@johansenweb.no?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laster kamp...</p>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-[#275319] hover:text-[#1a3310] active:text-[#0f1f0a] active:bg-gray-100 font-medium text-sm sm:text-base px-3 py-1 rounded"
          >
            ← Tilbake
          </button>
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center break-words px-2">{match.title}</h1>

        {/* Player Assignment Counter */}
        <div className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-2 gap-0">
            {/* Team 1 Players */}
            <div className="border-r border-gray-300">
              <div className="bg-gray-100 py-2 px-4 border-b border-gray-300">
                <h3 className="font-semibold text-sm sm:text-base text-center">{match.team1.title}</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">{match.team1.player1.name}</span>
                  <span className="bg-[#275319] text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {match.holes.filter(h => h.team1_player === match.team1.player1.id).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">{match.team1.player2.name}</span>
                  <span className="bg-[#275319] text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {match.holes.filter(h => h.team1_player === match.team1.player2.id).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Team 2 Players */}
            <div>
              <div className="bg-gray-100 py-2 px-4 border-b border-gray-300">
                <h3 className="font-semibold text-sm sm:text-base text-center">{match.team2.title}</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">{match.team2.player1.name}</span>
                  <span className="bg-[#ff7229] text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {match.holes.filter(h => h.team2_player === match.team2.player1.id).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm">{match.team2.player2.name}</span>
                  <span className="bg-[#ff7229] text-white px-2 py-1 rounded text-xs sm:text-sm font-medium">
                    {match.holes.filter(h => h.team2_player === match.team2.player2.id).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full min-w-[300px] table-fixed">
            <colgroup>
              <col className="w-12 sm:w-14" />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 sm:py-4 px-2 text-center font-semibold border-r border-gray-300 text-xs sm:text-sm md:text-base">
                  Hull
                </th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-center font-semibold border-r border-gray-300 text-xs sm:text-sm md:text-base">
                  {match.team1.title}
                </th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm md:text-base">
                  {match.team2.title}
                </th>
              </tr>
            </thead>
            <tbody>
              {match.holes.map((hole) => {
                const team1PlayerId = hole.team1_player;
                const team2PlayerId = hole.team2_player;
                const team1PlayerName = getPlayerName('team1', team1PlayerId);
                const team2PlayerName = getPlayerName('team2', team2PlayerId);

                return (
                  <tr key={hole.number} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium border-r border-gray-300 text-center text-xs sm:text-sm">
                      {hole.number}
                    </td>
                    
                    {/* Team 1 Cell */}
                    <td className="py-2 sm:py-3 px-1 sm:px-4 border-r border-gray-300">
                      {team1PlayerId === 0 ? (
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => handlePlayerSelect(hole.number, 'team1', match.team1.player1.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-[#d4e5cf] text-[#275319] rounded hover:bg-[#c0d9b8] active:bg-[#b0cda8] transition-colors text-xs sm:text-sm whitespace-nowrap"
                          >
                            {match.team1.player1.name}
                          </button>
                          <button
                            onClick={() => handlePlayerSelect(hole.number, 'team1', match.team1.player2.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-[#d4e5cf] text-[#275319] rounded hover:bg-[#c0d9b8] active:bg-[#b0cda8] transition-colors text-xs sm:text-sm whitespace-nowrap"
                          >
                            {match.team1.player2.name}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center relative">
                          <button
                            onClick={() => showRemoveOption(hole.number, 'team1')}
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-[#275319] text-white rounded hover:bg-[#1f4215] active:bg-[#163210] transition-colors font-medium text-xs sm:text-sm md:text-base whitespace-nowrap"
                          >
                            {team1PlayerName}
                          </button>
                          {selectedHole === hole.number && selectedTeam === 'team1' && (
                            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-max">
                              <button
                                onClick={() => handlePlayerRemove(hole.number, 'team1')}
                                className="px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 active:bg-red-100 whitespace-nowrap text-xs sm:text-sm block w-full text-left"
                              >
                                Fjern spiller
                              </button>
                              <button
                                onClick={closeRemoveOption}
                                className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 border-t whitespace-nowrap block w-full text-left text-xs sm:text-sm"
                              >
                                Avbryt
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Team 2 Cell */}
                    <td className="py-2 sm:py-3 px-1 sm:px-4">
                      {team2PlayerId === 0 ? (
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                          <button
                            onClick={() => handlePlayerSelect(hole.number, 'team2', match.team2.player1.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-[#ffe4d6] text-[#ff7229] rounded hover:bg-[#ffd4bf] active:bg-[#ffc4a8] transition-colors text-xs sm:text-sm whitespace-nowrap"
                          >
                            {match.team2.player1.name}
                          </button>
                          <button
                            onClick={() => handlePlayerSelect(hole.number, 'team2', match.team2.player2.id)}
                            className="px-2 sm:px-3 py-1 sm:py-2 bg-[#ffe4d6] text-[#ff7229] rounded hover:bg-[#ffd4bf] active:bg-[#ffc4a8] transition-colors text-xs sm:text-sm whitespace-nowrap"
                          >
                            {match.team2.player2.name}
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center relative">
                          <button
                            onClick={() => showRemoveOption(hole.number, 'team2')}
                            className="px-2 sm:px-4 py-1 sm:py-2 bg-[#ff7229] text-white rounded hover:bg-[#e66424] active:bg-[#cc5620] transition-colors font-medium text-xs sm:text-sm md:text-base whitespace-nowrap"
                          >
                            {team2PlayerName}
                          </button>
                          {selectedHole === hole.number && selectedTeam === 'team2' && (
                            <div className="absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-max">
                              <button
                                onClick={() => handlePlayerRemove(hole.number, 'team2')}
                                className="px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 active:bg-red-100 whitespace-nowrap text-xs sm:text-sm block w-full text-left"
                              >
                                Fjern spiller
                              </button>
                              <button
                                onClick={closeRemoveOption}
                                className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100 border-t whitespace-nowrap block w-full text-left text-xs sm:text-sm"
                              >
                                Avbryt
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Score Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto mt-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-8 text-center break-words px-2">Poeng</h2>
          <table className="w-full min-w-[300px] table-fixed">
            <colgroup>
              <col />
              <col />
            </colgroup>
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-center font-semibold border-r border-gray-300 text-xs sm:text-sm md:text-base">
                  {match.team1.title}
                </th>
                <th className="py-2 sm:py-4 px-2 sm:px-4 text-center font-semibold text-xs sm:text-sm md:text-base">
                  {match.team2.title}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="py-2 sm:py-3 px-2 sm:px-4 border-r border-gray-300">
                  <input
                    type="number"
                    value={match.team1.score || 0}
                    onChange={(e) => handleScoreChange('team1', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent text-center text-sm sm:text-base"
                  />
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <input
                    type="number"
                    value={match.team2.score || 0}
                    onChange={(e) => handleScoreChange('team2', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff7229] focus:border-transparent text-center text-sm sm:text-base"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSend}
            className="bg-green-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-700 active:bg-green-800 transition-colors text-sm sm:text-base"
          >
            Send inn
          </button>
        </div>
      </div>

      {/* Click outside to close remove option */}
      {(selectedHole !== null || selectedTeam !== null) && (
        <div
          className="fixed inset-0 z-0"
          onClick={closeRemoveOption}
        />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </div>
  );
}
