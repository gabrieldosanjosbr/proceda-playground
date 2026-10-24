import { BookOpen, Braces, Github, ShieldCheck, Zap } from 'lucide-react';

import './Hero.css';

import { links } from '../config';

const features = [
    {
        icon: Braces,
        title: 'API Unificada',
        description: 'Leitura e escrita com uma estrutura de dados consistente baseada em DTOs.',
    },
    {
        icon: ShieldCheck,
        title: 'Validação Robusta',
        description: 'Validações de layout e relatórios detalhados de problemas.',
    },
    {
        icon: Zap,
        title: 'Extensível',
        description: 'Personalize layouts por empresa usando YAML, sem modificar o core.',
    },
];

export default function Hero() {
    return (
        <section className="hero" id="home">
            <div className="hero-copy">
                <h1>Seu legado não precisa mais ser legado.</h1>

                <p>
                    O PROCEDA é uma biblioteca PHP de código aberto para
                    leitura e interpretação de arquivos EDI de layout fixo.
                    Explore seus layouts em um playground interativo e consulte
                    registros, campos e estruturas de documentos de transporte
                    e logística, incluindo NOTFIS, OCOREN, DOCCOB e CONEMB.
                </p>

                <div className="flex flex-wrap gap-3">
                    <a
                        className="button button-primary"
                        href={links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Github size={18} />
                        Ver no GitHub
                    </a>

                    <a
                        className="button"
                        href={links.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <BookOpen size={18} />
                        Documentação
                    </a>
                </div>
            </div>

            <div className="features">
                {features.map(({ icon: Icon, title, description }) => (
                    <div className="feature" key={title}>
                        <Icon
                            size={35}
                            strokeWidth={1.8}
                            className={Icon === Zap ? 'feature-zap' : undefined}
                        />

                        <div>
                            <h2>{title}</h2>
                            <p>{description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="circuit-decoration" aria-hidden="true" />
        </section>
    );
}