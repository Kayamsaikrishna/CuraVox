# DevOps & QA: Comprehensive Documentation

## 1. Deployment Architecture
The system is designed for **Containerized Deployment** using Docker and Docker Compose. This ensures consistency across Development, Testing, and Production environments.

### Architecture Diagram
```mermaid
graph TD
    subgraph "Docker Host"
        Proxy[Nginx (Frontend)] -- Port 80 --> User
        
        API[Node.js Backend] -- Port 5000 --> Proxy
        API -- "Internal Network" --> DB[(MongoDB)]
        API -- "Spawns" --> Python[AI Engine Process]
        
        Python -- "HTTP" --> Ollama[Ollama Service]
    end
```

---

## 2. Docker Integration

### 2.1. `Dockerfile.backend`
- **Base**: `node:18-alpine`.
- **Enhancements**:
    - Installs **Python 3** and build tools (`make`, `g++`) explicitly. This is critical because the Node.js backend spawns a Python child process for the AI Engine.
    - Installs both `npm` dependencies and Python `pip` requirements.
- **Stages**:
    - `builder`: Compiles and installs dependencies.
    - `production`: Copies only necessary artifacts to keep the image small.

### 2.2. `Dockerfile.frontend`
- **Base**: `node:18-alpine` (Build) -> `nginx:alpine` (Runtime).
- **Process**:
    1.  Compiles the React code (`npm run build`) into static HTML/JS/CSS files.
    2.  Copies these files to the Nginx html folder.
    3.  Uses a custom `nginx.conf` to handle React Router's single-page app behavior (redirecting 404s to `index.html`).

### 2.3. `docker-compose.yml`
- **Orchestration**: Defines the relationship between services.
- **Services**:
    - `frontend`: Depends on `backend`.
    - `backend`: Depends on `mongo` and `ollama`.
    - `mongo`: Persistent database storage via Volumes.
    - `ollama`: Runs the local LLM server.

---

## 3. Testing Strategies

### 3.1. Backend Integration Tests (`tests/backend.test.js`)
- **Framework**: Jest + Supertest.
- **Coverage**:
    - **Auth**: Verifies Registration and Login flows.
    - **RBAC**: Ensures normal users cannot delete medicines (Admin only).
    - **Endpoints**: Tests happy paths and error cases for `/api/medicine` and `/api/ocr`.
- **Mocking**: The AI Engine calls are often mocked in unit tests to avoid loading heavy Python models during quick CI checks.

### 3.2. Manual Verification
- **Health Check**: An endpoint `/api/health` confirms DB connection.
- **Logs**: Docker logs provide real-time feedback on the Python AI process spawning.

---

## 4. Continuous Integration (CI) / Workflow
1.  **Code Change**: Developer pushes to Git.
2.  **Test**: CI Request runs `npm test` (Jest).
3.  **Build**: Docker images are built for Frontend and Backend.
4.  **Deploy**: `docker-compose up -d` pulls the new images and restarts services with zero downtime (if using a orchestrator like Swarm/K8s) or minimal downtime.

## 5. Environment Variables
Configuration is managed via `.env` files loaded by Docker:
- `MONGODB_URI`: Connection string.
- `JWT_SECRET`: Crypto key for tokens.
- `NODE_ENV`: `production` or `development`.
- `PYTHON_PATH`: Path to the python executable inside the container.
