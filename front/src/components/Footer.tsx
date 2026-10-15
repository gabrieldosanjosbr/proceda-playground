import { BookOpen, Bug, Github } from 'lucide-react';
import { links } from '../config';

export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} ANGELIC WEB SOLUTIONS LTDA • PROCEDA</span>
      <div className="flex flex-wrap gap-8">
        <a href={links.github} target="_blank" rel="noreferrer"><Github size={18} />GitHub</a>
        <a href={links.docs} target="_blank" rel="noreferrer"><BookOpen size={18} />Documentação</a>
        <a href={links.issues} target="_blank" rel="noreferrer"><Bug size={18} />Reportar Issue</a>
      </div>
    </footer>
  );
}
