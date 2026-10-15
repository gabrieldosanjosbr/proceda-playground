import type {
	Graph,
	Schema,
} from "./components/layout-explorer/types";

export type Mode = 'reader' | 'writer';
export type Theme = 'light' | 'dark';
export type OutputFormat = 'json' | 'yaml';

export interface ValidationRegistro {
    identificacao: string;
	extended?: string;
}

export interface ValidationField {
    path: string;
    property: string;
	label: string;
    registro?: ValidationRegistro;
}

export interface ValidationLine {
    id: string;
    content: string;
    registro: string | ValidationRegistro;
    number: number | null;
}

export interface LayoutVersion {
    value: string;
    label: string;
}

export interface LayoutOption {
    value: string;
    label: string;
    versions: LayoutVersion[];
}

interface BaseIssue {
	type: string;
	error: string;
	parameters: unknown[];
}

export interface FieldIssue extends BaseIssue {
	_type: 'field';
	field: ValidationField;
	line?: ValidationLine;
	value?: unknown;
}

export interface LayoutIssue extends BaseIssue {
	_type: 'layout';
	registro?: ValidationRegistro;
}

export type Issue =
	| FieldIssue
	| LayoutIssue;

export interface Scenario {
	label: string;
	layout: string;
	version: string;
	scenario: string;
}

export interface ProcessResult {
    content: string;
	rawContent?: string;
    issues: Issue[];
}

export interface ProcessRequest {
    mode: Mode;
    layout: string;
    version: string;
	tabReplacementSize: number,
    content: string;
}

export interface ReaderResponse {
	isValid: boolean;
	intercambio: unknown;
	validation: Issue[];
}

export interface LayoutResponse {
	type: string;
	version: string;
	schema: Schema;
	graph: Graph;
}

export interface WriterResponse {
	validation: Issue[];
	content: string;
}
