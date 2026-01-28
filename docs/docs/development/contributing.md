# Contributing Guide

Guidelines for contributing to the Authentication Test API project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/authentication_test.git
cd authentication_test

# Build project
mvn clean package

# Run in development mode
mvn liberty:dev
```

## Code Style

- Follow Java naming conventions
- Use meaningful variable names
- Add JavaDoc comments for public methods
- Keep methods focused and concise

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for 80%+ code coverage

```bash
mvn test
```

## Documentation

- Update documentation for new features
- Keep README.md current
- Add examples for new endpoints

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure build passes
4. Request review from maintainers

## Next Steps

- [Project Structure](structure.md)
- [Building with Maven](../build/maven.md)
