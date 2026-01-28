# Building with Maven

This guide covers building, testing, and packaging the Authentication Test API using Apache Maven.

## Maven Lifecycle

Maven uses a standard build lifecycle with these main phases:

```
clean → validate → compile → test → package → verify → install → deploy
```

## Basic Build Commands

### Clean Build

Remove all generated files and start fresh:

```bash
mvn clean
```

This deletes the `target/` directory.

### Compile

Compile the source code without running tests:

```bash
mvn compile
```

Output: Compiled classes in `target/classes/`

### Run Tests

Execute unit tests:

```bash
mvn test
```

### Package

Create the WAR file:

```bash
mvn package
```

Output: `target/authentication-test-api.war`

### Full Build

Clean, compile, test, and package in one command:

```bash
mvn clean package
```

This is the most common build command.

## Development Mode

### Liberty Dev Mode

Run the application with hot reload:

```bash
mvn liberty:dev
```

Features:
- **Hot Reload**: Automatically recompiles and redeploys on code changes
- **Test on Save**: Runs tests when files change
- **Debug Ready**: Debug port available on 7777
- **Interactive**: Press Enter to run tests, `r` to restart

Exit with `Ctrl+C`.

### Skip Tests

Build without running tests (faster):

```bash
mvn clean package -DskipTests
```

!!! warning
    Only skip tests during development. Always run tests before committing code.

## Advanced Build Options

### Update Dependencies

Force update of all dependencies:

```bash
mvn clean install -U
```

The `-U` flag forces Maven to check for updated snapshots.

### Offline Build

Build without downloading dependencies:

```bash
mvn clean package -o
```

Requires all dependencies to be in local repository.

### Verbose Output

Show detailed build information:

```bash
mvn clean package -X
```

Useful for debugging build issues.

### Parallel Builds

Build faster using multiple threads:

```bash
mvn clean package -T 4
```

Uses 4 threads. Adjust based on your CPU cores.

## Build Profiles

### Development Profile

```bash
mvn clean package -Pdev
```

### Production Profile

```bash
mvn clean package -Pprod
```

!!! note
    Profiles are defined in `pom.xml` and can customize build behavior.

## Liberty Maven Plugin

### Start Server

Start OpenLiberty server:

```bash
mvn liberty:start
```

Server runs in background.

### Stop Server

Stop the running server:

```bash
mvn liberty:stop
```

### Run Server

Start server in foreground:

```bash
mvn liberty:run
```

Exit with `Ctrl+C`.

### Create Server Package

Create a runnable server package:

```bash
mvn liberty:package
```

Output: `target/authentication-test-api.zip`

### Deploy Application

Deploy WAR to running server:

```bash
mvn liberty:deploy
```

## Build Output

### Directory Structure

After a successful build:

```
target/
├── authentication-test-api.war          # Deployable WAR file
├── authentication-test-api/             # Exploded WAR
├── classes/                             # Compiled classes
├── generated-sources/                   # Generated code
├── maven-archiver/                      # Maven metadata
├── maven-status/                        # Build status
└── test-classes/                        # Compiled test classes
```

### WAR File Contents

The generated WAR file contains:

```
authentication-test-api.war
├── WEB-INF/
│   ├── classes/                         # Application classes
│   │   └── com/example/api/
│   ├── lib/                             # Dependencies (if any)
│   └── web.xml                          # Web descriptor (optional)
└── META-INF/
    └── MANIFEST.MF                      # Manifest file
```

## Dependency Management

### List Dependencies

Show all project dependencies:

```bash
mvn dependency:tree
```

### Analyze Dependencies

Check for unused or undeclared dependencies:

```bash
mvn dependency:analyze
```

### Download Sources

Download source JARs for dependencies:

```bash
mvn dependency:sources
```

Useful for IDE debugging.

### Download Javadocs

Download Javadoc JARs:

```bash
mvn dependency:resolve -Dclassifier=javadoc
```

## Testing

### Run Specific Test

Run a single test class:

```bash
mvn test -Dtest=HelloResourceTest
```

### Run Test Method

Run a specific test method:

```bash
mvn test -Dtest=HelloResourceTest#testHelloEndpoint
```

### Skip Tests

Skip test compilation and execution:

```bash
mvn package -Dmaven.test.skip=true
```

### Test Coverage

Generate test coverage report (requires jacoco plugin):

```bash
mvn clean test jacoco:report
```

Report: `target/site/jacoco/index.html`

## Code Quality

### Compile with Warnings

Show all compiler warnings:

```bash
mvn clean compile -Xlint:all
```

### Format Code

Format code according to style rules (requires formatter plugin):

```bash
mvn formatter:format
```

## Troubleshooting

### Clear Local Repository

If dependencies are corrupted:

```bash
# Remove project dependencies from local repo
rm -rf ~/.m2/repository/com/example/authentication-test-api

# Rebuild
mvn clean install -U
```

### Increase Memory

If build runs out of memory:

```bash
export MAVEN_OPTS="-Xmx2048m -XX:MaxPermSize=512m"
mvn clean package
```

### Debug Build

Run Maven in debug mode:

```bash
mvn clean package -X > build.log 2>&1
```

Review `build.log` for detailed information.

### Dependency Conflicts

Resolve dependency conflicts:

```bash
mvn dependency:tree -Dverbose
```

Look for conflicts marked with `(omitted for conflict with X.Y.Z)`.

## Build Best Practices

### 1. Always Clean Before Release

```bash
mvn clean package
```

Ensures no stale artifacts.

### 2. Run Tests

```bash
mvn clean verify
```

Runs all tests including integration tests.

### 3. Check for Updates

```bash
mvn versions:display-dependency-updates
mvn versions:display-plugin-updates
```

### 4. Verify Build Reproducibility

```bash
mvn clean package
mvn clean package
diff target/authentication-test-api.war target/authentication-test-api.war
```

Builds should be identical.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Build with Maven
  run: mvn clean package -B
```

### GitLab CI

```yaml
build:
  script:
    - mvn clean package
```

### Jenkins

```groovy
sh 'mvn clean package'
```

## Next Steps

- [Containerization](containers.md) - Build container images
- [Running the Server](running.md) - Deploy and run the application
- [Configuration](../config/environment.md) - Configure the application

## Additional Resources

- [Maven Documentation](https://maven.apache.org/guides/)
- [Liberty Maven Plugin](https://github.com/OpenLiberty/ci.maven)
- [Maven Lifecycle Reference](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)