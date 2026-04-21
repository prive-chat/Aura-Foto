import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './ui/Logo';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary (Enterprise Grade)
 * Catches runtime crashes and provides a graceful recovery UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL APP ERROR:', error, errorInfo);
    // In a real production app, we would send this to Sentry/LogRocket here:
    // Sentry.captureException(error);
  }

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    const { children } = (this as any).props;

    if ((this as any).state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-studio-bg p-8 text-center animate-in fade-in duration-700">
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
             <Logo size={80} />
          </div>
          
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-serif font-light tracking-tight text-neutral-900 italic">
              Algo interrumpió el aura...
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 leading-relaxed">
              La sesión encontró un error inesperado. Hemos registrado el incidente para optimizar el estudio.
            </p>
            
            <div className="pt-8">
              <Button 
                onClick={(this as any).handleReset}
                className="bg-black text-white rounded-2xl h-14 px-8 gap-3 font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-all shadow-xl shadow-black/10"
              >
                <RefreshCw size={16} /> Reiniciar Experiencia
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40 border border-red-100">
                <p className="text-[10px] font-mono text-red-800 break-all">
                  {(this as any).state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
