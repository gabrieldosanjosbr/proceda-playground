import { useMemo, useState } from "react";
import { Box, ChevronRight, Search } from "lucide-react";
import type { Schema } from "./types";

interface NodeDetailsProps {
  node: Schema;
  onSelect: (id: string) => void;
}

export default function NodeDetails({
  node,
  onSelect,
}: NodeDetailsProps) {
  const [tab, setTab] =
      useState<"fields" | "children" | "records">("fields");

  const [query, setQuery] = useState("");
  const [registro, setRegistro] = useState("");
  const [required, setRequired] = useState("all");

  const allFields = useMemo(
      () => Object.values(node.fields),
      [node.fields],
  );

  const children = useMemo(
      () => Object.values(node.children),
      [node.children],
  );

  const fields = useMemo(
      () =>
          allFields.filter((field) => {
            const matchesQuery = field.property
                .toLowerCase()
                .includes(query.toLowerCase());

            const matchesRegistro =
                !registro ||
                field.registro.identificacao === registro;

            const matchesRequired =
                required === "all" ||
                field.required === (required === "yes");

            return (
                matchesQuery &&
                matchesRegistro &&
                matchesRequired
            );
          }),
      [allFields, query, registro, required],
  );

  const fieldRecords = useMemo(
      () => [
        ...new Set(
            allFields.map(
                (field) => field.registro.identificacao,
            ),
        ),
      ],
      [allFields],
  );

  const registros = useMemo(
      () => [
        node.registro,
        ...node.registro.extensions,
      ],
      [node.registro],
  );

  const label =
      node.class.split("\\").pop() ??
      node.property ??
      node.path;

  return (
      <aside
          className="le-details"
          aria-label={`Detalhes de ${label}`}
      >
        <p className="le-breadcrumb">
          {node.path.split("/").join(" › ")}
        </p>

        <div className="le-node-heading">
        <span className="le-node-icon">
          <Box size={25} />
        </span>

          <div>
            <h2>{label}</h2>
            <p>{node.path}</p>
          </div>
        </div>

        <div
            className="le-detail-tabs"
            aria-label="Detalhes do nó"
        >
          <button
              type="button"
              aria-pressed={tab === "fields"}
              onClick={() => setTab("fields")}
          >
            Campos <span>{allFields.length}</span>
          </button>

          <button
              type="button"
              aria-pressed={tab === "children"}
              onClick={() => setTab("children")}
          >
            Filhos <span>{children.length}</span>
          </button>

          <button
              type="button"
              aria-pressed={tab === "records"}
              onClick={() => setTab("records")}
          >
            Registros <span>{registros.length}</span>
          </button>
        </div>

        {tab === "fields" && (
            <>
              <label className="le-search">
                <Search size={16} />

                <input
                    aria-label="Buscar campo"
                    placeholder="Buscar campo…"
                    value={query}
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                />
              </label>

              <div className="le-field-filters">
                <select
                    aria-label="Filtrar registro"
                    value={registro}
                    onChange={(event) =>
                        setRegistro(event.target.value)
                    }
                >
                  <option value="">
                    Todos os registros
                  </option>

                  {fieldRecords.map((record) => (
                      <option key={record} value={record}>
                        {record}
                      </option>
                  ))}
                </select>

                <select
                    aria-label="Filtrar obrigatoriedade"
                    value={required}
                    onChange={(event) =>
                        setRequired(event.target.value)
                    }
                >
                  <option value="all">
                    Todas as propriedades
                  </option>
                  <option value="yes">
                    Obrigatórios
                  </option>
                  <option value="no">
                    Opcionais
                  </option>
                </select>
              </div>

              <div className="le-field-table">
                <table>
                  <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Registro</th>
                    <th>Offset</th>
                    <th>Tam.</th>
                    <th>Tipo</th>
                    <th>Obrig.</th>
                  </tr>
                  </thead>

                  <tbody>
                  {fields.map((field) => (
                      <tr
                          key={`${field.registro.identificacao}:${field.property}`}
                      >
                        <td>{field.property}</td>

                        <td>
                          {field.registro.identificacao}
                        </td>

                        <td>
                          {String(field.offset).padStart(
                              3,
                              "0",
                          )}
                        </td>

                        <td>{field.length}</td>

                        <td>{field.type ?? "—"}</td>

                        <td
                            className={
                              field.required
                                  ? "le-required"
                                  : "le-optional"
                            }
                        >
                          {field.required ? "Sim" : "Não"}
                        </td>
                      </tr>
                  ))}

                  {!fields.length && (
                      <tr>
                        <td
                            colSpan={6}
                            className="le-empty"
                        >
                          Nenhum campo encontrado.
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>

              <p className="le-count">
                Mostrando {fields.length} de{" "}
                {allFields.length} campos
              </p>
            </>
        )}

        {tab === "children" && (
            <div className="le-child-list">
              {children.map((child) => {
                const childLabel =
                    child.class.split("\\").pop() ??
                    child.property ??
                    child.path;

                return (
                    <button
                        type="button"
                        key={child.path}
                        onClick={() =>
                            onSelect(child.path)
                        }
                    >
                      <Box size={16} />

                      {childLabel}

                      <ChevronRight size={16} />
                    </button>
                );
              })}

              {!children.length && (
                  <p className="le-empty">
                    Este nó não possui filhos.
                  </p>
              )}
            </div>
        )}

        {tab === "records" && (
            <div className="le-records">
              {registros.map((record) => (
                  <span key={record.identificacao}>
              {record.identificacao}
            </span>
              ))}

              {!registros.length && (
                  <p className="le-empty">
                    Nenhum registro associado.
                  </p>
              )}
            </div>
        )}

        <section className="le-detail-card">
          <h3>Detalhes</h3>

          <dl>
            <dt>Classe</dt>
            <dd>{node.class}</dd>

            <dt>Property</dt>
            <dd>{node.property ?? "—"}</dd>

            <dt>Path</dt>
            <dd>{node.path}</dd>

            <dt>Tipo</dt>
            <dd>
              {node.collection ? "Coleção" : "DTO"}
            </dd>

            <dt>Obrigatório</dt>
            <dd>{node.required ? "Sim" : "Não"}</dd>

            <dt>Ocorrências</dt>
            <dd>{node.occurs}</dd>
          </dl>
        </section>
      </aside>
  );
}
