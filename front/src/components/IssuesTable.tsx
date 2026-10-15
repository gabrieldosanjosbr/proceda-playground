import { TriangleAlert } from 'lucide-react';

import type {Issue, ValidationField} from '../types';

function formatIssueType(type: Issue['_type']): string {
	switch (type) {
		case 'field':
			return 'Campo';

		case 'layout':
			return 'Layout';
	}
}

function formatError(type: string): string {
	switch (type) {
		case 'missing_required_value':
			return 'Valor obrigatório ausente';

		case 'type_not_allowed':
			return 'Tipo não permitido';

		case 'value_exceeds_maximum_length':
			return 'Valor excede o tamanho máximo';

		case 'invalid_time':
			return 'Horário inválido';

		case 'missing_required_registro':
			return 'Registro obrigatório ausente';

		case 'inline_limit_exceeded':
			return 'Limite de itens inline excedido';

		case 'occurs_limit_exceeded':
			return 'Limite de ocorrências excedido';

		default:
			return type;
	}
}

function getIssueRegistro(issue: Issue): string {
	if (issue._type === 'layout') {
		return issue.registro?.identificacao ?? '-';
	}

	if (typeof issue.line?.registro === 'string') {
		return issue.line.registro;
	}

	return (
		issue.line?.registro?.identificacao
		?? issue.field.registro?.identificacao
		?? '-'
	);
}

function getFieldPath(field: ValidationField): string {
	return field.path
		? `${field.path}/${field.property}`
		: field.property;
}

export default function IssuesTable({
	issues,
}: {
	issues: Issue[];
}) {
	const sortedIssues = [...issues].sort((a, b) => {
		if (a._type === b._type) {
			return 0;
		}

		return a._type === 'layout' ? -1 : 1;
	});

	return (
		<section
			className="issues"
			aria-label="Problemas de validação"
		>
			<h3>Problemas ({issues.length})</h3>

			<div className="table-container">
				<table>
					<thead>
					<tr>
						<th>Tipo</th>
						<th>Linha</th>
						<th>Registro</th>
						<th>Campo</th>
						<th>Path</th>
						<th>Erro</th>
					</tr>
					</thead>

					<tbody>
					{sortedIssues.map((issue, index) => {
						const isField = issue._type === 'field';

						const line = isField
							? issue.line
							: undefined;

						const field = isField
							? issue.field
							: undefined;

						return (
							<tr
								key={
									line?.id
										? `${line.id}-${field?.path}-${field?.property}-${index}`
										: `${issue._type}-${issue.type}-${index}`
								}
							>
								<td>
                                    <span className="issue-type">
                                        <TriangleAlert size={15} />
										{formatIssueType(issue._type)}
                                    </span>
								</td>

								<td>
									{line?.number ?? '—'}
								</td>

								<td>
									{getIssueRegistro(issue)}
								</td>

								<td>
									{field?.label ?? field?.property ?? '—'}
								</td>

								<td>
									{field ? getFieldPath(field) : '—'}
								</td>

								<td>
									{formatError(issue.type)}
								</td>
							</tr>
						);
					})}

					{!issues.length && (
						<tr>
							<td
								colSpan={6}
								className="empty-issues"
							>
								Nenhum problema encontrado.
							</td>
						</tr>
					)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
