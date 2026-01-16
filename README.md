# 🏥 Medical AI Assistant (Dr. CuraVox)

A comprehensive, voice-enabled Medical AI Assistant designed for accessibility. It uses a **Hybrid AI Architecture** (Google Gemini + Local LLaMA/Tesseract) to identify medicines from images, provide detailed clinical insights, and check for drug interactions.

---

## � Features

*   **Hybrid AI Brain**:
    *   **Dr. CuraVox (Gemini 2.5 Flash)**: Primary cloud intelligence for instant, accurate medicine analysis.
    *   **Local Engine (Python)**: Privacy-focused backup using OCR and LLaMA models.
*   **Visual Recognition**: Instantly identifies pills, strips, and syrups via camera or upload.
*   **Voice-First UI**: Fully accessible interface that reads out all results (ideal for visually impaired users).
*   **Safety Checks**: Automatic interaction checking and "Red Flag" safety warnings.

---

## 🛠️ Prerequisites

Ensure you have the following installed:

1.  **Node.js** (v18 or higher)
2.  **Python** (v3.9 or higher)
3.  **MongoDB** (Local or Atlas)
4.  **Tesseract OCR** (System-level installation recommended for local fallback)

---

## � Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd CMRU-MAJOR-PROJECT
```

### 2. Backend Setup (Node.js)
```bash
cd backend_api

# Install Dependencies
npm install
# OR explicitly:
npm install express mongoose dotenv cors multer @google/generative-ai tesseract.js bcryptjs jsonwebtoken axios sharp

# Configure Environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY (See Section 4)
```

### 3. Frontend Setup (React + Vite)
```bash
cd ../frontend_app

# Install Dependencies
npm install
# OR explicitly:
npm install react react-dom react-router-dom axios zustand react-hot-toast @headlessui/react @heroicons/react framer-motion react-dropzone

# Start Development Server
npm run dev
```

### 4. AI Engine Setup (Python)
```bash
cd ../ai_ml_engine

# Install Python Dependencies
pip install -r requirements.txt
# OR manually:
pip install torch transformers datasets accelerate nltk spacy scikit-learn numpy pandas opencv-python pillow torchvision tqdm requests python-dotenv
```

---

## 🔑 AI Configuration (Gemini)

This project uses **Google Gemini** for high-accuracy analysis.

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Create a new **API Key**.
3.  Open `backend_api/.env`.
4.  Paste your key:
    ```env
    GEMINI_API_KEY=AIzaSyYourKeyHere...
    ```

---

## � Full Dependency List

### 🟢 Backend (NPM)
| Package | Purpose |
| :--- | :--- |
| **@google/generative-ai** | Integration with Gemini Pro Vision |
| **tesseract.js** | Optical Character Recognition (OCR) |
| **express** | Web Server Framework |
| **mongoose** | MongoDB Object Modeling |
| **multer** | File Upload Handling |
| **sharp** | Image Processing & Optimization |
| **jsonwebtoken** | User Authentication (JWT) |
| **bcryptjs** | Password Hashing |
| **dotenv** | Environment Variable Management |
| **cors** | Cross-Origin Resource Sharing |

### ⚛️ Frontend (NPM)
| Package | Purpose |
| :--- | :--- |
| **react / react-dom** | UI Library |
| **vite** | Build Tool (Fast!) |
| **zustand** | State Management (Medicine Store) |
| **axios** | API Client |
| **react-router-dom** | Navigation |
| **tailwindcss** | Utility-First CSS Styling |
| **@headlessui/react** | Accessible UI Components |
| **react-hot-toast** | Notifications |
| **framer-motion** | Animations |

### 🐍 AI Engine (Pip)
| Package | Purpose |
| :--- | :--- |
| **torch / torchvision** | PyTorch Deep Learning Framework |
| **transformers** | Hugging Face Models (LLaMA, BERT) |
| **opencv-python** | Computer Vision & Image Preprocessing |
| **pillow** | Image Manipulation |
| **spacy / nltk** | Natural Language Processing |
| **scikit-learn** | Machine Learning Utilities |
| **pandas / numpy** | Data Analysis |

---

## 🏃‍♂️ Running the Application

1.  **Start Database**: Ensure MongoDB is running.
2.  **Start Backend**:
    ```bash
    cd backend_api
    npm run dev
    ```
3.  **Start Frontend**:
    ```bash
    cd frontend_app
    npm run dev
    ```
4.  **Access App**: Open `http://localhost:5173` (or port shown).

---

## 🤝 Contributing
1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
