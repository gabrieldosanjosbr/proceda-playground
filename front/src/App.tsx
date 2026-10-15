import { lazy, Suspense, useEffect, useState } from "react";
import Header, { type Page } from "./components/Header";
import Hero from "./components/Hero";
import Playground from "./components/Playground";
import Footer from "./components/Footer";
import { useTheme } from "./hooks/useTheme";

const LayoutExplorer = lazy(() => import("./components/layout-explorer"));

function pageFromHash(): Page {
  return window.location.hash === "#layout-explorer"
    ? "explorer"
    : "playground";
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        page={page}
        onNavigate={setPage}
      />
      <main className="page-container">
        {/* Mantém o conteúdo digitado ao abrir o Explorer. */}
        <div hidden={page !== "playground"}>
          <Hero />
          <Playground theme={theme} />
        </div>
        {page === "explorer" && (
          <Suspense fallback={<p>Carregando Layout Explorer…</p>}>
            <LayoutExplorer theme={theme} />
          </Suspense>
        )}
        <Footer />
      </main>
    </>
  );
}
