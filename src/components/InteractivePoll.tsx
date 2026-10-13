import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, BarChart2, Users, Sparkles } from 'lucide-react';
import { PollData } from '../types';

interface InteractivePollProps {
  initialPoll: PollData;
  onVote?: (updated: PollData) => void;
}

export const InteractivePoll: React.FC<InteractivePollProps> = ({ initialPoll, onVote }) => {
  const [poll, setPoll] = useState<PollData>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setPoll(initialPoll);
  }, [initialPoll]);

  const handleVote = () => {
    if (!selectedOption || hasVoted) return;

    const updatedOptions = poll.options.map((opt) => {
      if (opt.id === selectedOption) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    const newPoll: PollData = {
      ...poll,
      totalVotes: poll.totalVotes + 1,
      options: updatedOptions,
      userVotedOptionId: selectedOption,
    };

    setPoll(newPoll);
    setHasVoted(true);
    if (onVote) onVote(newPoll);
  };

  return (
    <div id="interactive-poll-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-400 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center text-sky-950 shadow-xs font-bold">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-sky-950">
              Jajak Pendapat Publik
            </h3>
            <span className="text-[10px] text-sky-700 font-medium">Suara Pembaca Arun News</span>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-100 px-2.5 py-1 rounded-md border border-sky-200">
          <Users className="w-3 h-3 text-sky-700" />
          {poll.totalVotes.toLocaleString('id-ID')} Suara
        </span>
      </div>

      <p className="text-xs sm:text-sm font-black text-sky-950 mb-1.5 leading-snug">
        {poll.question}
      </p>
      <p className="text-xs text-slate-600 mb-3.5 font-medium">
        {poll.description}
      </p>

      {/* Poll Options */}
      <div className="space-y-2 mb-3.5">
        {poll.options.map((opt) => {
          const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
          const isSelected = selectedOption === opt.id;
          const isUserVote = poll.userVotedOptionId === opt.id;

          if (hasVoted) {
            return (
              <div
                key={opt.id}
                className={`relative rounded-xl p-3 border transition-all overflow-hidden ${
                  isUserVote ? 'border-yellow-400 bg-yellow-100/50 font-bold' : 'border-sky-100 bg-white'
                }`}
              >
                {/* Progress bar fill */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${
                    isUserVote ? 'bg-yellow-300/60' : 'bg-sky-100/80'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {isUserVote && <CheckCircle2 className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0" />}
                    <span className="text-sky-950 font-bold">{opt.text}</span>
                  </div>
                  <span className="font-black text-sky-900 whitespace-nowrap pl-2 font-mono">
                    {percentage}% ({opt.votes.toLocaleString('id-ID')})
                  </span>
                </div>
              </div>
            );
          }

          return (
            <label
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'border-yellow-400 bg-yellow-50/80 ring-2 ring-yellow-200 font-bold'
                  : 'border-sky-200 bg-white hover:border-sky-400 hover:bg-sky-50/40'
              }`}
            >
              <input
                type="radio"
                name="poll-option"
                checked={isSelected}
                onChange={() => setSelectedOption(opt.id)}
                className="mt-0.5 text-yellow-500 focus:ring-yellow-400"
              />
              <span className="font-medium text-sky-950">{opt.text}</span>
            </label>
          );
        })}
      </div>

      {/* Submit Button or Thank You */}
      {!hasVoted ? (
        <button
          id="submit-poll-btn"
          onClick={handleVote}
          disabled={!selectedOption}
          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs ${
            selectedOption
              ? 'bg-yellow-400 hover:bg-yellow-300 text-sky-950 border border-yellow-500 cursor-pointer active:scale-98'
              : 'bg-sky-100 text-sky-400 cursor-not-allowed border border-sky-200'
          }`}
        >
          Kirim Pilihan Saya
        </button>
      ) : (
        <div className="bg-emerald-50 text-emerald-900 rounded-xl p-2.5 text-center text-xs font-bold border border-emerald-300 flex items-center justify-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Terima kasih atas partisipasi Anda dalam jajak pendapat publik!
        </div>
      )}
    </div>
  );
};
