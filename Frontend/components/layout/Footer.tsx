export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Copyright */}
          <div className="text-slate-400 text-sm">
            © 2026 TaskFlow. All rights reserved.
          </div>

          {/* Center - System Info */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="text-slate-600">API:</span>
              <code className="px-2 py-1 bg-dark-bg rounded text-slate-400">
                http://localhost:9080
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-600">Auth:</span>
              <code className="px-2 py-1 bg-dark-bg rounded text-slate-400">
                https://keycloak.lab.home
              </code>
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="https://keycloak.lab.home"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Keycloak
            </a>
            <a
              href="http://localhost:9080/openapi/ui"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              API Docs
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Made with Bob
