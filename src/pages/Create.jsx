import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import LivePreview from '../components/LivePreview';
import { supabase } from '../supabaseClient';
import './Create.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'skills', label: 'Skills', icon: '🛠' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'certifications', label: 'Certificates', icon: '🏆' },
  { id: 'social', label: 'Social', icon: '🔗' },
  { id: 'template', label: 'Template', icon: '🎨' },
];

export default function Create() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const {
    currentPortfolio,
    editingId,
    portfolios,
    updateProfile,
    updateSocialLinks,
    setTemplate,
    addSkill,
    removeSkill,
    updateSkillLevel,
    addProject,
    removeProject,
    addEducation,
    removeEducation,
    addExperience,
    removeExperience,
    addCertification,
    removeCertification,
    savePortfolio,
    resetForm,
    editPortfolio,
  } = usePortfolio();

  const [isSaving, setIsSaving] = useState(false);

  // Auto-load existing portfolio for editing if user already has one
  // This prevents creating duplicates when user clicks "New Portfolio"
  useEffect(() => {
    if (!editingId && portfolios.length > 0) {
      const existingPortfolio = portfolios[0];
      if (existingPortfolio && existingPortfolio.id) {
        console.log('📝 Auto-loading existing portfolio for editing:', existingPortfolio.id);
        editPortfolio(existingPortfolio.id);
      }
    }
  }, []); // Run only on mount

  const handleSave = async () => {
    if (!currentPortfolio.profile.name.trim()) {
      alert('Please enter your name before saving!');
      return;
    }
    setIsSaving(true);
    try {
      await savePortfolio();
      alert('Portfolio saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to save portfolio. ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-page bg-gradient-mesh">
      <div className="container">
        <div className="create-header animate-fadeIn">
          <div>
            <h1 className="page-title">
              {editingId ? 'Edit' : 'Create'} <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="page-subtitle">Fill in your details and choose a template</p>
          </div>
          <div className="create-header-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '✏️ Editor' : '👁 Preview'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>
              🔄 Reset
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '⏳ Saving...' : '💾 Save Portfolio'}
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="preview-wrapper animate-fadeIn">
            <LivePreview data={currentPortfolio} />
          </div>
        ) : (
          <div className="create-layout animate-fadeInUp">
            {/* Tabs */}
            <div className="form-tabs">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="form-content card">
              {activeTab === 'profile' && (
                <ProfileTab
                  data={currentPortfolio.profile}
                  onChange={updateProfile}
                />
              )}
              {activeTab === 'skills' && (
                <SkillsTab
                  skills={currentPortfolio.skills}
                  onAdd={addSkill}
                  onRemove={removeSkill}
                  onUpdateLevel={updateSkillLevel}
                />
              )}
              {activeTab === 'experience' && (
                <ExperienceTab
                  experience={currentPortfolio.experience || []}
                  onAdd={addExperience}
                  onRemove={removeExperience}
                />
              )}
              {activeTab === 'projects' && (
                <ProjectsTab
                  projects={currentPortfolio.projects}
                  onAdd={addProject}
                  onRemove={removeProject}
                />
              )}
              {activeTab === 'education' && (
                <EducationTab
                  education={currentPortfolio.education}
                  onAdd={addEducation}
                  onRemove={removeEducation}
                />
              )}
              {activeTab === 'certifications' && (
                <CertificationsTab
                  certifications={currentPortfolio.certifications || []}
                  onAdd={addCertification}
                  onRemove={removeCertification}
                />
              )}
              {activeTab === 'social' && (
                <SocialTab
                  data={currentPortfolio.socialLinks}
                  onChange={updateSocialLinks}
                />
              )}
              {activeTab === 'template' && (
                <TemplateTab
                  selected={currentPortfolio.template}
                  onSelect={setTemplate}
                />
              )}
            </div>

            {/* Mini Preview */}
            <div className="mini-preview-panel">
              <h3 className="mini-preview-title">
                <span>Live Preview</span>
                <span className="live-dot"></span>
              </h3>
              <div className="mini-preview-content">
                <LivePreview data={currentPortfolio} mini />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Image Upload Helper ===== */
async function uploadImageToSupabase(file) {
  if (!supabase) {
    throw new Error('Supabase is not configured! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

/* ===== Profile Tab ===== */
function ProfileTab({ data, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToSupabase(file);
      onChange('avatar', imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Profile Information</h2>
      <p className="tab-desc">Basic info about yourself</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. John Doe"
            value={data.name}
            onChange={e => onChange('name', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Professional Title</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Full Stack Developer"
            value={data.title}
            onChange={e => onChange('title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. New Delhi, India"
            value={data.location}
            onChange={e => onChange('location', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="e.g. john@example.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Profile Picture</label>
          <div className="image-upload-area">
            {data.avatar && (
              <div className="image-preview-thumb">
                <img src={data.avatar} alt="Avatar preview" />
              </div>
            )}
            <div className="image-upload-controls">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading...' : '📁 Choose from PC'}
              </button>
              <span className="upload-or">or</span>
              <input
                className="form-input"
                type="url"
                placeholder="Paste image URL..."
                value={data.avatar}
                onChange={e => onChange('avatar', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Bio / About Me</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Write a short bio about yourself..."
          value={data.bio}
          onChange={e => onChange('bio', e.target.value)}
          rows={5}
        />
      </div>
    </div>
  );
}

/* ===== Skills Tab ===== */
function SkillsTab({ skills, onAdd, onRemove, onUpdateLevel }) {
  const [newSkill, setNewSkill] = useState('');

  const handleAdd = () => {
    if (newSkill.trim()) {
      onAdd(newSkill);
      setNewSkill('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Your Skills</h2>
      <p className="tab-desc">Add your technical and professional skills</p>

      <div className="skill-input-row">
        <input
          className="form-input"
          type="text"
          placeholder="e.g. React, Node.js, UI Design..."
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add
        </button>
      </div>

      {skills.length > 0 && (
        <div className="skills-list">
          {skills.map(skill => (
            <div key={skill.id} className="skill-item">
              <div className="skill-info">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level-text">{skill.level}%</span>
              </div>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <div className="skill-controls">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={skill.level}
                  onChange={e => onUpdateLevel(skill.id, parseInt(e.target.value))}
                  className="skill-slider"
                />
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onRemove(skill.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length === 0 && (
        <div className="empty-tab">
          <p>No skills added yet. Start typing above!</p>
        </div>
      )}
    </div>
  );
}

/* ===== Experience Tab ===== */
function ExperienceTab({ experience, onAdd, onRemove }) {
  const [form, setForm] = useState({
    role: '',
    company: '',
    duration: '',
    description: '',
    location: '',
  });

  const handleAdd = () => {
    if (form.role.trim() && form.company.trim()) {
      onAdd({ ...form });
      setForm({ role: '', company: '', duration: '', description: '', location: '' });
    } else {
      alert('Please fill in Job Title and Company!');
    }
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Work Experience</h2>
      <p className="tab-desc">Add your professional work experience</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Job Title / Role *</label>
          <input
            className="form-input"
            placeholder="e.g. Frontend Developer"
            value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Company *</label>
          <input
            className="form-input"
            placeholder="e.g. Google"
            value={form.company}
            onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Duration</label>
          <input
            className="form-input"
            placeholder="e.g. Jan 2022 - Present"
            value={form.duration}
            onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="form-input"
            placeholder="e.g. Bangalore, India"
            value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
          />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: 12 }}>
        <label className="form-label">Description</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Describe your role and achievements..."
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={3}
        />
      </div>
      <button className="btn btn-primary" onClick={handleAdd} style={{ marginTop: 16 }}>
        + Add Experience
      </button>

      {experience.length > 0 && (
        <div className="items-list">
          {experience.map(exp => (
            <div key={exp.id} className="item-card">
              <div className="item-header">
                <h4>{exp.role} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>at</span> {exp.company}</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => onRemove(exp.id)}>✕</button>
              </div>
              {exp.duration && <p className="item-meta"><span>📅 {exp.duration}</span></p>}
              {exp.location && <p className="item-meta"><span>📍 {exp.location}</span></p>}
              {exp.description && <p className="item-desc">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {experience.length === 0 && (
        <div className="empty-tab">
          <p>No experience added yet. Add your work history above!</p>
        </div>
      )}
    </div>
  );
}

/* ===== Projects Tab ===== */
function ProjectsTab({ projects, onAdd, onRemove }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    tech: '',
    link: '',
    image: '',
  });
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToSupabase(file);
      setForm(p => ({ ...p, image: imageUrl }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!form.title.trim()) {
      alert('Please enter a project title!');
      return;
    }
    onAdd({
      title: form.title,
      description: form.description,
      tech: form.tech.split(',').map(t => t.trim()).filter(Boolean),
      link: form.link,
      image: form.image,
    });
    setForm({ title: '', description: '', tech: '', link: '', image: '' });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Your Projects</h2>
      <p className="tab-desc">Showcase your best work</p>

      <div className="project-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input
              className="form-input"
              placeholder="e.g. E-commerce App"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Live Link / GitHub</label>
            <input
              className="form-input"
              placeholder="https://github.com/..."
              value={form.link}
              onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Technologies (comma-separated)</label>
            <input
              className="form-input"
              placeholder="React, Node.js, MongoDB"
              value={form.tech}
              onChange={e => setForm(p => ({ ...p, tech: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Project Image</label>
            <div className="image-upload-area">
              {form.image && (
                <div className="image-preview-thumb">
                  <img src={form.image} alt="Project preview" />
                </div>
              )}
              <div className="image-upload-controls">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? '⏳ Uploading...' : '📁 Choose'}
                </button>
                <span className="upload-or">or</span>
                <input
                  className="form-input"
                  type="url"
                  placeholder="Paste URL..."
                  value={form.image}
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Describe your project..."
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={3}
          />
        </div>
        <button className="btn btn-primary" onClick={handleAdd} style={{ marginTop: 16 }}>
          + Add Project
        </button>
      </div>

      {projects.length > 0 && (
        <div className="items-list">
          {projects.map(project => (
            <div key={project.id} className="item-card">
              <div className="item-header">
                <h4>{project.title}</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => onRemove(project.id)}>
                  ✕
                </button>
              </div>
              {project.image && (
                <div className="item-project-image">
                  <img src={project.image} alt={project.title} />
                </div>
              )}
              {project.description && <p className="item-desc">{project.description}</p>}
              {project.tech?.length > 0 && (
                <div className="item-tags">
                  {project.tech.map((t, i) => (
                    <span key={i} className="badge">{t}</span>
                  ))}
                </div>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="item-link">
                  🔗 {project.link}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div className="empty-tab">
          <p>No projects added yet. Add your best work above!</p>
        </div>
      )}
    </div>
  );
}

/* ===== Education Tab ===== */
function EducationTab({ education, onAdd, onRemove }) {
  const [form, setForm] = useState({
    institution: '',
    degree: '',
    field: '',
    year: '',
    grade: '',
  });

  const handleAdd = () => {
    if (!form.institution.trim() || !form.degree.trim()) {
      alert('Please fill in Institution and Degree!');
      return;
    }
    onAdd({ ...form });
    setForm({ institution: '', degree: '', field: '', year: '', grade: '' });
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Education</h2>
      <p className="tab-desc">Your academic background</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Institution *</label>
          <input
            className="form-input"
            placeholder="e.g. IIT Delhi"
            value={form.institution}
            onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Degree *</label>
          <input
            className="form-input"
            placeholder="e.g. B.Tech"
            value={form.degree}
            onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Field of Study</label>
          <input
            className="form-input"
            placeholder="e.g. Computer Science"
            value={form.field}
            onChange={e => setForm(p => ({ ...p, field: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Year / Duration</label>
          <input
            className="form-input"
            placeholder="e.g. 2020 - 2024"
            value={form.year}
            onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Grade / CGPA</label>
          <input
            className="form-input"
            placeholder="e.g. 8.5 CGPA"
            value={form.grade}
            onChange={e => setForm(p => ({ ...p, grade: e.target.value }))}
          />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleAdd} style={{ marginTop: 16 }}>
        + Add Education
      </button>

      {education.length > 0 && (
        <div className="items-list">
          {education.map(edu => (
            <div key={edu.id} className="item-card">
              <div className="item-header">
                <h4>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => onRemove(edu.id)}>✕</button>
              </div>
              <p className="item-desc">{edu.institution}</p>
              <div className="item-meta">
                {edu.year && <span>📅 {edu.year}</span>}
                {edu.grade && <span>⭐ {edu.grade}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {education.length === 0 && (
        <div className="empty-tab">
          <p>No education added yet.</p>
        </div>
      )}
    </div>
  );
}

/* ===== Certifications Tab ===== */
function CertificationsTab({ certifications, onAdd, onRemove }) {
  const [form, setForm] = useState({
    name: '',
    issuer: '',
    year: '',
    link: '',
  });

  const handleAdd = () => {
    if (!form.name.trim()) {
      alert('Please enter a certificate name!');
      return;
    }
    // Create a copy to avoid reference issues
    const certData = {
      name: form.name.trim(),
      issuer: form.issuer.trim(),
      year: form.year.trim(),
      link: form.link.trim(),
    };
    console.log('Adding certification:', certData);
    onAdd(certData);
    setForm({ name: '', issuer: '', year: '', link: '' });
  };

  return (
    <div className="tab-content">
      <h2 className="tab-title">Certifications</h2>
      <p className="tab-desc">Add your professional certifications and achievements</p>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Certificate Name *</label>
          <input
            className="form-input"
            placeholder="e.g. AWS Certified Developer"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Issuing Organization</label>
          <input
            className="form-input"
            placeholder="e.g. Amazon Web Services"
            value={form.issuer}
            onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Year</label>
          <input
            className="form-input"
            placeholder="e.g. 2024"
            value={form.year}
            onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Certificate Link</label>
          <input
            className="form-input"
            placeholder="https://..."
            value={form.link}
            onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
          />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleAdd} style={{ marginTop: 16 }}>
        + Add Certification
      </button>

      {certifications.length > 0 && (
        <div className="items-list">
          {certifications.map(cert => (
            <div key={cert.id} className="item-card">
              <div className="item-header">
                <h4>🏆 {cert.name}</h4>
                <button className="btn btn-ghost btn-sm" onClick={() => onRemove(cert.id)}>✕</button>
              </div>
              {cert.issuer && <p className="item-desc">Issued by: {cert.issuer}</p>}
              <div className="item-meta">
                {cert.year && <span>📅 {cert.year}</span>}
                {cert.link && (
                  <a href={cert.link} target="_blank" rel="noopener noreferrer" className="item-link">
                    🔗 View Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {certifications.length === 0 && (
        <div className="empty-tab">
          <p>No certifications added yet.</p>
        </div>
      )}
    </div>
  );
}

/* ===== Social Tab ===== */
function SocialTab({ data, onChange }) {
  const links = [
    { key: 'github', label: 'GitHub', icon: '🐙', placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
    { key: 'twitter', label: 'Twitter / X', icon: '🐦', placeholder: 'https://twitter.com/username' },
    { key: 'website', label: 'Website', icon: '🌐', placeholder: 'https://yoursite.com' },
    { key: 'dribbble', label: 'Dribbble', icon: '🏀', placeholder: 'https://dribbble.com/username' },
    { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: 'https://instagram.com/username' },
  ];

  return (
    <div className="tab-content">
      <h2 className="tab-title">Social Links</h2>
      <p className="tab-desc">Connect your online profiles</p>

      <div className="social-grid">
        {links.map(link => (
          <div key={link.key} className="form-group social-input">
            <label className="form-label">{link.icon} {link.label}</label>
            <input
              className="form-input"
              type="url"
              placeholder={link.placeholder}
              value={data[link.key]}
              onChange={e => onChange(link.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Template Tab ===== */
function TemplateTab({ selected, onSelect }) {
  const templates = [
    {
      id: 'minimal',
      name: 'Minimal',
      desc: 'Clean, elegant, and professional. Works for every industry.',
      accent: '#6C63FF',
      bg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    },
    {
      id: 'developer',
      name: 'Developer',
      desc: 'Terminal-inspired dark theme. Perfect for tech professionals.',
      accent: '#06D6A0',
      bg: 'linear-gradient(135deg, #0d1117, #161b22)',
    },
    {
      id: 'creative',
      name: 'Creative',
      desc: 'Bold gradients and vibrant colors for designers and creatives.',
      accent: '#FF6B9D',
      bg: 'linear-gradient(135deg, #2d1b69, #11998e)',
    },
    {
      id: 'elegant',
      name: 'Elegant',
      desc: 'Sophisticated gold accents with a luxury dark theme.',
      accent: '#D4AF37',
      bg: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
    },
    {
      id: 'glassmorphism',
      name: 'Glass',
      desc: 'Modern frosted glass effect with gradient background.',
      accent: '#00D2FF',
      bg: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    },
    {
      id: 'neon',
      name: 'Neon',
      desc: 'Cyberpunk-inspired neon glow theme. Stand out from the crowd.',
      accent: '#FF00FF',
      bg: 'linear-gradient(135deg, #0a0a0a, #1a0a2e)',
    },
    {
      id: 'modern',
      name: 'Modern',
      desc: 'Sleek, contemporary design with smooth animations and blobs.',
      accent: '#8C52FF',
      bg: 'linear-gradient(135deg, #0b0b0d, #1a1a2e)',
    },
    {
      id: 'professional',
      name: 'Professional',
      desc: 'High-contrast, structured corporate layout for peak professionalism.',
      accent: '#64FFDA',
      bg: 'linear-gradient(135deg, #0A192F, #112240)',
    },
  ];

  return (
    <div className="tab-content">
      <h2 className="tab-title">Choose Template</h2>
      <p className="tab-desc">Select a style for your portfolio</p>

      <div className="template-grid">
        {templates.map(tmpl => (
          <button
            key={tmpl.id}
            className={`template-option ${selected === tmpl.id ? 'selected' : ''}`}
            onClick={() => onSelect(tmpl.id)}
          >
            <div className="template-option-preview" style={{ background: tmpl.bg }}>
              <div className="top-bar">
                <div className="top-dot" style={{ background: tmpl.accent }}></div>
                <div className="top-dot" style={{ background: tmpl.accent, opacity: 0.5 }}></div>
                <div className="top-dot" style={{ background: tmpl.accent, opacity: 0.3 }}></div>
              </div>
              <div className="top-avatar" style={{ background: tmpl.accent }}></div>
              <div className="top-line" style={{ background: tmpl.accent, width: '50%' }}></div>
              <div className="top-line" style={{ width: '70%' }}></div>
              <div className="top-line" style={{ width: '40%' }}></div>
            </div>
            <div className="template-option-info">
              <h4>{tmpl.name}</h4>
              <p>{tmpl.desc}</p>
            </div>
            {selected === tmpl.id && (
              <div className="template-selected-badge">✓ Selected</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
