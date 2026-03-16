import React, { useState, useEffect } from 'react';
import type { GameStoreData } from '../../store/gameStore';
import { saveGameData } from '../../store/gameStore';
import { redeemMysteryBoxByCode, fetchUserMysteryBoxes } from '../../lib/gameService';
import type { MysteryBoxWithDetails } from '../../lib/gameService';
import dimsumImg from '../../assets/dimsum.png';
import chestClosed from '../../assets/underwater/Neutral/æhest_closed.webp';
import chestAjar from '../../assets/underwater/Neutral/æhest_ajar.webp';
import chestOpen from '../../assets/underwater/Neutral/æhest_open.webp';
import coinImg from '../../assets/underwater/Bonus/Coin.webp';
import crownImg from '../../assets/underwater/Bonus/Crown.webp';
import pearlImg from '../../assets/underwater/Bonus/Pearl.webp';
import heartImg from '../../assets/underwater/Bonus/Heart.webp';
import shieldImg from '../../assets/underwater/Bonus/Shield.webp';
import arenaBg from '../../assets/arena_background.webp';

interface MysteryBoxScreenProps {
  storeData: GameStoreData;
  onBack: () => void;
  onDataChange: (data: GameStoreData) => void;
  onSpinWheel?: () => void;
  userId?: string;
}

type Phase = 'input' | 'opening' | 'revealed' | 'history';

