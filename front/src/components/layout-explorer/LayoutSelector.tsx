import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LayoutOption } from "../../types";

interface Props {
    layouts: LayoutOption[];
    type: string;
    version: string;
    onChange: (type: string, version: string) => void;
}

interface Option {
    type: string;
    version: string;
    layoutLabel: string;
    versionLabel: string;
}

export function LayoutSelector({
   layouts,
   type,
   version,
   onChange,
}: Props) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const options = useMemo<Option[]>(
        () =>
            layouts.flatMap((layout) =>
                layout.versions.map((layoutVersion) => ({
                    type: layout.value,
                    version: layoutVersion.value,
                    layoutLabel: layout.label,
                    versionLabel: layoutVersion.label,
                })),
            ),
        [layouts],
    );

    const current = options.find(
        (option) =>
            option.type === type &&
            option.version === version,
    );

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handlePointerDown,
            );
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="le-layout-selector"
        >
            <button
                type="button"
                className="le-layout-badge"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={open}
                disabled={options.length === 0}
            >
                <span>
                    {current
                        ? `${current.layoutLabel} • ${current.versionLabel}`
                        : "Carregando layouts..."}
                </span>

                <ChevronDown
                    size={14}
                    className={`le-layout-chevron ${
                        open ? "is-open" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    className="le-layout-menu"
                    role="listbox"
                    aria-label="Selecionar layout"
                >
                    {options.map((option) => {
                        const selected =
                            option.type === type &&
                            option.version === version;

                        return (
                            <button
                                key={`${option.type}:${option.version}`}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={`le-layout-option ${
                                    selected ? "is-selected" : ""
                                }`}
                                onClick={() => {
                                    onChange(
                                        option.type,
                                        option.version,
                                    );

                                    setOpen(false);
                                }}
                            >
                                <span>
                                    {option.layoutLabel} •{" "}
                                    {option.versionLabel}
                                </span>

                                {selected && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
