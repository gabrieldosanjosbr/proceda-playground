import {BookOpen, Braces, Github, ShieldCheck, Zap} from 'lucide-react';

import "./Hero.css";

import { links } from '../config';

const features = [
    {
        icon: Braces,
        title: 'API Unificada',
        description: 'Leitura e escrita com a mesma estrutura de dados (DTOs).',
    },
    {
        icon: ShieldCheck,
        title: 'Validação Robusta',
        description: 'Validações completas e relatório de problemas detalhado.',
    },
    {
        icon: Zap,
        title: 'Extensível',
        description: 'Personalize layouts por empresa via YAML, sem modificar o core.',
    },
];

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <h1>Seu legado não precisa mais ser legado.</h1>
        <p>Leitura e escrita de arquivos EDI de forma simples, robusta e extensível.</p>
        <div className="flex flex-wrap gap-3">
          <a className="button button-primary" href={links.github} target="_blank" rel="noreferrer"><Github size={18} />Ver no GitHub</a>
          <a className="button" href={links.docs} target="_blank" rel="noreferrer"><BookOpen size={18} />Documentação</a>
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