export const MysteryBoxScreen: React.FC<MysteryBoxScreenProps> = ({
  storeData,
  onBack,
  onDataChange,
  onSpinWheel,
  userId,
}) => {
  const [phase, setPhase] = useState<Phase>('input');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openedBox, setOpenedBox] = useState<MysteryBoxWithDetails | null>(null);
  const [chestState, setChestState] = useState<'closed' | 'ajar' | 'open'>('closed');
  const [showReward, setShowReward] = useState(false);
  const [userBoxes, setUserBoxes] = useState<MysteryBoxWithDetails[]>([]);
  const [loadingBoxes, setLoadingBoxes] = useState(false);

  // Fetch user's mystery boxes from Supabase
  useEffect(() => {
    if (userId) {
      setLoadingBoxes(true);
      fetchUserMysteryBoxes(userId)
        .then(setUserBoxes)
        .finally(() => setLoadingBoxes(false));
    }
  }, [userId]);

  const handleRedeem = async () => {
    setError('');
    if (!code.trim()) {
      setError('Enter a redemption code');
      return;
    }
    if (!userId) {
      setError('Please log in to redeem codes');
      return;
    }

    setLoading(true);
    try {
      if (storeData.tickets <= 0) {
        setError('You need at least 1 ticket to open a mystery box');
        setLoading(false);
        return;
      }

      const result = await redeemMysteryBoxByCode(userId, code.trim());

      if (!result.success || !result.box) {
        setError(result.error || 'Invalid or already redeemed code');
        setLoading(false);
        return;
      }

      setOpenedBox(result.box);
      const updatedStoreData = {
        ...storeData,
        tickets: Math.max(0, storeData.tickets - 1),
        ticketsUsed: storeData.ticketsUsed + 1,
      };
      saveGameData(updatedStoreData);
      onDataChange(updatedStoreData);
      setPhase('opening');

      // Refresh the user boxes list
      fetchUserMysteryBoxes(userId).then(setUserBoxes);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Chest opening animation sequence
  useEffect(() => {
    if (phase !== 'opening') return;
    const t1 = setTimeout(() => setChestState('ajar'), 800);
    const t2 = setTimeout(() => setChestState('open'), 1800);
    const t3 = setTimeout(() => {
      setPhase('revealed');
      setShowReward(true);
    }, 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  const chestImages = { closed: chestClosed, ajar: chestAjar, open: chestOpen };

  const pendingBoxes = userBoxes.filter(b => b.status === 'pending');
  const openedBoxes = userBoxes.filter(b => b.status === 'opened');

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url(${arenaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 'max(8px, env(safe-area-inset-top, 8px))',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
      }}
    >
      <div className="absolute inset-0 bg-black/45 pointer-events-none" />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-2 px-3 py-2 mx-2 mb-2"
        style={{
          background: 'linear-gradient(180deg, rgba(62,40,20,0.92) 0%, rgba(40,26,12,0.95) 100%)',
          borderRadius: '12px',
          border: '2px solid rgba(180,140,60,0.5)',
          boxShadow: '0 3px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.15)',
        }}
      >
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90"
          style={{
            background: 'linear-gradient(180deg, rgba(80,50,20,0.8) 0%, rgba(50,30,10,0.9) 100%)',
            border: '1px solid rgba(180,140,60,0.4)',
          }}
        >
          <span className="text-amber-400 text-lg font-black">‹</span>
        </button>
        <div className="flex items-center gap-2 flex-1">
          <img src={chestClosed} alt="" className="w-6 h-6" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }} />
          <h1 className="text-sm font-black text-amber-100 tracking-wide"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >MYSTERY BOX</h1>
        </div>
        {/* Tab buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => setPhase('input')}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold transition ${
              phase !== 'history' ? 'text-amber-200 bg-amber-900/50' : 'text-amber-600/40'
            }`}
            style={{ border: '1px solid rgba(180,140,60,0.2)' }}
          >Redeem</button>
          <button
            onClick={() => setPhase('history')}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold transition ${
              phase === 'history' ? 'text-amber-200 bg-amber-900/50' : 'text-amber-600/40'
            }`}
            style={{ border: '1px solid rgba(180,140,60,0.2)' }}
          >My Boxes ({userBoxes.length})</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto">
        {phase === 'input' && (
          <InputPhase
            code={code}
            onCodeChange={setCode}
            error={error}
            loading={loading}
            pendingCount={pendingBoxes.length}
            onRedeem={handleRedeem}
          />
        )}

        {phase === 'opening' && (
          <OpeningPhase chestImage={chestImages[chestState]} chestState={chestState} />
        )}

        {phase === 'revealed' && openedBox && (
          <RevealedPhase
            box={openedBox}
            showReward={showReward}
            onClose={() => {
              setPhase('input');
              setCode('');
              setChestState('closed');
              setShowReward(false);
              setOpenedBox(null);
            }}
          />
        )}

        {phase === 'history' && (
          <HistoryPhase
            boxes={userBoxes}
            loading={loadingBoxes}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Input Phase ──────────────────────────────────────────────────────── */

const InputPhase: React.FC<{
  code: string;
  onCodeChange: (c: string) => void;
  error: string;
  loading: boolean;
  pendingCount: number;
  onRedeem: () => void;
}> = ({ code, onCodeChange, error, loading, pendingCount, onRedeem }) => (
  <div className="w-full max-w-xs space-y-4">
    {/* Chest Display */}
    <div className="flex flex-col items-center mb-2">
      <img src={chestClosed} alt="" className="w-24 h-24 mb-3"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))', animation: 'chestFloat 2s ease-in-out infinite' }}
      />
      <p className="text-sm font-bold text-amber-300 text-center">Enter your code to open!</p>
      <p className="text-[10px] text-amber-600/60 text-center mt-1">Need 1 ticket + random code from admin</p>
    </div>

    {/* Pending boxes notification */}
    {pendingCount > 0 && (
      <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-2"
        style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}
      >
        <img src={chestClosed} alt="" className="w-5 h-5" />
        <span className="text-xs font-bold text-amber-400">
          {pendingCount} mystery box{pendingCount > 1 ? 'es' : ''} with code waiting!
        </span>
      </div>
    )}

    {/* Code Input */}
    <div className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
        border: '2px solid rgba(180,140,60,0.3)',
      }}
    >
      <label className="text-[9px] font-bold text-amber-500/70 uppercase tracking-wider mb-1.5 block">
        Redemption Code
      </label>
      <input
        type="text"
        value={code}
        onChange={e => onCodeChange(e.target.value.toUpperCase())}
        placeholder="MB-XXXXXXXX"
        className="w-full px-3 py-2.5 rounded-lg text-sm font-bold text-amber-200 placeholder-amber-800/40 text-center tracking-[0.2em] outline-none"
        style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(180,140,60,0.2)',
        }}
      />
      {error && (
        <p className="text-[10px] text-red-400 text-center mt-2 font-bold">{error}</p>
      )}
    </div>

    {/* Redeem Button */}
    <button onClick={onRedeem}
      disabled={loading}
      className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest transition active:scale-[0.97] flex items-center justify-center gap-2"
      style={{
        background: loading
          ? 'rgba(60,40,20,0.5)'
          : 'linear-gradient(180deg, #b45309 0%, #78350f 100%)',
        border: `2px solid ${loading ? 'rgba(80,60,30,0.2)' : 'rgba(251,191,36,0.4)'}`,
        boxShadow: loading ? 'none' : '0 4px 12px rgba(180,100,10,0.3), inset 0 1px 0 rgba(255,215,0,0.15)',
        color: loading ? 'rgba(180,140,60,0.3)' : '#fef3c7',
        textShadow: loading ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <span className="animate-pulse">Opening...</span>
      ) : (
        <>
          <img src={chestClosed} alt="" className="w-5 h-5" style={{ filter: 'brightness(1.3)' }} />
          Open Box
        </>
      )}
    </button>

    <style>{`
      @keyframes chestFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
    `}</style>
  </div>
);

