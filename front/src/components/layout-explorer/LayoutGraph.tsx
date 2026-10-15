import { useEffect, useRef, useState } from "react";
import cytoscape, { type Core, type StylesheetJson } from "cytoscape";
import { GitBranch, Maximize, Minus, Plus, Share2, Scan } from "lucide-react";
import type { Theme } from "../../types";
import {flattenNodes, Graph, Schema} from "./types";


interface LayoutGraphProps {
  graph: Graph;
  schema: Schema;
  selectedId: string;
  theme: Theme;
  onSelect: (id: string) => void;
}

function graphStyles(theme: Theme): StylesheetJson {
  const dark = theme === "dark";
  return [
    {
      selector: "node",
      style: {
        shape: "round-rectangle",
        width: 172,
        height: 102,
        "background-color": dark ? "#172b39" : "#f2fafa",
        "border-color": dark ? "#3ba0ba" : "#80bfb7",
        "border-width": 1,
        label: "data(label)",
        color: dark ? "#e4edf5" : "#203743",
        "font-size": 12,
        "font-family": "Segoe UI, sans-serif",
        "text-wrap": "wrap",
        "text-max-width": "155px",
        "text-valign": "center",
        "text-halign": "center",
      },
    },
    {
      selector: "node.collection",
      style: {
        "background-color": dark ? "#10392f" : "#e7f8f0",
        "border-color": "#2aaf87",
      },
    },
    {
      selector: "node:selected",
      style: {
        "border-color": "#368bf5",
        "border-width": 3,
        "background-color": dark ? "#20354d" : "#e6f1ff",
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        "line-color": dark ? "#7594b5" : "#8da5b3",
        "target-arrow-color": dark ? "#7594b5" : "#8da5b3",
      },
    },
  ];
}

