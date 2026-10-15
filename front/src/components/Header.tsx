import { Github, Moon, Sun } from "lucide-react";
import { links } from "../config";
import type { Theme } from "../types";

export type Page = "playground" | "explorer";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  page: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({
  theme,
  onToggleTheme,
  page,
  onNavigate,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          className="brand"
          href="#home"
          onClick={() => onNavigate("playground")}
          aria-label="Proceda — início"
        >
          <img
              src={theme === "light" ? "/box-dark.png" : "/box-light.png"}
              alt="Proceda"
              width={49}
          />
          <span>
            <strong>Proceda</strong>
            <small className="text-sm">
              Sua integração <b>EDI</b> descomplicada.
            </small>
          </span>
        </a>
        <nav className="navigation" aria-label="Navegação principal">
          <a href="#home" onClick={() => onNavigate("playground")}>
            Home
          </a>
          <a
            className={page === "playground" ? "active" : ""}
            href="#demo"
            onClick={() => onNavigate("playground")}
            aria-current={page === "playground" ? "page" : undefined}
          >
            Demo
          </a>
          <a
            className={page === "explorer" ? "active" : ""}
            href="#layout-explorer"
            onClick={() => onNavigate("explorer")}
            aria-current={page === "explorer" ? "page" : undefined}
          >
            Layout Explorer
          </a>
          <a href={links.docs} target="_blank" rel="noreferrer">
            Documentação
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
            }
          >
            {theme === "dark" ? <Sun size={23} /> : <Moon size={23} />}
          </button>
          <a
            className="icon-button"
            href={links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Github size={23} />
          </a>
        </div>
      </div>
    </header>
  );
}
