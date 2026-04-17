import React from 'react';
import {
  FaPalette,
  FaCode,
  FaServer,
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaGraduationCap,
  FaAward,
  FaUsers,
  FaProjectDiagram,
  FaRocket,
} from 'react-icons/fa';
import styles from './TeamSection.module.css';

const TeamSection = () => {
  // Custom SVG Avatar for Carlos Yuran (Design)
  const CarlosAvatar = () => (
    <svg viewBox="0 0 200 200" className={styles.avatarSvg}>
      <defs>
        <linearGradient id="carlosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#1A73E8'}} />
          <stop offset="100%" style={{stopColor: '#7B1FA2'}} />
        </linearGradient>
        <linearGradient id="carlosBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#E8F1FD'}} />
          <stop offset="100%" style={{stopColor: '#F3E5F5'}} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#carlosBg)" />
      <circle cx="100" cy="100" r="90" fill="url(#carlosGrad)" opacity="0.1" />
      <circle cx="100" cy="85" r="40" fill="url(#carlosGrad)" opacity="0.8" />
      <circle cx="100" cy="85" r="30" fill="white" />
      {/* Glasses */}
      <circle cx="80" cy="85" r="12" fill="none" stroke="url(#carlosGrad)" strokeWidth="3" />
      <circle cx="120" cy="85" r="12" fill="none" stroke="url(#carlosGrad)" strokeWidth="3" />
      <line x1="92" y1="85" x2="108" y2="85" stroke="url(#carlosGrad)" strokeWidth="3" />
      {/* Smile */}
      <path d="M 75 115 Q 100 135 125 115" fill="none" stroke="url(#carlosGrad)" strokeWidth="3" strokeLinecap="round" />
      {/* Paint palette icon */}
      <circle cx="140" cy="140" r="20" fill="url(#carlosGrad)" opacity="0.8" />
      <circle cx="135" cy="135" r="4" fill="#FF6B6B" />
      <circle cx="145" cy="135" r="4" fill="#4ECDC4" />
      <circle cx="140" cy="145" r="4" fill="#FFE66D" />
      <circle cx="148" cy="142" r="3" fill="#95E77E" />
      {/* Name initials */}
      <text x="100" y="175" textAnchor="middle" fill="url(#carlosGrad)" fontSize="14" fontWeight="bold" fontFamily="Arial">CF</text>
    </svg>
  );

  // Custom SVG Avatar for Ivan Isaac (Frontend)
  const IvanAvatar = () => (
    <svg viewBox="0 0 200 200" className={styles.avatarSvg}>
      <defs>
        <linearGradient id="ivanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#1E88E5'}} />
          <stop offset="100%" style={{stopColor: '#66BB6A'}} />
        </linearGradient>
        <linearGradient id="ivanBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#E8F5E9'}} />
          <stop offset="100%" style={{stopColor: '#E8F1FD'}} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#ivanBg)" />
      <circle cx="100" cy="100" r="90" fill="url(#ivanGrad)" opacity="0.1" />
      <circle cx="100" cy="80" r="35" fill="url(#ivanGrad)" opacity="0.8" />
      <circle cx="100" cy="80" r="25" fill="white" />
      {/* Hair */}
      <path d="M 70 75 Q 70 50 100 50 Q 130 50 130 75" fill="url(#ivanGrad)" opacity="0.8" />
      {/* Eyes */}
      <circle cx="85" cy="80" r="4" fill="url(#ivanGrad)" />
      <circle cx="115" cy="80" r="4" fill="url(#ivanGrad)" />
      {/* Happy expression */}
      <path d="M 85 100 Q 100 115 115 100" fill="none" stroke="url(#ivanGrad)" strokeWidth="3" strokeLinecap="round" />
      {/* Code brackets icon */}
      <rect x="130" y="125" width="40" height="35" rx="8" fill="url(#ivanGrad)" opacity="0.8" />
      <text x="140" y="148" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{'<'}</text>
      <text x="155" y="148" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{'/ >'}</text>
      {/* Name initials */}
      <text x="100" y="175" textAnchor="middle" fill="url(#ivanGrad)" fontSize="14" fontWeight="bold" fontFamily="Arial">IA</text>
    </svg>
  );

  // Custom SVG Avatar for Angel Oneil (Backend)
  const AngelAvatar = () => (
    <svg viewBox="0 0 200 200" className={styles.avatarSvg}>
      <defs>
        <linearGradient id="angelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#2E7D32'}} />
          <stop offset="100%" style={{stopColor: '#1A73E8'}} />
        </linearGradient>
        <linearGradient id="angelBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#E8F5E9'}} />
          <stop offset="100%" style={{stopColor: '#F3E5F5'}} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#angelBg)" />
      <circle cx="100" cy="100" r="90" fill="url(#angelGrad)" opacity="0.1" />
      <circle cx="100" cy="80" r="35" fill="url(#angelGrad)" opacity="0.8" />
      <circle cx="100" cy="80" r="28" fill="white" />
      {/* Glasses (round) */}
      <circle cx="82" cy="80" r="10" fill="none" stroke="url(#angelGrad)" strokeWidth="2.5" />
      <circle cx="118" cy="80" r="10" fill="none" stroke="url(#angelGrad)" strokeWidth="2.5" />
      <line x1="92" y1="80" x2="108" y2="80" stroke="url(#angelGrad)" strokeWidth="2.5" />
      {/* Focused expression */}
      <path d="M 80 100 Q 100 105 120 100" fill="none" stroke="url(#angelGrad)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Server/Database icon */}
      <rect x="130" y="125" width="40" height="30" rx="5" fill="url(#angelGrad)" opacity="0.8" />
      <line x1="140" y1="135" x2="160" y2="135" stroke="white" strokeWidth="2" />
      <line x1="140" y1="142" x2="160" y2="142" stroke="white" strokeWidth="2" />
      <line x1="140" y1="149" x2="160" y2="149" stroke="white" strokeWidth="2" />
      {/* Database cylinder */}
      <ellipse cx="150" cy="155" rx="10" ry="3" fill="white" opacity="0.5" />
      {/* Name initials */}
      <text x="100" y="175" textAnchor="middle" fill="url(#angelGrad)" fontSize="14" fontWeight="bold" fontFamily="Arial">AG</text>
    </svg>
  );

  const teamMembers = [
    {
      id: 1,
      name: 'Carlos Yuran Fonseca',
      role: 'Diseño Gráfico',
      roleIcon: <FaPalette />,
      avatar: <CarlosAvatar />,
      description: 'Especialista en diseño de interfaces UX/UI con más de 3 años de experiencia en creación de experiencias digitales centradas en el usuario. Apasionado por el diseño minimalista y funcional que resuelve problemas reales. Ha trabajado en proyectos de branding, diseño de productos digitales y sistemas de diseño escalables.',
      skills: ['Figma', 'Adobe XD', 'Illustrator', 'Photoshop', 'Design System', 'Prototyping', 'UI/UX', 'Wireframing'],
      social: {
        github: 'https://github.com/carlosfonseca',
        linkedin: 'https://linkedin.com/in/carlosfonseca',
        email: 'carlos.fonseca@sinergiab2b.com'
      },
      quote: 'El buen diseño es hacer visible la solución'
    },
    {
      id: 2,
      name: 'Ivan Isaac Álvarez',
      role: 'Desarrollador Frontend',
      roleIcon: <FaCode />,
      avatar: <IvanAvatar />,
      description: 'Desarrollador frontend especializado en React y JavaScript moderno. Enfocado en crear interfaces rápidas, responsivas y accesibles que ofrecen la mejor experiencia al usuario. Apasionado por las nuevas tecnologías y el rendimiento web, siempre buscando optimizar cada componente para una experiencia fluida.',
      skills: ['React', 'JavaScript', 'CSS3', 'HTML5', 'Next.js', 'Tailwind', 'Git', 'Redux', 'TypeScript'],
      social: {
        github: 'https://github.com/ivanisaac',
        linkedin: 'https://linkedin.com/in/ivanisaac',
        email: 'ivan.alvarez@sinergiab2b.com'
      },
      quote: 'La simplicidad es la máxima sofisticación en código'
    },
    {
      id: 3,
      name: 'Angel Oneil Gutiérrez',
      role: 'Desarrollador Backend y Documentación',
      roleIcon: <FaServer />,
      avatar: <AngelAvatar />,
      description: 'Especialista en arquitectura backend, bases de datos y documentación técnica. Garantiza la robustez, seguridad y escalabilidad del sistema mientras mantiene una documentación clara y actualizada. Experto en diseño de APIs RESTful, microservicios y optimización de consultas de base de datos.',
      skills: ['Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'API REST', 'Swagger', 'Git', 'Docker', 'AWS'],
      social: {
        github: 'https://github.com/angelgutierrez',
        linkedin: 'https://linkedin.com/in/angelgutierrez',
        email: 'angel.gutierrez@sinergiab2b.com'
      },
      quote: 'El código limpio es la mejor documentación'
    }
  ];

  const teamStats = [
    { number: '3', label: 'Miembros del Equipo', icon: <FaUsers /> },
    { number: '500+', label: 'Horas de Desarrollo', icon: <FaProjectDiagram /> },
    { number: '12+', label: 'Tecnologías Utilizadas', icon: <FaRocket /> },
    { number: '100%', label: 'Compromiso', icon: <FaAward /> }
  ];

  return (
    <section className={styles.teamSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Nuestro Equipo
          </h2>
          <p className={styles.sectionSubtitle}>
            Conoce a los profesionales detrás de SinergiaB2B, comprometidos con la excelencia
            y la innovación tecnológica en Nicaragua
          </p>
        </div>

        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.teamCard}>
              <div className={styles.cardHeader}>
                <div className={styles.customAvatar}>
                  {member.avatar}
                  <div className={styles.avatarStatus}></div>
                  <div className={styles.roleBadge}>
                    {member.roleIcon} {member.role.split(' ')[0]}
                  </div>
                </div>
                <h3 className={styles.memberName}>{member.name}</h3>
                <div className={styles.memberRole}>
                  <span className={styles.roleIcon}>{member.roleIcon}</span>
                  {member.role}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.skillsSection}>
                  <div className={styles.skillsTitle}>
                    <FaGraduationCap /> Habilidades Técnicas
                  </div>
                  <div className={styles.skillsList}>
                    {member.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <p className={styles.memberDescription}>
                  {member.description}
                </p>

                {member.quote && (
                  <div className={styles.memberQuote}>
                    <span className={styles.quoteIcon}>"</span>
                    {member.quote}
                  </div>
                )}

                <div className={styles.socialLinks}>
                  <a href={member.social.github} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                    <FaGithub size={18} />
                  </a>
                  <a href={member.social.linkedin} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin size={18} />
                  </a>
                  <a href={`mailto:${member.social.email}`} className={styles.socialLink}>
                    <FaEnvelope size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.teamStats}>
          {teamStats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;