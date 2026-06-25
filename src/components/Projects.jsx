import { projectExperience, projects } from '../data/content';
import './Projects.css';

export default function Projects() {
  return (
    <section id="projects" className="section projects">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-tag">Our Projects</span>
          <h2 className="section-title">Proven Track Record</h2>
          <p className="section-subtitle">
            Extensive experience across foundation, masonry, bridge, infrastructure,
            and panel projects — plus major elite projects delivered in recent years.
          </p>
        </div>

        <div className="projects__experience fade-up">
          <h3 className="projects__subsection-title">Project Experience</h3>
          <div className="projects__table-wrap glass-card">
            <table className="projects__table">
              <thead>
                <tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">Type of Structure</th>
                  <th scope="col">No. of Projects</th>
                  <th scope="col">Scope of Work</th>
                  <th scope="col">Manhours</th>
                </tr>
              </thead>
              <tbody>
                {projectExperience.map((row, index) => (
                  <tr key={row.structure}>
                    <td data-label="Sr.">{index + 1}</td>
                    <td data-label="Type of Structure">{row.structure}</td>
                    <td data-label="No. of Projects">{row.projectCount}</td>
                    <td data-label="Scope of Work">
                      <span className="projects__scope-badge">{row.scope}</span>
                    </td>
                    <td data-label="Manhours">{row.manhours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="projects__major fade-up">
          <h3 className="projects__subsection-title">
            Major Projects — Last Three Years
          </h3>
          <div className="projects__grid stagger-children">
            {projects.map((project) => (
              <article key={project.name} className="project-card">
                <div className="project-card__inner">
                  <div className="project-card__front glass-card">
                    <div className="project-card__type">{project.type}</div>
                    <h3>{project.name}</h3>
                    <p className="project-card__scope-label">Scope: {project.type}</p>
                    <div className="project-card__hover-hint">Hover for details →</div>
                  </div>
                  <div className="project-card__back glass-card">
                    <h3>{project.name}</h3>
                    <p className="project-card__scope">
                      <span className="project-card__scope-label">Scope of Work</span>
                      {project.type}
                    </p>
                    <div className="project-card__metrics">
                      <div>
                        <span className="project-card__metric-label">Manhours</span>
                        <span className="project-card__metric-value">{project.manhours}</span>
                      </div>
                      <div>
                        <span className="project-card__metric-label">Tonnage</span>
                        <span className="project-card__metric-value">{project.tonnage}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
