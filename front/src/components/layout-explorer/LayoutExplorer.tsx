import { useEffect, useMemo, useState } from "react";
import {
    Box,
    PanelRightClose,
    PanelRightOpen,
} from "lucide-react";

import type {
	LayoutOption,
	Theme,
	LayoutResponse,
} from "../../types";

import {
	getLayout,
	getLayouts,
} from "../../services/proceda";

import { flattenNodes } from "./types";
import LayoutGraph from "./LayoutGraph";
import NodeDetails from "./NodeDetails";
import { LayoutSelector } from "./LayoutSelector";

import "./layout-explorer.css";

interface LayoutExplorerProps {
    theme: Theme;
}

function workspaceColumns(rightCollapsed: boolean) {
    if (rightCollapsed) {
        return "!grid-cols-[minmax(0,1fr)_52px]";
    }

    return "!grid-cols-[minmax(0,1fr)_440px]";
}

export default function LayoutExplorer({
   theme,
}: LayoutExplorerProps) {
    const [layouts, setLayouts] = useState<LayoutOption[]>([]);

    const [type, setType] = useState<string | null>(null);
    const [version, setVersion] = useState<string | null>(null);

    const [layout, setLayout] = useState<LayoutResponse | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [rightCollapsed, setRightCollapsed] = useState(false);

    useEffect(() => {
        getLayouts()
            .then((layouts) => {
                setLayouts(layouts);

                const firstLayout = layouts[0];
                const firstVersion = firstLayout?.versions[0];

                if (!firstLayout || !firstVersion) {
                    throw new Error("Nenhum layout disponível.");
                }

                setType(firstLayout.value);
                setVersion(firstVersion.value);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!type || !version) {
            return;
        }

        getLayout(type, version)
            .then((layout) => {
                setLayout(layout);
                setSelectedId(null);
            })
            .catch(console.error);
    }, [type, version]);

    const schema = layout?.schema;

    const nodes = useMemo(
        () => schema ? flattenNodes(schema) : [],
        [schema],
    );

    const selected =
        nodes.find((node) => node.path === selectedId) ??
        schema ??
        null;

    if (
        !type ||
        !version ||
        !layout ||
        !schema ||
        !selected
    ) {
        return (
            <section className="playground le-empty">
                Carregando layout...
            </section>
        );
    }

    return (
        <section
            className="playground layout-explorer"
            id="layout-explorer"
            aria-label="Layout Explorer"
        >
            <div className="le-titlebar">
                <div>
                    <h1>Layout Explorer</h1>
                    <p>
                        Estrutura, campos e registros do layout PROCEDA.
                    </p>
                </div>

                <LayoutSelector
                    layouts={layouts}
                    type={type}
                    version={version}
                    onChange={(nextType, nextVersion) => {
                        setType(nextType);
                        setVersion(nextVersion);
                    }}
                />
            </div>

            <div
                className={`le-workspace ${workspaceColumns(rightCollapsed)}`}
            >
                <LayoutGraph
                    graph={layout.graph}
                    schema={schema}
                    selectedId={selected.path}
                    theme={theme}
                    onSelect={setSelectedId}
                />

                <section
                    className={`min-w-0 border-l border-[var(--border)] bg-[var(--surface-soft)] ${
                        rightCollapsed ? "px-2 py-3" : ""
                    }`}
                    aria-label="Coluna de detalhes"
                >
                    <div
                        className={`flex items-center ${
                            rightCollapsed
                                ? "justify-center"
                                : "justify-between gap-2 px-3 pt-3"
                        }`}
                    >
                        {!rightCollapsed && (
                            <h2 className="!text-sm !font-semibold">
                                Detalhes do nó
                            </h2>
                        )}

                        <button
                            type="button"
                            className="icon-button !h-8 !w-8 shrink-0 rounded hover:bg-[var(--accent-soft)]"
                            onClick={() =>
                                setRightCollapsed((collapsed) => !collapsed)
                            }
                            aria-expanded={!rightCollapsed}
                            aria-controls="layout-explorer-right-content"
                            aria-label={
                                rightCollapsed
                                    ? "Expandir coluna direita"
                                    : "Recolher coluna direita"
                            }
                            title={
                                rightCollapsed
                                    ? "Expandir detalhes"
                                    : "Recolher detalhes"
                            }
                        >
                            {rightCollapsed ? (
                                <PanelRightOpen size={19} />
                            ) : (
                                <PanelRightClose size={19} />
                            )}
                        </button>
                    </div>

                    <div
                        id="layout-explorer-right-content"
                        hidden={rightCollapsed}
                        className="[&>.le-details]:!border-l-0"
                    >
                        <NodeDetails
                            key={selected.path}
                            node={selected}
                            onSelect={setSelectedId}
                        />
                    </div>

                    {rightCollapsed && (
                        <div className="mt-4 flex flex-col items-center gap-5 text-[var(--muted)] max-[700px]:flex-row max-[700px]:justify-center">
                            <button
                                type="button"
                                className="icon-button !h-8 !w-8 rounded !text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                                onClick={() => setRightCollapsed(false)}
                                title={`Abrir detalhes de ${selected.property}`}
                                aria-label={`Abrir detalhes de ${selected.property}`}
                            >
                                <Box size={20} />
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
}
