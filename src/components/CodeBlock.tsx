import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-slate-300 font-mono text-xs sm:text-sm whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}