/* ─── Opening Phase ────────────────────────────────────────────────────── */

const OpeningPhase: React.FC<{
  chestImage: string;
  chestState: string;
}> = ({ chestImage, chestState }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="absolute inset-0 -m-8 rounded-full"
        style={{
          background: `radial-gradient(circle, ${
            chestState === 'open' ? 'rgba(251,191,36,0.3)' : 'rgba(251,191,36,0.1)'
          }, transparent 70%)`,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <img src={chestImage} alt=""
        className="w-32 h-32 relative z-10"
        style={{
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6))',
          animation: chestState === 'ajar' ? 'chestShake 0.3s ease-in-out infinite' : undefined,
          transform: chestState === 'open' ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.5s ease-out',
        }}
      />
    </div>
    <p className="text-sm font-bold text-amber-400 mt-4 animate-pulse"
      style={{ textShadow: '0 0 8px rgba(251,191,36,0.4)' }}
    >
      {chestState === 'closed' ? 'Preparing...' : chestState === 'ajar' ? 'Opening...' : 'Revealing!'}
    </p>
    <style>{`
      @keyframes chestShake {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

/* ─── Revealed Phase ───────────────────────────────────────────────────── */

const RevealedPhase: React.FC<{
  box: MysteryBoxWithDetails;
  showReward: boolean;
  onClose: () => void;
}> = ({ box, showReward, onClose }) => {
  const hasPrize = !!box.prize_name;
  const hasCard = !!box.card_title;

  return (
    <div className={`flex flex-col items-center w-full max-w-xs transition-all duration-700 ${showReward ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      {/* Reward glow */}
      <div className="relative mb-4">
        <div className="absolute inset-0 -m-12 rounded-full"
          style={{
            background: hasCard
              ? 'radial-gradient(circle, rgba(192,132,252,0.3), transparent 70%)'
              : 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)',
          }}
        />
        <div className="relative z-10 w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{
            background: 'linear-gradient(135deg, rgba(62,40,20,0.9) 0%, rgba(40,26,12,0.95) 100%)',
            border: hasCard
              ? '3px solid rgba(192,132,252,0.5)'
              : '3px solid rgba(180,140,60,0.5)',
            boxShadow: `0 0 20px ${hasCard ? 'rgba(192,132,252,0.2)' : 'rgba(180,140,60,0.2)'}`,
          }}
        >
          {box.prize_icon || box.card_icon || '🎁'}
        </div>
      </div>

      {/* Reward Info */}
      <div className="w-full rounded-xl p-4 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(62,40,20,0.9) 0%, rgba(40,26,12,0.95) 100%)',
          border: `2px solid ${hasCard ? 'rgba(192,132,252,0.3)' : 'rgba(180,140,60,0.3)'}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-wider mb-1">You received</p>

        {hasPrize && (
          <>
            <h3 className="text-base font-black text-amber-200 mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {box.prize_icon} {box.prize_name}
            </h3>
            <p className="text-xs text-amber-500/60">{box.prize_description}</p>
          </>
        )}

        {/* Greeting card message */}
        {hasCard && (
          <div className="mt-3 rounded-lg px-3 py-3"
            style={{
              background: box.card_background_color || 'rgba(192,132,252,0.1)',
              border: '1px solid rgba(192,132,252,0.2)',
            }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: box.card_text_color || '#e9d5ff' }}>
              {box.card_icon} {box.card_title}
            </p>
            <p className="text-xs italic leading-relaxed" style={{ color: box.card_text_color || '#c4b5fd' }}>
              {box.card_message}
            </p>
          </div>
        )}

        {/* Custom message from admin */}
        {box.custom_message && (
          <div className="mt-2 rounded-lg px-3 py-2"
            style={{ background: 'rgba(180,140,60,0.1)', border: '1px solid rgba(180,140,60,0.2)' }}
          >
            <p className="text-[10px] text-amber-400 italic">"{box.custom_message}"</p>
          </div>
        )}

        {!hasPrize && !hasCard && (
          <h3 className="text-base font-black text-amber-200 mb-1">🎁 Mystery Gift</h3>
        )}
      </div>

      {/* Close button */}
      <button onClick={onClose}
        className="mt-4 px-8 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.97]"
        style={{
          background: 'linear-gradient(180deg, rgba(80,50,20,0.8) 0%, rgba(50,30,10,0.9) 100%)',
          border: '2px solid rgba(180,140,60,0.3)',
          color: '#d4a547',
        }}
      >
        Collect
      </button>
    </div>
  );
};

/* ─── History Phase ────────────────────────────────────────────────────── */

const HistoryPhase: React.FC<{
  boxes: MysteryBoxWithDetails[];
  loading: boolean;
}> = ({ boxes, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-xs text-amber-500/60 mt-3">Loading...</p>
      </div>
    );
  }

  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <img src={chestClosed} alt="" className="w-16 h-16 opacity-30 mb-3" />
        <p className="text-sm text-amber-500/40 font-bold">No mystery boxes yet</p>
        <p className="text-[10px] text-amber-600/30 mt-1">Ask admin for a mystery box code!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-2 pb-4">
      {boxes.map((box) => (
        <div key={box.id} className="rounded-xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(62,40,20,0.85) 0%, rgba(40,26,12,0.9) 100%)',
            border: `2px solid ${box.status === 'opened' ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{
                background: box.status === 'opened' ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)',
              }}
            >
              {box.status === 'opened' ? (box.prize_icon || '✅') : '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-200 truncate">
                {box.prize_name || box.name || 'Mystery Box'}
              </p>
              <p className="text-[9px] text-amber-500/50 font-mono">
                {box.redemption_code}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                box.status === 'opened'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {box.status === 'opened' ? 'Opened' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Show card message if opened */}
          {box.status === 'opened' && box.card_message && (
            <div className="mt-2 rounded-lg px-2 py-1.5"
              style={{
                background: box.card_background_color || 'rgba(192,132,252,0.1)',
                border: '1px solid rgba(192,132,252,0.15)',
              }}
            >
              <p className="text-[9px] italic" style={{ color: box.card_text_color || '#c4b5fd' }}>
                {box.card_message.substring(0, 80)}...
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
