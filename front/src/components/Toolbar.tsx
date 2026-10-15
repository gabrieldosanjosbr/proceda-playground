import { Play, Trash2, LoaderCircle } from 'lucide-react';

import {scenarios} from "../services/proceda.ts";

import type {
    LayoutOption,
    Mode,
	Scenario
} from '../types';
import {useState} from "react";
import {TabSizeSelector} from "./TabSizeSelector.tsx";

import { SelectDropdown } from './SelectDropdown';

import './Toolbar.css';

interface ToolbarProps {
    layouts: LayoutOption[];
    layout: string | null;
    version: string | null;
    mode: Mode;
    busy: boolean;
	loadingScenario: boolean;
    onLayoutChange: (layout: string) => void;
    onVersionChange: (version: string) => void;
	onScenario: (scenario: Scenario) => void;
	onGenerateExample: (scenario: Scenario) => void;
    onClear: () => void;
    onProcess: () => void;
	tabReplacementSize: number;
	onTabReplacementSizeChange: (value: number) => void;
}

export default function Toolbar({
    layouts,
    layout,
    version,
    mode,
    busy,
	loadingScenario,
    onLayoutChange,
    onVersionChange,
	onScenario,
	onGenerateExample,
    onClear,
    onProcess,
	tabReplacementSize,
	onTabReplacementSizeChange,
}: ToolbarProps) {
	const [selectedScenario, setSelectedScenario] = useState('');
    const selectedLayout = layouts.find(
        (option) => option.value === layout,
    );

	const availableScenarios = scenarios.filter(
		(scenario) =>
			scenario.layout === layout &&
			scenario.version === version,
	);

	const scenario = availableScenarios.some(
		(item) => item.scenario === selectedScenario,
	)
		? selectedScenario
		: (availableScenarios[0]?.scenario ?? '');

    return (
        <div className="toolbar">
            <div className="toolbar-group">
				<SelectDropdown
					label="Layout"
		            value={layout ?? ''}
		            options={layouts.map((option) => ({
						value: option.value,
						label: option.label,
					}))}
		            onChange={onLayoutChange}
		            disabled={busy || layouts.length === 0}
				/>

				<SelectDropdown
					label="Versão"
		            value={version ?? ''}
		            options={
						selectedLayout?.versions.map((option) => ({
							value: option.value,
							label: option.label,
						})) ?? []
					}
		            onChange={onVersionChange}
		            disabled={
						busy ||
						!selectedLayout ||
						selectedLayout.versions.length === 0
					}
				/>

				<SelectDropdown
					label="Exemplo"
		            value={scenario}
		            options={availableScenarios.map((item) => ({
						value: item.scenario,
						label: item.label,
					}))}
		            onChange={setSelectedScenario}
		            disabled={
						busy ||
						loadingScenario ||
						availableScenarios.length === 0
					}
					hint={
						scenario === 'all-fields'
							? 'Aplicáveis ao layout selecionado'
							: undefined
					}
				/>

				<button
					type="button"
		            className="button"
		            disabled={
						busy ||
						loadingScenario ||
						!scenario
					}
		            onClick={() => {
						const selectedScenario =
							availableScenarios.find(
								(item) =>
									item.scenario === scenario,
							);

						if (!selectedScenario) {
							return;
						}

						if (mode === 'reader') {
							onGenerateExample(selectedScenario);
						} else {
							onScenario(selectedScenario);
						}
					}}
				>
					{mode === 'reader'
						? 'Gerar Exemplo'
						: 'Carregar Exemplo'}
				</button>

				{loadingScenario && (
					<LoaderCircle
						className="toolbar-loader"
			            size={18}
			            aria-label="Carregando"
					/>
				)}
            </div>

            <div className="toolbar-group">
                <button
                    type="button"
                    className="button"
                    disabled={busy}
                    onClick={onClear}
                >
                    <Trash2 size={17} />
                    Limpar
                </button>

				{mode === 'reader' && (
					<TabSizeSelector
						value={tabReplacementSize}
			            onChange={onTabReplacementSizeChange}
			            disabled={busy}
					/>
				)}

                <button
                    type="button"
                    className="button button-primary"
                    disabled={busy || !layout || !version}
                    onClick={onProcess}
                >
                    <Play size={17} />

                    {busy
                        ? 'Processando…'
                        : mode === 'reader'
                            ? 'Interpretar'
                            : 'Gerar TXT'}
                </button>
            </div>
        </div>
    );
}
