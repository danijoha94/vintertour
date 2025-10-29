'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { matchApi } from '@/lib/api/matchApi';
import { Player } from '@/lib/types/match';
import Modal from '@/components/Modal';

export default function NewMatchPage() {
  const router = useRouter();
  const [matchTitle, setMatchTitle] = useState('');
  const [team1Title, setTeam1Title] = useState('');
  const [team2Title, setTeam2Title] = useState('');
  
  const [team1Player1, setTeam1Player1] = useState<Player>({ id: 1, name: '' });
  const [team1Player2, setTeam1Player2] = useState<Player>({ id: 2, name: '' });
  const [team2Player1, setTeam2Player1] = useState<Player>({ id: 3, name: '' });
  const [team2Player2, setTeam2Player2] = useState<Player>({ id: 4, name: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date();
      const day = now.getDate().toString().padStart(2, '0');
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const year = now.getFullYear().toString().slice(-2);
      const formattedDate = `${day}.${month}.${year}`;
      const fullTitle = `${matchTitle} – ${formattedDate}`;

      const holes = Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        team1_player: 0,
        team2_player: 0
      }));

      await matchApi.create({
        title: fullTitle,
        team1: {
          title: team1Title,
          player1: team1Player1,
          player2: team1Player2,
          score: 0
        },
        team2: {
          title: team2Title,
          player1: team2Player1,
          player2: team2Player2,
          score: 0
        },
        holes
      });

      router.push('/');
    } catch (error) {
      console.error('Failed to create match:', error);
      setModalMessage('Failed to create match. Please try again.');
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Registrer en ny kamp</h1>
        
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
              className="flex-1 bg-[#275319] text-white py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-[#1f4215] active:bg-[#163210] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 transition-colors"
            >
              {isSubmitting ? 'Lagrer...' : 'Opprett kamp'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
