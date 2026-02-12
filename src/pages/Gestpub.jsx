import React, { useRef } from 'react';
import { motion } from 'motion/react';
import cpuImg from '../assets/cpus.JPG';
import dn2Img from '../assets/DN2.JPG';
import cactusImg from '../assets/cactus.AVIF';

const Gestpub = () => {
  const scrollRef = useRef(null);

  const myProjects = [
    { id: 1, src: cpuImg, title: "Adidas Campus" },
    { id: 2, src: dn2Img, title: "Airmax Dn" },
    { id: 3, src: cactusImg, title: "J1 cactus" },
    { id: 4, src: cpuImg, title: "campus" },
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="gallery-wrapper">
      <div className="gallery-header">
        <div>
          <h2 style={{ fontSize: '2rem' }}>Commandes <span style={{ color: 'var(--primary)' }}>Récentes</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Voici une sélection des paires les plus commandées le mois dernier</p>
        </div>

        <div className="gallery-controls">
          {['‹', '›'].map((arrow, i) => (
            <button
              key={i}
              onClick={() => scroll(i === 0 ? 'left' : 'right')}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--surface)',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-container" ref={scrollRef}>
        {myProjects.map((project, index) => (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={project.id}
            className="image-card"
          >
            <img src={project.src} alt={project.title} />
            <div className="image-overlay">
              <span>{project.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Gestpub;