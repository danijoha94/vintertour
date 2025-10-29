'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { matchApi } from '@/lib/api/matchApi';
import { Player, Match } from '@/lib/types/match';
import Modal from '@/components/Modal';

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matchTitle, setMatchTitle] = useState('');
  const [originalDate, setOriginalDate] = useState('');
  const [team1Title, setTeam1Title] = useState('');
  const [team2Title, setTeam2Title] = useState('');
  
  const [team1Player1, setTeam1Player1] = useState<Player>({ id: 1, name: '' });
  const [team1Player2, setTeam1Player2] = useState<Player>({ id: 2, name: '' });
  const [team2Player1, setTeam2Player1] = useState<Player>({ id: 3, name: '' });
  const [team2Player2, setTeam2Player2] = useState<Player>({ id: 4, name: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchId, setMatchId] = useState<number>(0);
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

      setMatchId(data.id);
      
      // Extract date from title (assumes format "name – dd.mm.yy")
      const dateMatch = data.title.match(/–\s*(\d{2}\.\d{2}\.\d{2})$/);
      if (dateMatch) {
        setOriginalDate(dateMatch[1]);
        setMatchTitle(data.title.replace(/\s*–\s*\d{2}\.\d{2}\.\d{2}$/, '').trim());
      } else {
        setMatchTitle(data.title);
      }

      setTeam1Title(data.team1.title);
      setTeam2Title(data.team2.title);
      setTeam1Player1(data.team1.player1);
      setTeam1Player2(data.team1.player2);
      setTeam2Player1(data.team2.player1);
      setTeam2Player2(data.team2.player2);
    } catch (error) {
      console.error('Failed to load match:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullTitle = originalDate ? `${matchTitle} – ${originalDate}` : matchTitle;

      const match = await matchApi.getById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      await matchApi.update(matchId, {
        title: fullTitle,
        team1: {
          title: team1Title,
          player1: team1Player1,
          player2: team1Player2
        },
        team2: {
          title: team2Title,
          player1: team2Player1,
          player2: team2Player2
        }
      });

      router.push('/');
    } catch (error) {
      console.error('Failed to update match:', error);
      setModalMessage('Failed to update match. Please try again.');
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Laster kamp...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Rediger kamp</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Match Title */}
          <div>
            <label htmlFor="matchTitle" className="block text-sm font-medium mb-2">
              Golfbane
            </label>
            <input
              type="text"
              id="matchTitle"
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
              placeholder="e.g., Lofoten links"
            />
            {originalDate && (
              <p className="text-sm text-gray-500 mt-1">Date: {originalDate}</p>
            )}
          </div>

          {/* Team 1 */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Lag 1</h2>
            
            <div>
              <label htmlFor="team1Title" className="block text-sm font-medium mb-2">
                Lagnavn
              </label>
              <input
                type="text"
                id="team1Title"
                value={team1Title}
                onChange={(e) => setTeam1Title(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                placeholder="e.g., Team Alpha"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="team1Player1" className="block text-sm font-medium mb-2">
                  Spiller 1
                </label>
                <input
                  type="text"
                  id="team1Player1"
                  value={team1Player1.name}
                  onChange={(e) => setTeam1Player1({ ...team1Player1, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                  placeholder="Navn"
                />
              </div>

              <div>
                <label htmlFor="team1Player2" className="block text-sm font-medium mb-2">
                  Spiller 2
                </label>
                <input
                  type="text"
                  id="team1Player2"
                  value={team1Player2.name}
                  onChange={(e) => setTeam1Player2({ ...team1Player2, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                  placeholder="Navn"
                />
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Lag 2</h2>
            
            <div>
              <label htmlFor="team2Title" className="block text-sm font-medium mb-2">
                Lagnavn
              </label>
              <input
                type="text"
                id="team2Title"
                value={team2Title}
                onChange={(e) => setTeam2Title(e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                placeholder="e.g., Team Beta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="team2Player1" className="block text-sm font-medium mb-2">
                  Spiller 1
                </label>
                <input
                  type="text"
                  id="team2Player1"
                  value={team2Player1.name}
                  onChange={(e) => setTeam2Player1({ ...team2Player1, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                  placeholder="Navn"
                />
              </div>

              <div>
                <label htmlFor="team2Player2" className="block text-sm font-medium mb-2">
                  Spiller 2
                </label>
                <input
                  type="text"
                  id="team2Player2"
                  value={team2Player2.name}
                  onChange={(e) => setTeam2Player2({ ...team2Player2, name: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#275319] focus:border-transparent"
                  placeholder="Navn"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#275319] text-white py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-[#1f4215] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </div>
  );
}
