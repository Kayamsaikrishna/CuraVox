# Frontend App: Comprehensive Documentation (CuraVox)

## 1. System Overview
The **Frontend App** is a modern, accessible Progressive Web App (PWA) built with **React 18** and **Vite**. It is designed specifically for **Blind and Visually Impaired Users**, featuring a Voice-First interface and high-contrast visuals.

### Architecture Diagram
```mermaid
graph TD
    User((User)) -- "Voice/Keys" --> App[App Component]
    
    App --> Context[AppDataContext]
    App --> Router[React Router]
    
    subgraph "Pages"
        Router -- "/" --> Home[HomePage (Dashboard)]
        Router -- "/scan" --> Scan[ScanPage]
        Router -- "/medicines" --> MedList[MedicineListPage]
    end
    
    subgraph "Services"
        Home & Scan --> Voice[VoiceService]
        Home & Scan --> API[API Service (Axios)]
        Scan --> OCR[OCR Service]
    end
    
    Voice -- "WebSpeech API" --> Browser[Browser Microphone]
```

---

## 2. Core Modules

### 2.1. `App.jsx` (Root)
- **Role**: The application shell.
- **Features**:
    - **Global Keyboard Listeners**: Pressing `Space` (to speak) or `H` (for help) works anywhere in the app.
    - **Voice Initialization**: Starts the `VoiceService` on mount.
    - **Routing**: Defines the navigation structure (`/`, `/scan`, `/reminders`).

### 2.2. `contexts/AppDataContext.jsx` (State Management)
- **Role**: The "Single Source of Truth" for application data.
- **Data Stores**:
    - `medicines`: List of available drugs.
    - `reminders`: Active user schedules.
    - `stats`: Dashboard counters (e.g., "3 doses left today").
- **Optimization**: Uses `useReducer` to handle complex state updates efficiently and `useEffect` to poll the backend for updates every 15 seconds.

### 2.3. Services (Logic Layer)

#### `VoiceService.js` (The Accessibility Core)
- **Tech**: Web Speech API (`SpeechRecognition` + `SpeechSynthesis`).
- **Function**:
    - **Listening**: Continuously listens for wake words ("Go to scan", "Read this").
    - **Speaking**: Announces UI changes and AI results aloud for blind users.
    - **Decoupling**: Uses a Custom Event Bus to notify React components without tightly coupling the Voice logic to the UI.

#### `api.js` (Communication)
- **Tech**: Axios.
- **Function**:
    - **Interceptors**: Automatically attaches the JWT token to every request.
    - **Error Handling**: Redirects to `/login` if a 401 Unauthorized error occurs.

#### `reminderService.js` (Scheduler)
- **Tech**: LocalStorage + `setInterval`.
- **Function**: Checks every minute if a medication is due. Triggers visual and audio alerts.

---

## 3. Key Pages

### 3.1. `HomePage.jsx` (Dashboard)
- **Accessibility**:
    - **ARIA Live**: Announces updates dynamically ("Welcome back, you have 2 reminders").
    - **Skip Links**: Hidden links for keyboard users to jump past the creating logic.
    - **Shortcuts**: `Alt+O` (Overview), `Alt+S` (Scan).

### 3.2. `ScanPage.jsx` (OCR Interface)
- **Flow**:
    1. Activates Camera.
    2. Captures Frame.
    3. Sends to Backend (`/api/ocr/process`).
    4. Voices the result: "I found Paracetamol, 500mg. Take 2 tablets."

### 3.3. `MedicineListPage.jsx`
- **Features**: Searchable, filterable list of all medicines.
- **Voice**: "Search for Aspirin" automatically filters this list.

---

## 4. Accessibility Standards
This application adheres to **WCAG 2.1 Level AA**:
- **Contrast**: All colors exceed 4.5:1 contrast ratio.
- **Screen Readers**: All images have `alt` text; buttons have `aria-label`.
- **Keyboard**: Fully navigable without a mouse. Focus indicators are thick and distinct.
