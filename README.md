# KnowbaseAI - Multi-Tenant AI Document Chat Platform

A modern, full-stack web application that enables users to upload documents, chat with AI about their content, and embed interactive chat widgets on external websites. Built with cutting-edge technologies and designed for scalability.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Development](#development)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**KnowbaseAI** is an intelligent document management and chat platform that leverages AI to provide contextual answers about uploaded documents. It supports multi-tenant architecture, allowing multiple organizations to manage their own documents and embeddings independently.

**Perfect for:**
- Customer support teams wanting to automate FAQ responses
- Educational institutions providing AI tutoring
- Enterprise knowledge bases
- Product documentation assistance
- Content creators engaging with their audience

---

## ✨ Key Features

### 🔐 **Authentication & Multi-Tenancy**
- Secure JWT-based authentication
- Role-based access control (RBAC)
- Multi-tenant support with isolated data

### 📚 **Document Management**
- Upload and manage documents (PDF, TXT, DOCX support)
- Automatic document processing and chunking
- Vector embeddings using Chroma vector database
- Document metadata tracking

### 💬 **AI Chat Interface**
- Real-time chat with AI about document content
- Context-aware responses powered by Groq's LLaMA model
- Chat history and session management
- Rate limiting to prevent abuse

### 🧩 **Embeddable Widgets**
- Deploy chat widgets on external websites
- CORS-enabled cross-origin communication
- Customizable widget appearance
- Easy integration with one script tag

### 🔧 **Admin Dashboard**
- Tenant management interface
- User management and permissions
- Document upload and organization
- Widget configuration and deployment
- Usage analytics and monitoring

### ⚡ **Performance & Reliability**
- Fast API responses
- Rate limiting and request throttling
- Error handling and basic logging
- Database transaction management

---

## 🛠 Tech Stack

### **Backend**
- **Framework:** FastAPI (Python 3.14+)
- **Database:** PostgreSQL
- **Vector DB:** Chroma (semantic search)
- **LLM:** Groq Cloud API (LLaMA 3.3 70B)
- **Embeddings:** Sentence Transformers (all-MiniLM-L6-v2)
- **Auth:** JWT tokens with bcrypt
- **ORM:** SQLAlchemy

### **Frontend**
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** CSS3
- **HTTP Client:** Axios

### **Infrastructure**
- **Containerization:** Docker
- **Package Management:** pip (Python), npm (Node.js)

---

## 📁 Project Structure

```
KnowbaseAI/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/        # API route handlers
│   │   │       │   ├── auth.py      # Authentication endpoints
│   │   │       │   ├── users.py     # User management
│   │   │       │   ├── tenants.py   # Tenant management
│   │   │       │   ├── documents.py # Document upload & retrieval
│   │   │       │   └── widgets.py   # Widget management
│   │   │       └── api.py           # Route aggregation
│   │   ├── crud/                    # Database operations
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic validation schemas
│   │   ├── dependencies/            # FastAPI dependencies
│   │   ├── utils/                   # Utility functions
│   │   ├── tasks/                   # Background jobs
│   │   ├── config.py               # Configuration management
│   │   ├── db.py                   # Database setup
│   │   └── main.py                 # FastAPI application
│   ├── chroma/                      # Vector database storage
│   ├── uploaded_files/              # Document storage
│   └── knowbase.sql                # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ProtectedRoute.jsx  # Auth-protected wrapper
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Widgets.jsx
│   │   ├── contexts/               # React contexts (global state)
│   │   ├── layouts/                # Layout components
│   │   ├── api/                    # API client utilities
│   │   ├── utils/                  # Helper functions
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
└── Dockerfile                       # Docker containerization
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **Docker** (optional, for containerized deployment) - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - For version control

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_LLM_MODEL=llama-3.3-70b-versatile

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@localhost:5432/knowbaseai

# Chroma Vector Database
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Embedding Model
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# JWT Secret (for token signing)
JWT_SECRET=your_super_secret_key_here

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

**Getting a Groq API Key:**
1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

### Installation

#### 1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/KnowbaseAI.git
cd KnowbaseAI
```

#### 2. **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database (if needed)
# python -c "from app.db import Base, engine; Base.metadata.create_all(bind=engine)"
```

#### 3. **Frontend Setup**

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Build for production (optional)
npm run build
```

---

## ⚙️ Configuration

### Backend Configuration

Key environment variables in `backend/app/config.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | - | **Required** - Groq API key for LLM |
| `GROQ_LLM_MODEL` | `llama-3.3-70b-versatile` | LLM model to use |
| `CHROMA_HOST` | `localhost` | Chroma vector DB host |
| `CHROMA_PORT` | `8000` | Chroma vector DB port |
| `SENTENCE_TRANSFORMER_MODEL` | `all-MiniLM-L6-v2` | Embedding model |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL for CORS |
| `JWT_SECRET` | - | Secret key for JWT tokens |
| `DATABASE_URL` | - | PostgreSQL connection string |

### Database

The application uses **PostgreSQL** for all environments (local development and production). A valid PostgreSQL connection string must be provided via the `DATABASE_URL` environment variable. Database initialization and migrations happen automatically on application startup.

---

## 🎬 Running the Application

### Development Mode

#### Terminal 1 - Backend (FastAPI)

```bash
cd backend

# Activate virtual environment
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Start Chroma vector database
chroma run --host localhost --port 8000

# In another terminal window:
# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: **http://localhost:8000**  
API Documentation: **http://localhost:8000/docs**

#### Terminal 2 - Frontend (React + Vite)

```bash
cd frontend

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

### Production Mode

See [Docker Deployment](#docker-deployment) section below.

---

## 🐳 Docker Deployment

### Building Docker Image

```bash
# Build the image
docker build -t knowbaseai:latest .

# Run the container
docker run -p 8000:8000 -p 5173:5173 \
  -e GROQ_API_KEY=your_key \
  -e CHROMA_HOST=chroma-service \
  -e CLIENT_URL=http://your-domain.com \
  knowbaseai:latest
```

### Docker Compose (Recommended)

See [DOCKER.md](DOCKER.md) and [docker-compose.yml](docker-compose.yml) for complete Docker setup instructions.

Quick start:

```bash
cp .env.example .env
# Edit .env and add GROQ_API_KEY and DATABASE_URL
docker-compose up --build
```

Services:
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Chroma: http://localhost:8001

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Users
- `GET /users/me` - Get current user profile

### Tenants
- `GET /tenants/` - List user's tenants
- `POST /tenants/` - Create new tenant
- `POST /tenants/switch/{tenant_id}` - Switch to different tenant
- `GET /tenants/current` - Get current tenant details with stats
- `GET /tenants/current/users` - Get tenant users
- `POST /tenants/invite/` - Invite user to tenant (admin only)
- `POST /tenants/remove` - Remove user from tenant (admin only)

### Documents
- `GET /documents/` - List tenant documents
- `POST /documents/upload` - Upload document file
- `POST /documents/crawl` - Crawl and index website
- `GET /documents/chat/session/{session_id}` - Get chat session messages
- `POST /documents/query` - Query documents with streaming response
- `POST /documents/widget/query` - Widget query endpoint (CORS-enabled)
- `PUT /documents/{document_id}` - Update document name
- `DELETE /documents/{document_id}` - Delete document

### Widgets
- `GET /widgets/` - List tenant widgets
- `POST /widgets/` - Create embeddable widget (admin only)
- `PUT /widgets/{widget_id}` - Update widget (admin only)
- `DELETE /widgets/{widget_id}` - Delete widget (admin only)

Complete API documentation available at: **http://localhost:8000/docs** (Swagger UI)

---

## 🏗 Architecture

### Data Flow

```
User Upload → Documents → Vector Embeddings (Chroma)
                              ↓
                         Semantic Search
                              ↓
User Query → Retrieve Context → LLM (Groq) → Response
```

### Authentication Flow

```
User Signup/Login → Generate JWT Token → Store in Frontend
Client Request → Include JWT in Header → Verify on Backend
```

### Multi-Tenancy

- Each tenant has isolated documents and embeddings
- Chroma collections are created per tenant
- Database queries filtered by tenant_id

### Widget Integration

Websites can embed the chat widget:

```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://knowbaseai.com/embed.js?widget_id=YOUR_WIDGET_ID';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

---

## 🖼 Screenshots

### Dashboard
![Dashboard Overview](./screenshots/dashboard.png)
*Main dashboard with navigation and tenant overview*

### Chat Interface
![Chat with Documents](./screenshots/chat.png)
*AI chat interface with document context awareness*

### Document Management
![Document Upload](./screenshots/documents.png)
*Document upload and management interface*

### Widget Configuration
![Widget Settings](./screenshots/widgets.png)
*Configure and deploy chat widgets*

---

## 💻 Development

### Code Quality

```bash
# Backend linting
cd backend
pylint app/

# Frontend linting
cd ../frontend
npm run lint
```

### Hot Reload

Both frontend (Vite) and backend (with `--reload` flag) support hot module replacement during development.

---

## 📦 Dependencies

### Backend
- fastapi
- sqlalchemy
- chromadb
- sentence-transformers
- groq
- pydantic
- python-jose
- passlib
- python-multipart

### Frontend
- react
- react-router-dom
- axios

---

## 🐛 Troubleshooting

### Chroma Connection Issues
```bash
# Ensure Chroma is running
chroma run --host localhost --port 8000

# Or pull and run with Docker
docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest
```

### CORS Errors
- Verify `CLIENT_URL` matches your frontend URL in `.env`
- Check that backend CORS middleware is configured correctly

### LLM Response Issues
- Verify `GROQ_API_KEY` is valid and has credits
- Check Groq console for rate limits
- Ensure internet connection is active

### Database Errors
- Ensure PostgreSQL is running and accessible
- Verify `DATABASE_URL` connection string is correct
- Check PostgreSQL user has necessary permissions

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) - Fast LLM inference
- [Chroma](https://www.trychroma.com/) - Vector database
- [FastAPI](https://fastapi.tiangolo.com/) - Modern API framework
- [React](https://react.dev) - UI library
- [Hugging Face](https://huggingface.co/) - Transformer models

---

**Made with ❤️ by Mohamed Tamer**
