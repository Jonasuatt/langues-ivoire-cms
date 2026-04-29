import { useState, useRef, useEffect, useCallback } from 'react';
import { languagesAPI, agentChatAPI } from '../services/api';
import {
  PaperAirplaneIcon, SpeakerWaveIcon, SpeakerXMarkIcon, TrashIcon,
  CpuChipIcon, BookOpenIcon, MicrophoneIcon, ExclamationTriangleIcon,
  StopCircleIcon,
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

// ── Web Speech API — TTS navigateur ─────────────────────────────────────────
const AGENT_VOICES = {
  F: { pitch: 1.25, rate: 0.88, lang: 'fr-FR' },
  M: { pitch: 0.82, rate: 1.0,  lang: 'fr-FR' },
};

function speakText(text, gender = 'F', onEnd = null) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const cfg = AGENT_VOICES[gender] || AGENT_VOICES.F;
  utter.lang  = cfg.lang;
  utter.pitch = cfg.pitch;
  utter.rate  = cfg.rate;

  // Préférer une voix française si disponible
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang.startsWith('fr') && (gender === 'F' ? !v.name.includes('Male') : true));
  if (frVoice) utter.voice = frVoice;

  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── Agents disponibles ───────────────────────────────────────────────────────
const AGENTS = [
  {
    key: 'female',
    name: 'Zélé',
    gender: 'F',
    color: '#AD1457',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-800',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face&auto=format&q=80',
    desc: 'Douce et patiente · voix féminine',
  },
  {
    key: 'male',
    name: 'Kouadio',
    gender: 'M',
    color: '#1565C0',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&h=80&fit=crop&crop=face&auto=format&q=80',
    desc: 'Dynamique et encourageant · voix masculine',
  },
];

// ── Badge source ─────────────────────────────────────────────────────────────
function SourceBadge({ source }) {
  if (source === 'database' || source === 'dictionary') {
    const isAudio = source === 'database';
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isAudio ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
        {isAudio ? <MicrophoneIcon className="w-3 h-3" /> : <BookOpenIcon className="w-3 h-3" />}
        {isAudio ? 'Audio validé' : 'Dictionnaire'}
      </span>
    );
  }
  if (source === 'ai') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
        <CpuChipIcon className="w-3 h-3" />
        Réponse IA — vérifiez la prononciation
      </span>
    );
  }
  if (source === 'unavailable') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
        <ExclamationTriangleIcon className="w-3 h-3" />
        Non trouvé — enrichissez la base
      </span>
    );
  }
  return null;
}

