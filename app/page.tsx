'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { matchApi } from '@/lib/api/matchApi';
import { Match } from '@/lib/types/match';
import ConfirmModal from '@/components/ConfirmModal';

export default function Home() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchApi.getAll();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setMatchToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (matchToDelete === null) return;
    
    try {
      await matchApi.delete(matchToDelete);
      await loadMatches();
    } catch (error) {
      console.error('Failed to delete match:', error);
    } finally {
      setConfirmModalOpen(false);
      setMatchToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmModalOpen(false);
    setMatchToDelete(null);
  };

  return (
    <>
      <header className="bg-[#275319] text-white p-3 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-center">
          <img src="/Logo.png" alt="Golf Matches" className="h-12 sm:h-16 md:h-20 object-contain" />
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Registrer utslag</h2>
          <Link
            href="/matches/new"
            className="bg-[#275319] text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-[#1f4215] transition-colors text-sm sm:text-base w-full sm:w-auto text-center"
          >
            Ny kamp +
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-600">Laster inn kamper...</p>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4 px-4">Ingen kamper ennå. Registrer din første kamp!</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow relative cursor-pointer"
                onClick={() => router.push(`/matches/${match.id}`)}
              >
                <div className="p-3 sm:p-6">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-xl font-semibold hover:text-[#275319] break-words">
                      {match.title}
                    </h3>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-gray-700 text-sm sm:text-base">{match.team1.title} vs {match.team2.title}</h4>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3 px-3 sm:px-6 pb-3 sm:pb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/matches/${match.id}/edit`);
                    }}
                    className="text-[#275319] hover:text-[#1a3310] text-xs sm:text-sm font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded border border-gray-200"
                  >
                    Rediger
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(match.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded border border-gray-200"
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        message="Er du sikker på at du vil slette denne kampen?"
        confirmText="Slett"
        cancelText="Avbryt"
      />
    </>
  );
}
