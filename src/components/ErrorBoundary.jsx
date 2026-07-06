import React, { Component } from 'react';

/**
 * ErrorBoundary global — évite la page blanche quand une page crashe au rendu.
 * Affiche le message d'erreur + un bouton pour recharger ou revenir au tableau de bord.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, msg: '' };
  }

  static getDerivedStateFromError(e) {
    return { hasError: true, msg: String(e?.message || e) };
  }

  componentDidCatch(e, info) {
    console.error('[CMS ErrorBoundary]', e, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-3">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-lg font-bold text-red-600">Une erreur est survenue</h2>
          <p className="text-sm text-gray-500 max-w-md break-words">{this.state.msg}</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => this.setState({ hasError: false, msg: '' })}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition"
            >
              Réessayer
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              Tableau de bord
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
