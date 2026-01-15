# CuraVox

> **"The Voice of Care."**

**CuraVox** is a cutting-edge **Medical AI Assistant** designed specifically for **Blind and Visually Impaired users**. It bridges the gap between complex medical information and accessibility by combining **Voice-First Design**, **Real-Time OCR**, and **Agentic AI**.

---

## 📚 Documentation Index
| Section | Description | Link |
| :--- | :--- | :--- |
| **System Architecture** | Master High-Level Design & Logic | [MASTER_SYSTEM_ARCHITECTURE.md](./MASTER_SYSTEM_ARCHITECTURE.md) |
| **AI/ML Engine** | Models, Agents, Python Core | [AI Engine Docs](./ai_ml_engine/COMPREHENSIVE_DOCS.md) |
| **Backend API** | Node.js, Routes, Database | [Backend Docs](./backend_api/COMPREHENSIVE_DOCS.md) |
| **Frontend App** | React, Voice Accessibility | [Frontend Docs](./frontend_app/COMPREHENSIVE_DOCS.md) |
| **DevOps & QA** | Docker, Testing, Deployment | [DevOps Docs](./devops_qa/COMPREHENSIVE_DOCS.md) |

---

## 🚀 Key Features

### 1. 🗣️ Voice-First Interface
- Fully navigable via **Voice Commands** (e.g., *"Go to scan"*, *"Tell me about Aspirin"*).
- **Proactive Announcements**: The dashboard welcomes users and reads out alerts aloud.
- Built-in **Screen Reader** support (ARIA Live Regions).

### 2. 👁️ Medicine Vision (OCR)
- Instantly identifies medicines by scanning pill bottles or strips.
- Uses **Hybrid Analysis** (Tesseract OCR + Regex + Fuzzy Matching) to extract dosages (`500mg`) and drug names (`Paracetamol`) even from blurry images.

### 3. 🧠 Hybrid AI Intelligence
- **Local LLMs** (Ollama): Provides conversational, empathetic medical advice.
- **Medical Agents**: A team of specialized "AI Doctors" (Cardiologist, Neurologist, GP) that collaborate to diagnose symptoms with high accuracy.
- **Safety**: Includes strict protocols to refer emergencies (e.g., Chest Pain) to real doctors immediately.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Web Speech API, Tailwind CSS (Custom).
- **Backend**: Node.js, Express, Mongoose (MongoDB).
- **AI Engine**: Python 3.9, PyTorch, Transformers (Hugging Face), Ollama.
- **Infrastructure**: Docker, Docker Compose, Nginx.

---

## ⚡ Quick Start

### Prerequisites
- **Docker & Docker Compose** installed.
- **Ollama** installed locally (for the LLM).

### Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Kayamsaikrishna/CuraVox.git
    cd CuraVox
    ```

2.  **Pull AI Models** (One-time setup):
    ```bash
    ollama pull medllama2
    # OR
    ollama pull llama3.2
    ```

3.  **Run with Docker**:
    ```bash
    cd devops_qa/docker
    docker-compose up --build
    ```

4.  **Access the App**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🛡️ License
This project is licensed under the MIT License.
