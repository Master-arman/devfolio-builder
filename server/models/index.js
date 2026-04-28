const sequelize = require('../config/db');

const User = require('./User');
const Portfolio = require('./Portfolio');
const Skill = require('./Skill');
const Project = require('./Project');
const Education = require('./Education');
const Experience = require('./Experience');
const Certification = require('./Certification');

// Associations
// User.hasOne(Portfolio, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Portfolio.belongsTo(User, { foreignKey: 'userId' });

Portfolio.hasMany(Skill, { foreignKey: 'portfolioId', as: 'skills', onDelete: 'CASCADE' });
Skill.belongsTo(Portfolio, { foreignKey: 'portfolioId' });

Portfolio.hasMany(Project, { foreignKey: 'portfolioId', as: 'projects', onDelete: 'CASCADE' });
Project.belongsTo(Portfolio, { foreignKey: 'portfolioId' });

Portfolio.hasMany(Education, { foreignKey: 'portfolioId', as: 'education', onDelete: 'CASCADE' });
Education.belongsTo(Portfolio, { foreignKey: 'portfolioId' });

Portfolio.hasMany(Experience, { foreignKey: 'portfolioId', as: 'experience', onDelete: 'CASCADE' });
Experience.belongsTo(Portfolio, { foreignKey: 'portfolioId' });

Portfolio.hasMany(Certification, { foreignKey: 'portfolioId', as: 'certifications', onDelete: 'CASCADE' });
Certification.belongsTo(Portfolio, { foreignKey: 'portfolioId' });

module.exports = {
  sequelize,
  User,
  Portfolio,
  Skill,
  Project,
  Education,
  Experience,
  Certification,
};
