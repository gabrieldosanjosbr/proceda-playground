import React, {useEffect, useMemo, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { Check, Copy, Download } from 'lucide-react';
import type { Theme } from '../types';

interface EditorPanelProps {
  title: string;
  value: string;
  downloadBase64?: string;
  language: 'text' | 'json' | 'yaml';
  theme: Theme;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  downloadName?: string;
  controls?: React.ReactNode;
}

export default function EditorPanel({
  title,
  value,
  downloadBase64,
  language,
  theme,
  readOnly = false,
  disabled = false,
  onChange,
  downloadName,
  controls
}: EditorPanelProps) {
  const [copyStatus, setCopyStatus] =
    useState<'idle' | 'copied' | 'failed'>('idle');
  const extensions = useMemo(() => language === 'json' ? [json()] : language === 'yaml' ? [yaml()] : [], [language]);
  const lines = value ? value.split(/\r?\n/).length : 0;
  const size = new Blob([value]).size;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);

      setCopyStatus('copied');

      window.setTimeout(() => {
        setCopyStatus('idle');
      }, 1500);
    } catch {
      setCopyStatus('failed');

      window.setTimeout(() => {
        setCopyStatus('idle');
      }, 1500);
    }
  }

  useEffect(() => {
    setCopyStatus('idle');
  }, [value]);

	function download() {
		let content: BlobPart = value;

		if (downloadBase64) {
			const binary = atob(downloadBase64);

			const buffer = new ArrayBuffer(binary.length);
			const bytes = new Uint8Array(buffer);

			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}

			content = buffer;
		}

		const url = URL.createObjectURL(
			new Blob(
				[content],
				{ type: 'text/plain' },
			),
		);

		const anchor = document.createElement('a');

		anchor.href = url;
		anchor.download = downloadName!;
		anchor.click();

		URL.revokeObjectURL(url);
	}

  return (
    <section className="editor-panel" aria-label={title}>
      <div className="editor-heading"><h3>{title}</h3>{controls}</div>
      <div className="editor-frame">
        <CodeMirror
          value={value}
          height="280px"
          theme={theme === 'dark' ? githubDark : githubLight}
          extensions={extensions}
          editable={!readOnly && !disabled}
          readOnly={readOnly || disabled}
          onChange={onChange}
          aria-label={title}
          basicSetup={{ lineNumbers: true, foldGutter: language !== 'text', highlightActiveLine: !readOnly, autocompletion: false }}
        />
        <div className="editor-footer">
          <div className="editor-stats"><span>Linhas: {lines}</span><span>{readOnly ? `Tamanho: ${(size / 1024).toFixed(2)} KB` : `Caracteres: ${value.length}`}</span></div>
          <div className="editor-actions">
            <button
                type="button"
                onClick={handleCopy}
                disabled={!value}
                aria-label={`Copiar ${title}`}
            >
                {copyStatus === 'copied' ? 'Copiado' : copyStatus === 'failed' ? 'Falha ao copiar' : 'Copiar'}
                {copyStatus === 'copied' ? <Check size={15} /> : <Copy size={15} />}
            </button>
            {downloadName && <button type="button" onClick={download} disabled={!value}>Download<Download size={16} /></button>}
          </div>
        </div>
      </div>
    </section>
  );
}