// ── Bulle de message ─────────────────────────────────────────────────────────
function MessageBubble({ msg, agent, onPlayAudio, onSpeak, isSpeaking }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <img src={agent.image} alt={agent.name}
          className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 mt-1 border-2"
          style={{ borderColor: agent.color }} />
      )}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
        }`}>
          {msg.text}
        </div>
        {!isUser && msg.source && (
          <div className="flex items-center gap-2 px-1 flex-wrap">
            <SourceBadge source={msg.source} />
            {/* Bouton lecture audio humain */}
            {msg.audioUrl && (
              <button onClick={() => onPlayAudio(msg.audioUrl)}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition-colors">
                <MicrophoneIcon className="w-3.5 h-3.5" />
                Audio original
              </button>
            )}
            {/* Bouton TTS navigateur */}
            <button onClick={() => onSpeak(msg.text)}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors">
              <SpeakerWaveIcon className="w-3.5 h-3.5" />
              Écouter
            </button>
            {msg.mot && (
              <span className="text-xs text-gray-400">· {msg.mot}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AgentsTestPage() {
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);   // lecture auto activée par défaut
  const [stats, setStats] = useState({ database: 0, dictionary: 0, ai: 0, unavailable: 0 });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les langues
  useEffect(() => {
    languagesAPI.getAll().then(({ data }) => {
      const langs = Array.isArray(data) ? data : data.languages || [];
      setLanguages(langs);
      if (langs.length > 0) setSelectedLang(langs[0]);
    }).catch(() => {});
  }, []);

  // Charger les voix TTS dès que possible (navigateur lazy-load)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => stopSpeech();
  }, []);

  // Scroll auto
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
  }, [chatHistory]);

  // Jouer un audio (enregistrement humain)
  const playAudio = useCallback((url) => {
    stopSpeech();
    try { new Audio(url).play(); } catch (_) {}
  }, []);

  // Lecture TTS d'un texte avec la voix de l'agent actif
  const handleSpeak = useCallback((text) => {
    setIsSpeaking(true);
    speakText(text, selectedAgent.gender, () => setIsSpeaking(false));
  }, [selectedAgent.gender]);

  // Arrêter la lecture
  const handleStop = () => { stopSpeech(); setIsSpeaking(false); };

  // Envoyer un message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedLang || loading) return;

    stopSpeech();
    setIsSpeaking(false);
    setChatHistory(h => [...h, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await agentChatAPI.ask({
        message: text,
        langCode: selectedLang.code,
        agentName: selectedAgent.name,
        agentGender: selectedAgent.gender,
      });

      const agentMsg = {
        role: 'agent',
        text: data.response,
        source: data.source,
        audioUrl: data.audioUrl,
        mot: data.mot,
        traduction: data.traduction,
      };
      setChatHistory(h => [...h, agentMsg]);
      setStats(s => ({ ...s, [data.source]: (s[data.source] || 0) + 1 }));

      // Lecture automatique de la réponse
      if (autoSpeak) {
        if (data.audioUrl) {
          // Audio humain prioritaire
          playAudio(data.audioUrl);
        } else {
          // TTS navigateur
          setIsSpeaking(true);
          speakText(data.response, selectedAgent.gender, () => setIsSpeaking(false));
        }
      }

    } catch {
      setChatHistory(h => [...h, {
        role: 'agent',
        text: 'Erreur de connexion. Vérifiez que l\'API est en ligne.',
        source: 'error',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    stopSpeech();
    setIsSpeaking(false);
    setChatHistory([]);
    setStats({ database: 0, dictionary: 0, ai: 0, unavailable: 0 });
  };

  const totalMessages = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* En-tête */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              Test des Agents IA
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Dialoguez avec Zélé ou Kouadio pour tester les réponses avant la mise en ligne
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bouton stop lecture */}
            {isSpeaking && (
              <button onClick={handleStop}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors animate-pulse">
                <StopCircleIcon className="w-4 h-4" />
                Stop
              </button>
            )}
            {/* Bouton muet / son */}
            <button onClick={() => { setAutoSpeak(v => !v); if (isSpeaking) handleStop(); }}
              title={autoSpeak ? 'Désactiver la lecture automatique' : 'Activer la lecture automatique'}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                autoSpeak
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {autoSpeak
                ? <SpeakerWaveIcon className="w-4 h-4" />
                : <SpeakerXMarkIcon className="w-4 h-4" />}
              {autoSpeak ? 'Son activé' : 'Muet'}
            </button>
            {totalMessages > 0 && (
              <button onClick={clearChat}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                <TrashIcon className="w-4 h-4" />
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panneau gauche — Configuration */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Sélection langue */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Langue
              </label>
              <div className="space-y-1.5">
                {languages.map(lang => (
                  <button key={lang.id}
                    onClick={() => { setSelectedLang(lang); clearChat(); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLang?.id === lang.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}>
                    {lang.nom}
                    {selectedLang?.id === lang.id && (
                      <span className="float-right text-xs opacity-70">sélectionnée</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sélection agent */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Agent
              </label>
              <div className="space-y-2">
                {AGENTS.map(agent => (
                  <button key={agent.key}
                    onClick={() => { setSelectedAgent(agent); clearChat(); }}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all border-2 ${
                      selectedAgent.key === agent.key
                        ? `${agent.border} ${agent.bg} shadow-sm`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <div className="flex items-center gap-3">
                      <img src={agent.image} alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: selectedAgent.key === agent.key ? agent.color : '#e5e7eb' }} />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statistiques de session */}
            {totalMessages > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Statistiques session
                </label>
                <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                  {[
                    { key: 'database', label: 'Audio validé', color: 'bg-purple-500' },
                    { key: 'dictionary', label: 'Dictionnaire', color: 'bg-green-500' },
                    { key: 'ai', label: 'Claude IA', color: 'bg-amber-500' },
                    { key: 'unavailable', label: 'Non trouvé', color: 'bg-gray-400' },
                  ].map(({ key, label, color }) => stats[key] > 0 && (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-gray-600">{label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-900">{stats[key]}</span>
                        <span className="text-gray-400 text-xs">
                          ({Math.round(stats[key] / totalMessages * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>Total questions</span>
                    <span className="font-semibold">{totalMessages}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Questions suggérées */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Questions suggérées
              </label>
              <div className="space-y-1.5">
                {[
                  'Comment dit-on bonjour ?',
                  'Traduction de merci',
                  'Comment dit-on père ?',
                  'Comment compter jusqu\'à 10 ?',
                  'Comment dire je t\'aime ?',
                  'Traduction de eau',
                  'Comment saluer le soir ?',
                ].map((q) => (
                  <button key={q}
                    onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-600 hover:text-primary-700 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

          {/* En-tête agent actif */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
            <img src={selectedAgent.image} alt={selectedAgent.name}
              className="w-10 h-10 rounded-full object-cover border-2"
              style={{ borderColor: selectedAgent.color }} />
            <div>
              <div className="font-semibold text-gray-900">{selectedAgent.name}</div>
              <div className="text-xs text-gray-500">
                {selectedLang ? `Spécialiste ${selectedLang.nom}` : 'Sélectionnez une langue'}
              </div>
            </div>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${selectedAgent.badge}`}>
              {selectedAgent.gender === 'F' ? '♀ Voix féminine' : '♂ Voix masculine'}
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <img src={selectedAgent.image} alt={selectedAgent.name}
                  className="w-20 h-20 rounded-full object-cover mb-4 border-4"
                  style={{ borderColor: selectedAgent.color }} />
                <p className="font-semibold text-gray-700 text-lg">
                  Bonjour ! Je suis {selectedAgent.name}
                </p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  {selectedLang
                    ? `Posez-moi une question sur le ${selectedLang.nom} — je puise d'abord dans la base de données, puis dans Claude IA si nécessaire.`
                    : 'Sélectionnez une langue à gauche pour commencer.'}
                </p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <MessageBubble key={i} msg={msg} agent={selectedAgent}
                  onPlayAudio={playAudio} onSpeak={handleSpeak} isSpeaking={isSpeaking} />
              ))
            )}
            {loading && (
              <div className="flex justify-start mb-3">
                <img src={selectedAgent.image} alt={selectedAgent.name}
                  className="w-8 h-8 rounded-full object-cover mr-2 border-2"
                  style={{ borderColor: selectedAgent.color }} />
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={selectedLang ? `Posez une question sur le ${selectedLang.nom}…` : 'Sélectionnez d\'abord une langue'}
                disabled={!selectedLang || loading}
                rows={1}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                style={{ minHeight: '42px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || !selectedLang || loading}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: input.trim() && selectedLang ? selectedAgent.color : '#e5e7eb' }}>
                <PaperAirplaneIcon className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Entrée pour envoyer · Maj+Entrée pour nouvelle ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
