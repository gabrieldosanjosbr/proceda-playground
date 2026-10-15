import { FileJson, SquarePen } from 'lucide-react';
import type { Mode } from '../types';

interface ModeTabsProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeTabs({ mode, onChange }: ModeTabsProps) {
  return (
    <div className="mode-tabs" role="tablist" aria-label="Operação">
      <button
          id="reader-tab"
          role="tab"
          aria-controls="playground-panel"
          aria-selected={mode === 'reader'}
          className={mode === 'reader' ? 'selected' : ''}
          onClick={() => onChange('reader')}
          type="button"
      >
          <FileJson size={18} />Reader (TXT → JSON)
      </button>
      <button
          id="writer-tab"
          role="tab"
          aria-controls="playground-panel"
          aria-selected={mode === 'writer'}
          className={mode === 'writer' ? 'selected' : ''}
          onClick={() => onChange('writer')}
          type="button"
      >
          <SquarePen size={18} />Writer (JSON → TXT)
      </button>
    </div>
  );
}
