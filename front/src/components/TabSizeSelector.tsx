import { CircleHelp } from 'lucide-react';

import {
    SelectDropdown,
} from './SelectDropdown';

import type {
    SelectOption,
} from './SelectDropdown';

import './TabSizeSelector.css';

interface Props {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

const options: SelectOption[] = Array.from(
    { length: 16 },
    (_, index) => {
        const size = index + 1;

        return {
            value: String(size),
            label: `${size} ${
                size === 1 ? 'espaço' : 'espaços'
            } por TAB`,
        };
    },
);

export function TabSizeSelector({
    value,
    onChange,
    disabled = false,
}: Props) {
    return (
        <SelectDropdown
            label="Espaços por TAB"
            value={String(value)}
            options={options}
            onChange={(selected) =>
                onChange(Number(selected))
            }
            disabled={disabled}
            reverseWhenUpward
            addon={
                <span
                    className="tab-size-help"
                    tabIndex={0}
                    aria-label="Ajuda sobre tabulações"
                >
                    <CircleHelp size={16} aria-hidden="true" />

                    <span
                        role="tooltip"
                        className="tab-size-tooltip"
                    >
                        Alguns arquivos EDI contêm tabulações
                        (TAB). Como sua largura visual pode
                        variar, o PROCEDA substitui cada TAB
                        pela quantidade selecionada de espaços
                        antes de interpretar os campos.
                    </span>
                </span>
            }
        />
    );
}