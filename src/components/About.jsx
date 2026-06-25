import { values } from '../data/content';
import LazyScene3D from './LazyScene3D';
import './About.css';

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">About Us</span>
          <h2 className="section-title">Engineering Excellence Since 2010</h2>
          <p className="section-subtitle">
            Acumen Engineering Services is a trusted partner for civil and structural
            engineering firms worldwide, delivering precision-driven BIM, CAD, and detailing solutions.
          </p>
        </div>

        <div className="about__grid">
          <div className="about__content slide-left">
            <div className="about__block glass-card fade-up">
              <h3>Our Mission</h3>
              <p>
                To transform engineering insight into practical, precise, and dependable
                solutions that create value for every project.
              </p>
            </div>
            <div className="about__block glass-card fade-up">
              <h3>Our Vision</h3>
              <p>
                To be recognized worldwide as a trusted engineering services partner,
                delivering excellence through insight, precision, and innovation.
              </p>
            </div>
            <div className="about__intro fade-up">
              <p>
                With over 15 years of experience and a team of 200+ skilled engineers and
                detailers, we serve clients across 12 countries. Our expertise spans
                rebar detailing, structural steel, precast, BIM coordination, and
                comprehensive CAD services for commercial, industrial, and infrastructure projects.
              </p>
            </div>
          </div>

          <div className="about__visual slide-right">
            <LazyScene3D variant="steel" />
          </div>
        </div>

        <div className="about__values">
          <h3 className="about__values-title fade-up">Our Values</h3>
          <div className="about__values-grid stagger-children">
            {values.map((v) => (
              <div key={v.title} className="value-card glass-card">
                <span className="value-card__icon">{v.icon}</span>
                <h4>{v.title}</h4>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
