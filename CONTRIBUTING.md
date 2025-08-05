# Contributing to X Dating App

Thank you for your interest in contributing to the X Dating App! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Docker (optional, for local development)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/xdate.git`
3. Install dependencies: `npm install`
4. Set up environment variables (see README.md)
5. Start development servers: `npm run dev`

## Development Workflow

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `docs/documentation-update` - Documentation changes
- `refactor/component-name` - Code refactoring

### Commit Message Convention
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add X OAuth integration
fix(matching): resolve algorithm performance issue
docs(readme): update installation instructions
```

### Pull Request Process
1. Create a feature branch from `develop`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass: `npm test`
5. Run linting: `npm run lint`
6. Update documentation if needed
7. Create a pull request to `develop`
8. Request review from maintainers

## Code Standards

### JavaScript/TypeScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components
- Use functional components with hooks
- Follow the component naming convention: `PascalCase`
- Keep components small and focused
- Use PropTypes or TypeScript interfaces
- Implement error boundaries where appropriate

### Backend API
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation
- Write comprehensive tests

### Database
- Use migrations for schema changes
- Follow naming conventions
- Add proper indexes
- Document complex queries

## Testing

### Test Structure
- Unit tests for individual functions/components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage should be >80%

### Running Tests
```bash
# All tests
npm test

# Backend tests only
npm run test:backend

# Frontend tests only
npm run test:frontend

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Security Guidelines

### Authentication & Authorization
- Never commit API keys or secrets
- Use environment variables for sensitive data
- Implement proper input validation
- Follow OWASP security guidelines
- Regular security audits

### Data Privacy
- Follow GDPR/CCPA requirements
- Implement proper data encryption
- Use secure communication protocols
- Regular privacy reviews

## Performance Guidelines

### Frontend
- Optimize bundle size
- Implement lazy loading
- Use proper caching strategies
- Monitor Core Web Vitals

### Backend
- Optimize database queries
- Implement proper caching
- Use connection pooling
- Monitor API response times

## Documentation

### Code Documentation
- Document complex algorithms
- Add inline comments for non-obvious code
- Update README files when adding features
- Maintain API documentation

### Architecture Documentation
- Update architecture diagrams
- Document design decisions
- Maintain deployment guides
- Keep troubleshooting guides current

## Review Process

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### Review Guidelines
- Be constructive and respectful
- Focus on code quality and functionality
- Consider security and performance implications
- Ensure maintainability and readability

## Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Steps
1. Create release branch from `develop`
2. Update version numbers
3. Update changelog
4. Run full test suite
5. Create pull request to `main`
6. Merge after approval
7. Create GitHub release
8. Deploy to production

## Getting Help

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Pull Request comments: Code-specific discussions

### Resources
- [Project README](README.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page
- Project documentation

Thank you for contributing to making X Dating App better! 🚀 