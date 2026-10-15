
import {
    Check,
    ChevronDown,
} from 'lucide-react';

import {
    useEffect,
    useId,
    useRef,
    useState,
} from 'react';

import type {
    KeyboardEvent as ReactKeyboardEvent,
    ReactNode,
} from 'react';

import './SelectDropdown.css';

export interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    reverseWhenUpward?: boolean;
    addon?: ReactNode;
    hint?: string;
}

const MAX_MENU_HEIGHT = 240;
const MENU_GAP = 6;

export function SelectDropdown({
   label,
   value,
   options,
   onChange,
   disabled = false,
   placeholder = 'Selecione...',
   reverseWhenUpward = false,
   addon,
   hint,
}: Props) {
    const [open, setOpen] = useState(false);
    const [opensUpward, setOpensUpward] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuId = useId();

    const orderedOptions =
        opensUpward && reverseWhenUpward
            ? [...options].reverse()
            : options;

    const current = options.find(
        (option) => option.value === value,
    );

    function closeMenu() {
        setOpen(false);
    }

    function openMenu() {
        if (disabled || options.length === 0) {
            return;
        }

        const rect =
            containerRef.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const spaceBelow =
            window.innerHeight - rect.bottom - MENU_GAP;

        const spaceAbove = rect.top - MENU_GAP;

        const upward =
            spaceBelow < MAX_MENU_HEIGHT &&
            spaceAbove > spaceBelow;

        const ordered =
            upward && reverseWhenUpward
                ? [...options].reverse()
                : options;

        const selectedIndex = ordered.findIndex(
            (option) => option.value === value,
        );

        setOpensUpward(upward);
        setActiveIndex(
            selectedIndex >= 0 ? selectedIndex : 0,
        );
        setOpen(true);
    }

    function selectOption(option: SelectOption) {
        onChange(option.value);
        closeMenu();
        triggerRef.current?.focus();
    }

    function handleTriggerKeyDown(
        event: ReactKeyboardEvent<HTMLButtonElement>,
    ) {
        if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp' ||
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();

            if (!open) {
                openMenu();
            }
        }

        if (event.key === 'Escape') {
            closeMenu();
        }
    }

    function handleMenuKeyDown(
        event: ReactKeyboardEvent<HTMLDivElement>,
    ) {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu();
            triggerRef.current?.focus();
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            setActiveIndex((index) =>
                Math.min(index + 1, orderedOptions.length - 1),
            );
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();

            setActiveIndex((index) =>
                Math.max(index - 1, 0),
            );
        }

        if (event.key === 'Home') {
            event.preventDefault();
            setActiveIndex(0);
        }

        if (event.key === 'End') {
            event.preventDefault();
            setActiveIndex(orderedOptions.length - 1);
        }

        if (
            event.key === 'Enter' ||
            event.key === ' '
        ) {
            event.preventDefault();

            const option = orderedOptions[activeIndex];

            if (option) {
                selectOption(option);
            }
        }
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                closeMenu();
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                closeMenu();
                triggerRef.current?.focus();
            }
        }

        document.addEventListener(
            'pointerdown',
            handlePointerDown,
        );

        document.addEventListener(
            'keydown',
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                'pointerdown',
                handlePointerDown,
            );

            document.removeEventListener(
                'keydown',
                handleKeyDown,
            );
        };
    }, [open]);

    useEffect(() => {
        if (disabled) {
            closeMenu();
        }
    }, [disabled]);

    useEffect(() => {
        if (!open) {
            return;
        }

        // O menu recebe o foco, mantendo a navegação
        // por teclado dentro do dropdown.
        menuRef.current?.focus();
    }, [open]);

    useEffect(() => {
        if (!open || !menuRef.current) {
            return;
        }

        const menu = menuRef.current;
        const option = menu.querySelectorAll<HTMLElement>(
            '[role="option"]',
        )[activeIndex];

        if (!option) {
            return;
        }

        const top = option.offsetTop;
        const bottom = top + option.offsetHeight;

        if (top < menu.scrollTop) {
            menu.scrollTop = top;
        } else if (
            bottom > menu.scrollTop + menu.clientHeight
        ) {
            menu.scrollTop = bottom - menu.clientHeight;
        }
    }, [open, activeIndex]);

    return (
        <div
            ref={containerRef}
            className={`select-dropdown ${
                addon ? 'has-addon' : ''
            }`}
        >
            <button
                ref={triggerRef}
                type="button"
                className="select-dropdown-trigger"
                disabled={disabled}
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={() => {
                    if (open) {
                        closeMenu();
                    } else {
                        openMenu();
                    }
                }}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="select-dropdown-value">
                    {current?.label ?? placeholder}
                </span>

                <ChevronDown
                    size={14}
                    className={`select-dropdown-chevron ${
                        open ? 'is-open' : ''
                    }`}
                />
            </button>

            {addon && (
                <div className="select-dropdown-addon">
                    {addon}
                </div>
            )}

            {hint && (
                <span className="select-dropdown-hint">
                    * {hint}
                </span>
            )}

            {open && (
                <div
                    id={menuId}
                    ref={menuRef}
                    className={`select-dropdown-menu ${
                        opensUpward
                            ? 'opens-upward'
                            : 'opens-downward'
                    }`}
                    role="listbox"
                    aria-label={label}
                    tabIndex={-1}
                    aria-activedescendant={
                        `${menuId}-option-${activeIndex}`
                    }
                    onKeyDown={handleMenuKeyDown}
                >
                    {orderedOptions.map((option, index) => {
                        const selected =
                            option.value === value;

                        return (
                            <div
                                key={option.value}
                                id={`${menuId}-option-${index}`}
                                role="option"
                                aria-selected={selected}
                                className={`select-dropdown-option ${
                                    selected ? 'is-selected' : ''
                                } ${
                                    index === activeIndex
                                        ? 'is-active'
                                        : ''
                                }`}
                                onPointerEnter={() =>
                                    setActiveIndex(index)
                                }
                                onClick={() =>
                                    selectOption(option)
                                }
                            >
                                <span>{option.label}</span>

                                {selected && <Check size={14} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}