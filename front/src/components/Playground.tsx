import { useEffect, useState } from 'react';
import { stringify } from 'yaml';

import {
	getLayouts,
	processDocument,
	getScenario,
	write
} from '../services/proceda';

import type {
    Issue,
    LayoutOption,
    Mode,
    OutputFormat,
    Theme,
	Scenario
} from '../types';

import ModeTabs from './ModeTabs';
import Toolbar from './Toolbar';
import EditorPanel from './EditorPanel';
import IssuesTable from './IssuesTable';

export default function Playground({ theme }: { theme: Theme }) {
    const [mode, setMode] = useState<Mode>('reader');

    const [layouts, setLayouts] = useState<LayoutOption[]>([]);
    const [layout, setLayout] = useState<string | null>(null);
    const [version, setVersion] = useState<string | null>(null);

    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [issues, setIssues] = useState<Issue[]>([]);
    const [format, setFormat] = useState<OutputFormat>('json');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
	const [loadingScenario, setLoadingScenario] = useState(false);
	const [rawOutput, setRawOutput] = useState<string | null>(null);
	const [tabReplacementSize, setTabReplacementSize] = useState<number>(1);

    useEffect(() => {
        getLayouts()
            .then((layouts) => {
                setLayouts(layouts);

                const firstLayout = layouts[0];
                const firstVersion = firstLayout?.versions[0];

                if (!firstLayout || !firstVersion) {
                    throw new Error('Nenhum layout disponível.');
                }

                setLayout(firstLayout.value);
                setVersion(firstVersion.value);
            })
            .catch((cause) => {
                setError(
                    cause instanceof Error
                        ? cause.message
                        : 'Não foi possível carregar os layouts.',
                );
            });
    }, []);

    function clearResult() {
        setOutput('');
        setIssues([]);
        setError('');
    }

    function changeMode(nextMode: Mode) {
        if (busy || nextMode === mode) {
            return;
        }

        setMode(nextMode);
        setInput('');
        clearResult();
    }

    function changeLayout(value: string) {
        const selectedLayout = layouts.find(
            (layout) => layout.value === value,
        );

        const firstVersion = selectedLayout?.versions[0];

        if (!selectedLayout || !firstVersion) {
            return;
        }

        setLayout(selectedLayout.value);
        setVersion(firstVersion.value);
		setInput('');

        clearResult();
    }

    function changeVersion(value: string) {
        setVersion(value);
		setInput('');
		clearResult();
    }

    async function process() {
        clearResult();

        if (!layout || !version) {
            setError('Selecione um layout e uma versão.');
            return;
        }

        if (!input.trim()) {
            setError('Informe um conteúdo antes de processar.');
            return;
        }

        setBusy(true);

        try {
            const result = await processDocument({
                mode,
                layout,
                version,
				tabReplacementSize,
                content: input,
            });

            setOutput(result.content);
			setRawOutput(result.rawContent ?? null);
            setIssues(result.issues);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : 'Não foi possível processar o documento.',
            );
        } finally {
            setBusy(false);
        }
    }

    const displayedOutput =
        mode === 'reader' && format === 'yaml' && output
            ? stringify(JSON.parse(output))
            : output;

	const handleScenario = async (
		scenario: Scenario,
	) => {
		setLoadingScenario(true);

		try {
			const data = await getScenario(scenario);

			setInput(JSON.stringify(data, null, 2));
			clearResult();
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingScenario(false);
		}
	};

	async function generateExample(
		scenario: Scenario,
	) {
		if (!layout || !version) {
			return;
		}

		setLoadingScenario(true);
		clearResult();

		try {
			const data = await getScenario(scenario);

			const result = await write(
				layout,
				version,
				JSON.stringify(data),
			);

			setInput(result.content);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: 'Não foi possível gerar o exemplo.',
			);
		} finally {
			setLoadingScenario(false);
		}
	}

    return (
        <section
            className="playground"
            id="demo"
            aria-label="Playground PROCEDA"
        >
            <ModeTabs
                mode={mode}
                onChange={changeMode}
            />

            <div
                className="playground-body"
                id="playground-panel"
                role="tabpanel"
                aria-labelledby={`${mode}-tab`}
            >
                <Toolbar
                    layouts={layouts}
                    layout={layout}
                    version={version}
                    mode={mode}
                    busy={busy}
                    loadingScenario={loadingScenario}
                    onLayoutChange={changeLayout}
                    onVersionChange={changeVersion}
                    onScenario={handleScenario}
                    onGenerateExample={generateExample}
                    onClear={() => {
                        setInput('');
                        clearResult();
                    }}
                    onProcess={process}
                    tabReplacementSize={tabReplacementSize}
                    onTabReplacementSizeChange={setTabReplacementSize}
                />

                {error && (
                    <p
                        className="error-message"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <div className="editors-grid">
                    <EditorPanel
                        title={
                            mode === 'reader'
                                ? 'PROCEDA (TXT)'
                                : 'Documento (JSON)'
                        }
                        value={input}
                        language={mode === 'reader' ? 'text' : 'json'}
                        theme={theme}
                        disabled={busy}
                        onChange={(value) => {
                            setInput(value);
                            clearResult();
                        }}
                    />

                    <EditorPanel
                        title={
                            mode === 'reader'
                                ? `${format.toUpperCase()} (Resultado)`
                                : 'PROCEDA (Resultado)'
                        }
                        value={displayedOutput}
                        downloadBase64={
							mode === 'writer'
								? rawOutput ?? undefined
								: undefined
						}
                        language={mode === 'reader' ? format : 'text'}
                        theme={theme}
                        readOnly
                        downloadName={
                            layout
                                ? `proceda-${layout}.${mode === 'reader' ? format : 'txt'}`
                                : undefined
                        }
                        controls={
                            mode === 'reader' && (
                                <div
                                    className="format-switch"
                                    aria-label="Formato do resultado"
                                >
                                    <button
                                        type="button"
                                        aria-pressed={format === 'json'}
                                        onClick={() => setFormat('json')}
                                    >
                                        JSON
                                    </button>

                                    <button
                                        type="button"
                                        aria-pressed={format === 'yaml'}
                                        onClick={() => setFormat('yaml')}
                                    >
                                        YAML
                                    </button>
                                </div>
                            )
                        }
                    />
                </div>

                <IssuesTable issues={issues} />
            </div>
        </section>
    );
}