export default function LayoutGraph({
  graph: graphData,
  schema,
  selectedId,
  theme,
  onSelect,
}: LayoutGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Core | null>(null);
  const selectionCallback = useRef(onSelect);
  const selectedIdRef = useRef(selectedId);
  const [view, setView] = useState<"tree" | "graph">("tree");
  const [zoom, setZoom] = useState(100);
  const [fullscreenError, setFullscreenError] = useState("");
  const [focusPath, setFocusPath] = useState<string[]>([]);

  const focusRootId =
      focusPath.length > 0
          ? focusPath[focusPath.length - 1]
          : null;

  function focusSelected() {
    if (selectedId === focusRootId) {
      return;
    }

    setFocusPath((path) => [
      ...path,
      selectedId,
    ]);
  }

  function focusBack() {
    setFocusPath((path) =>
        path.slice(0, -1),
    );
  }

  function clearFocus() {
    setFocusPath([]);
  }

  function descendants(
      graph: Graph,
      rootId: string,
  ): Set<string> {
    const ids = new Set<string>([rootId]);
    const queue = [rootId];

    while (queue.length) {
      const current = queue.shift()!;

      for (const edge of graph.edges) {
        if (edge.from !== current) {
          continue;
        }

        if (ids.has(edge.to)) {
          continue;
        }

        ids.add(edge.to);
        queue.push(edge.to);
      }
    }

    return ids;
  }

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    selectionCallback.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current) return;
    const schemas = new Map(
        flattenNodes(schema).map((node) => [
          node.path,
          node,
        ]),
    );

    const visibleIds = focusRootId
        ? descendants(graphData, focusRootId)
        : new Set(Object.keys(graphData.nodes));

    const elements = [
      ...Object.values(graphData.nodes)
          .filter((node) => visibleIds.has(node.id))
          .map((node) => {
            const schemaNode = schemas.get(node.id);

            return {
              data: {
                id: node.id,
                label: node.label,
              },
              classes: schemaNode?.collection
                  ? "collection"
                  : "dto",
            };
          }),

      ...graphData.edges
          .filter(
              (edge) =>
                  visibleIds.has(edge.from) &&
                  visibleIds.has(edge.to),
          )
          .map((edge) => ({
            data: {
              id: `edge:${edge.from}:${edge.to}`,
              source: edge.from,
              target: edge.to,
              label: edge.label,
            },
          })),
    ];

    const graph = cytoscape({
      container: containerRef.current,
      elements,
      style: graphStyles(theme),
      minZoom: 0.15,
      maxZoom: 2.5,
      zoomingEnabled: true,
      userZoomingEnabled: false,
      panningEnabled: true,
      selectionType: "single",
      boxSelectionEnabled: false,
      layout: { name: "preset" },
    });
    graphRef.current = graph;

    graph.on("tap", "node", event => {
      selectionCallback.current(event.target.id());
    });

    graph.on("zoom", () => {
      setZoom(Math.round(graph.zoom() * 100));
    });

    const container = containerRef.current;

    function handleWheel(event: WheelEvent) {
      if (event.deltaY === 0) return;

      event.preventDefault();

      const bounds = container.getBoundingClientRect();
      const step = event.deltaY < 0 ? 0.1 : -0.1;

      const nextZoom = Math.min(
          graph.maxZoom(),
          Math.max(
              graph.minZoom(),
              Math.round((graph.zoom() + step) * 100) / 100,
          ),
      );

      graph.zoom({
        level: nextZoom,
        renderedPosition: {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
      });
    }

    container.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    const resizeObserver = new ResizeObserver(() => graph.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      resizeObserver.disconnect();
      graph.destroy();
      graphRef.current = null;
    };
  }, [graphData, schema, theme, focusRootId]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const rootId =
        focusRootId ??
        Object.values(graphData.nodes)[0]?.id;

    graph
        .layout(
            view === "tree"
                ? {
                  name: "breadthfirst",
                  directed: true,
                  roots: rootId ? [rootId] : undefined,
                  padding: 45,
                  spacingFactor: 1.25,
                  animate: false,
                }
                : {
                  name: "cose",
                  padding: 45,
                  nodeRepulsion: () => 120000,
                  idealEdgeLength: () => 160,
                  animate: false,
                  randomize: true,
                },
        )
        .run();

    const focusNode = graph.getElementById(
        selectedIdRef.current,
    );

    graph.zoom(1.2);

    if (focusNode.length) {
      graph.center(focusNode);
    } else {
      graph.center();
    }

    setZoom(Math.round(graph.zoom() * 100));
  }, [view, graphData, focusRootId]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    graph.nodes().unselect();
    graph.getElementById(selectedId).select();
  }, [selectedId, graphData, focusRootId]);

  function changeZoom(factor: number) {
    const graph = graphRef.current;
    if (!graph) return;
    graph.zoom({
      level: Math.min(
        graph.maxZoom(),
        Math.max(graph.minZoom(), graph.zoom() * factor),
      ),
      renderedPosition: { x: graph.width() / 2, y: graph.height() / 2 },
    });
  }

  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frameRef.current?.requestFullscreen();
      setFullscreenError("");
    } catch (_) {
      setFullscreenError("Tela cheia indisponível neste navegador.");
    }
  }

  return (
    <section className="le-graph-section">
      <div className="le-graph-heading">
        <div>
          <h2>Estrutura do Layout</h2>
          <p>Explore os DTOs e seus relacionamentos.</p>
        </div>
        <div className="le-view-switch" aria-label="Disposição do grafo">
          {selectedId !== focusRootId && (
              <button
                  type="button"
                  onClick={focusSelected}
              >
                <Scan size={16} />
                Focar neste nó
              </button>
          )}

          {focusRootId && (
              <>
                <button
                    type="button"
                    onClick={focusBack}
                >
                  Voltar
                </button>

                <button
                    type="button"
                    onClick={clearFocus}
                >
                  Grafo completo
                </button>
              </>
          )}
          <button
            type="button"
            aria-pressed={view === "tree"}
            onClick={() => setView("tree")}
          >
            <GitBranch size={16} />
            Árvore
          </button>
          <button
            type="button"
            aria-pressed={view === "graph"}
            onClick={() => setView("graph")}
          >
            <Share2 size={16} />
            Grafo
          </button>
        </div>
      </div>
      <div className="le-graph-frame" ref={frameRef}>
        <div
          className="le-canvas"
          ref={containerRef}
          aria-label="Grafo do layout; use a árvore lateral para navegar pelo teclado"
        />
        <div className="le-legend">
          <span>
            <i className="le-dot-dto" />
            DTO
          </span>
          <span>
            <i className="le-dot-collection" />
            Coleção
          </span>
          <span>
            <i className="le-dot-selected" />
            Selecionado
          </span>
        </div>
        <div className="le-zoom-controls">
          <button
            type="button"
            onClick={() => changeZoom(1 / 1.2)}
            aria-label="Diminuir zoom"
          >
            <Minus size={17} />
          </button>
          <span>{zoom}%</span>
          <button
            type="button"
            onClick={() => changeZoom(1.2)}
            aria-label="Aumentar zoom"
          >
            <Plus size={17} />
          </button>
          <button
            type="button"
            onClick={() => graphRef.current?.fit(undefined, 45)}
            aria-label="Enquadrar grafo"
          >
            <Scan size={17} />
          </button>
          <button
            type="button"
            onClick={fullscreen}
            aria-label="Alternar tela cheia"
          >
            <Maximize size={17} />
          </button>
        </div>
        {fullscreenError && (
          <p className="le-fullscreen-error" role="status">
            {fullscreenError}
          </p>
        )}
      </div>
    </section>
  );
}
