import type {
	LayoutOption,
	LayoutResponse,
	ProcessRequest,
	ProcessResult,
	ReaderResponse,
	Scenario,
	WriterResponse,
} from '../types';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api')
    .replace(/\/$/, '');

export const scenarios: Scenario[] = [
	{
		label: "Todos os campos",
		layout: "notfis",
		version: "v31",
		scenario: "all-fields",
	},
	{
		label: "Campos obrigatórios",
		layout: "notfis",
		version: "v50",
		scenario: "required-fields",
	},
	{
		label: "Todos os campos",
		layout: "notfis",
		version: "v50",
		scenario: "all-fields",
	},
	{
		label: "Todos os campos",
		layout: "ocoren",
		version: "v31",
		scenario: "all-fields",
	},
	{
		label: "Todos os campos",
		layout: "ocoren",
		version: "v50",
		scenario: "all-fields",
	},
	{
		label: "Todos os campos",
		layout: "doccob",
		version: "v30",
		scenario: "all-fields",
	},
	{
		label: "Todos os campos",
		layout: "doccob",
		version: "v50",
		scenario: "all-fields",
	},
	{
		label: "Todos os campos",
		layout: "conemb",
		version: "v31",
		scenario: "all-fields",
	},
];

export async function getLayouts(): Promise<LayoutOption[]> {
    const response = await request('/layouts');

    const result: unknown = await response.json();

    if (
        !result ||
        typeof result !== 'object' ||
        !('layouts' in result) ||
        !Array.isArray(result.layouts)
    ) {
        throw new Error('Resposta inválida ao carregar layouts.');
    }

    return result.layouts as LayoutOption[];
}

export async function getLayout(
    type: string,
    version: string,
): Promise<LayoutResponse> {
    const response = await request(
        `/layouts/${encodeURIComponent(type)}/${encodeURIComponent(version)}`,
    );

    return response.json();
}

export async function getScenario(
	scenario: Scenario,
): Promise<unknown> {
	const response = await request(
		`/scenarios/${scenario.layout}/${scenario.version}/${scenario.scenario}`,
	);

	if (!response.ok) {
		throw new Error(
			`Failed to load scenario: ${response.status}`,
		);
	}

	return response.json();
}

export async function read(
    type: string,
    version: string,
    tabReplacementSize: number,
    content: string,
): Promise<ProcessResult> {
	const params = new URLSearchParams({
		tabReplacementSize: String(tabReplacementSize),
	});

    const response = await request(
        `/read/${encodeURIComponent(type)}/${encodeURIComponent(version)}?${params}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: encodeBase64(content),
        },
    );

    const result = await response.json() as ReaderResponse;

    return {
        content: JSON.stringify(
            result.intercambio,
            null,
            2,
        ),
        issues: result.validation,
    };
}

export async function write(
    type: string,
    version: string,
    content: string,
): Promise<ProcessResult> {
    JSON.parse(content);

    const response = await request(
        `/write/${encodeURIComponent(type)}/${encodeURIComponent(version)}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: content,
        },
    );

    const result: unknown = await response.json();

    const writerResult = result as WriterResponse;

    console.log(
        'WRITER VALIDATION',
        writerResult.validation,
    );

    if (
        !result ||
        typeof result !== 'object' ||
        !('content' in result) ||
        typeof result.content !== 'string' ||
        !('validation' in result) ||
        !Array.isArray(result.validation)
    ) {
        throw new Error(
            'Resposta inválida do Writer: esperado { content, validation }.',
        );
    }

    return {
        content: decodeBase64(writerResult.content),
		rawContent: writerResult.content,
        issues: writerResult.validation,
    };
}

export async function processDocument(
    request: ProcessRequest,
): Promise<ProcessResult> {
    if (request.mode === 'reader') {
        return read(
            request.layout,
            request.version,
            request.tabReplacementSize,
            request.content,
        );
    }

    return write(
        request.layout,
        request.version,
        request.content,
    );
}

async function request(
    path: string,
    init?: RequestInit,
): Promise<Response> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
        throw new Error(
            `O backend retornou HTTP ${response.status}.`,
        );
    }

    return response;
}

function encodeBase64(content: string): string {
    const bytes = new TextEncoder().encode(content);

    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary);
}

function decodeBase64(content: string): string {
	const binary = atob(content);

	const bytes = Uint8Array.from(
		binary,
		(char) => char.charCodeAt(0),
	);

	return new TextDecoder(
		'iso-8859-1',
	).decode(bytes);
}
