import { useState } from 'react';
import { serviceCategories } from '../data/content';
import './Services.css';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('steel');
  const [expandedService, setExpandedService] = useState(null);

  const category = serviceCategories.find((c) => c.id === activeCategory);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setExpandedService(null);
  };

  const toggleService = (name) => {
    const isTouch =
      window.matchMedia('(hover: none)').matches || window.innerWidth <= 768;
    if (!isTouch) return;
    setExpandedService((prev) => (prev === name ? null : name));
  };

  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Our Services</span>
          <h2 className="section-title">Comprehensive Engineering Solutions</h2>
          <p className="section-subtitle">
            From rebar detailing to full BIM coordination — we provide end-to-end
            structural engineering support tailored to your project needs.
          </p>
        </div>

        <div className="services__tabs fade-up">
          {serviceCategories.map((cat) => (
            <button
              key={cat.id}
              className={`services__tab ${activeCategory === cat.id ? 'services__tab--active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
              style={{ '--tab-color': cat.color }}
            >
              <span className="services__tab-icon">{cat.icon}</span>
              <span className="services__tab-label">{cat.title}</span>
              <span className="services__tab-short">{cat.title.split(/[/—]/)[0].trim()}</span>
            </button>
          ))}
        </div>

        <div className="services__panel fade-in" key={activeCategory}>
          <div className="services__panel-header">
            <div
              className="services__panel-icon"
              style={{ background: `${category.color}20`, color: category.color }}
            >
              {category.icon}
            </div>
            <div className="services__panel-text">
              <h3>{category.title}</h3>
              {category.overview && (
                <p className="services__overview">{category.overview}</p>
              )}
              {category.servicesHeading && (
                <p className="services__services-heading">{category.servicesHeading}</p>
              )}
              {category.servicesIntro && (
                <p className="services__intro">{category.servicesIntro}</p>
              )}
              <p className="services__hint services__hint--desktop">Hover over each service to learn more</p>
              <p className="services__hint services__hint--mobile">Tap each service to learn more</p>
            </div>
          </div>

          {category.serviceGroups ? (
            <div className="services__groups stagger-children">
              {category.serviceGroups.map((group) => (
                <div key={group.heading} className="services__group">
                  <h4 className="services__group-heading">{group.heading}</h4>
                  <div className="services__grid">
                    {group.services.map((service) => (
                      <div
                        key={service.name}
                        className={`service-item glass-card ${expandedService === service.name ? 'service-item--expanded' : ''}`}
                        onClick={() => toggleService(service.name)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleService(service.name)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="service-item__front">
                          <span className="service-item__dot" style={{ background: category.color }} />
                          <h4>{service.name}</h4>
                          <span className="service-item__chevron" aria-hidden="true">›</span>
                        </div>
                        <div className="service-item__back">
                          <p>{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="services__grid stagger-children">
              {category.services.map((service) => (
                <div
                  key={service.name}
                  className={`service-item glass-card ${expandedService === service.name ? 'service-item--expanded' : ''}`}
                  onClick={() => toggleService(service.name)}
                  onKeyDown={(e) => e.key === 'Enter' && toggleService(service.name)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="service-item__front">
                    <span className="service-item__dot" style={{ background: category.color }} />
                    <h4>{service.name}</h4>
                    <span className="service-item__chevron" aria-hidden="true">›</span>
                  </div>
                  <div className="service-item__back">
                    <p>{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {category.closingNote && (
            <p className="services__closing fade-up">{category.closingNote}</p>
          )}
        </div>
      </div>
    </section>
  );
}
