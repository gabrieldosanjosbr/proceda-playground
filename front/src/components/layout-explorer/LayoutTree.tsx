import { useState } from "react";
import { Box, ChevronDown, ChevronRight, Files, Search } from "lucide-react";
import type { Schema } from "./types";

interface LayoutTreeProps {
  root: Schema;
  selectedId: string;
  onSelect: (id: string) => void;
}

function getLabel(node: Schema): string {
	return node.property ?? node.class.split("\\").pop() ?? node.path;
}

function matches(node: Schema, query: string): boolean {
	const fields = Object.values(node.fields);
	const children = Object.values(node.children);

	const searchable = [
			getLabel(node),
			node.property,
			node.path,
			node.registro.identificacao,
			...fields.map((field) => field.property),
			...fields.map((field) => field.path),
		]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

	return (
		searchable.includes(query) ||
		children.some((child) => matches(child, query))
	);
}


interface TreeBranchProps {
	node: Schema;
	selectedId: string;
	onSelect: (id: string) => void;
	query: string;
}

function TreeBranch({
	node,
	selectedId,
	onSelect,
	query,
}: TreeBranchProps) {
	const [expanded, setExpanded] = useState(true);

	if (!matches(node, query)) {
		return null;
	}

	const children = Object.values(node.children);
	const open = query.length > 0 || expanded;
	const id = node.path;
	const label = getLabel(node);

	return (
		<li>
			<div
				className={`le-tree-row ${
					selectedId === id ? "is-selected" : ""
				}`}
			>
				{children.length > 0 ? (
					<button
						type="button"
						className="le-tree-toggle"
						onClick={() => setExpanded((value) => !value)}
						aria-expanded={open}
						aria-label={`${open ? "Recolher" : "Expandir"} ${label}`}
					>
						{open ? (
							<ChevronDown size={14} />
						) : (
							<ChevronRight size={14} />
						)}
					</button>
				) : (
					<span className="le-tree-spacer" />
				)}

				<button
					type="button"
					className="le-tree-node"
					onClick={() => onSelect(id)}
					aria-current={
						selectedId === id ? "true" : undefined
					}
				>
					{node.collection ? (
						<Files size={16} />
					) : (
						<Box size={16} />
					)}

					<span>{label}</span>
				</button>
			</div>

			{open && children.length > 0 && (
				<ul>
					{children.map((child) => (
						<TreeBranch
							key={child.path}
							node={child}
							selectedId={selectedId}
							onSelect={onSelect}
							query={query}
						/>
					))}
				</ul>
			)}
		</li>
	);
}

export default function LayoutTree({
   root,
   selectedId,
   onSelect,
}: LayoutTreeProps) {
	const [query, setQuery] = useState("");

	const normalizedQuery = query
		.trim()
		.toLowerCase();

	return (
		<>
			<label className="le-search">
				<Search size={16} />

				<input
					value={query}
					onChange={(event) =>
						setQuery(event.target.value)
					}
					placeholder="Buscar nó, campo ou registro…"
					aria-label="Buscar na estrutura"
				/>
			</label>

			<nav
				aria-label="Estrutura do layout"
				className="le-tree"
			>
				<ul>
					<TreeBranch
						node={root}
						selectedId={selectedId}
						onSelect={onSelect}
						query={normalizedQuery}
					/>
				</ul>

				{!matches(root, normalizedQuery) && (
					<p className="le-empty">
						Nenhum nó encontrado.
					</p>
				)}
			</nav>
		</>
	);
}
