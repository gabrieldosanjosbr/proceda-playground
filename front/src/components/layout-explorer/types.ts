export interface Registro {
  extensions: Registro[];
  identificacao: string;
  length: number;
  extended: string | null;
  fallback: string | null;
  deferred: boolean;
  build: boolean;
  required: boolean;
}

export interface SchemaType {
  name: string;
  value: string;
  label: string;
}

export interface Field {
  registro: Registro;
  property: string;
  path: string;
  required: boolean;
  decimals: number | null;
  type: string | null;
  allowed: unknown[] | null;
  excluded: unknown[];
  length: number;
  offset: number;
  fallback: string | null;
}

export interface Schema {
  collection: boolean;
  inline: boolean;
  class: string;
  path: string;
  property: string | null;
  registro: Registro;
  required: boolean;
  occurs: number;
  overflow: boolean;
  span: number;
  type: SchemaType | null;
  fields: Record<string, Field>;
  children: Record<string, Schema>;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}

export interface Graph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

export function flattenNodes(root: Schema): Schema[] {
  return [
    root,
    ...Object.values(root.children).flatMap(flattenNodes),
  ];
}