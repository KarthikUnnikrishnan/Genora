# 🌿 Genora — India's Generic Medicine Finder

<div align="center">

![Genora](https://img.shields.io/badge/Genora-Generic%20Medicine%20Finder-2D7A4F?style=for-the-badge)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Helping millions of Indians find cheaper generic alternatives to branded medicines.**

[🌐 Live Demo](https://genora-orcin.vercel.app) · [🐛 Report Bug](https://github.com/KarthikUnnikrishnan/Genora/issues) · [✨ Request Feature](https://github.com/KarthikUnnikrishnan/Genora/issues)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [The Builders](#-the-builders)

---

## 🌿 About the Project

Genora is a **Generic Medicine Finder** built specifically for the Indian healthcare market. It empowers patients to find cost-effective generic alternatives to expensive branded medicines, based on the active salt composition.

In India, branded medicines can cost **3–10x more** than their generic equivalents — with the same active ingredients and efficacy. Genora bridges this knowledge gap by making medicine data accessible, searchable, and comparable for everyone.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Smart Text Search** | Search by brand name, salt composition, or manufacturer with fuzzy matching |
| 📸 **AI Image Scan** | Upload a medicine strip photo — OCR extracts the name and finds alternatives |
| 💰 **Price Comparison** | All generic alternatives ranked by price, showing exact savings |
| ⚠️ **Drug Interactions** | Safety-first — shows all known interactions before you switch |
| 📋 **Prescription Scanner** | Upload a full prescription and find alternatives for every medicine |
| ⭐ **Patient Reviews** | Excellent / Average / Poor review breakdowns from real patients |
| 🌙 **Dark / Light Mode** | Comfortable viewing in any environment |
| ⚡ **Autocomplete** | Real-time suggestions as you type |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite** — fast development and build
- **CSS Modules** — scoped, maintainable styling
- **Glassmorphism UI** — modern, translucent design system
- **Intersection Observer API** — scroll-reveal animations

### Backend
- **FastAPI** (Python) — high-performance async REST API
- **SQLAlchemy** — database ORM
- **EasyOCR** — AI-powered text extraction from medicine images
- **Pydantic** — data validation

### Database
- **PostgreSQL** — robust relational database
- **Supabase** — managed PostgreSQL with free tier
- **GIN Indexes** — lightning-fast full-text search

### Deployment
- **Vercel** — frontend hosting (free tier)
- **Render** — backend hosting (free tier)
- **Supabase** — database hosting (free tier)

---

## 📂 Project Structure

```
Genora/
├── backend/                    # FastAPI backend
│   ├── main.py                 # Core API — search, autocomplete, image scan
│   ├── schema.sql              # Database schema & indexes
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   └── .python-version         # Python version pin (3.11.9)
│
├── web_app/                    # React frontend
│   ├── public/
│   │   ├── favicon.svg         # App favicon
│   │   └── favicon.ico
│   └── src/
│       ├── App.jsx             # Root component — routing & state
│       ├── index.css           # Global design system (32KB)
│       ├── main.jsx            # React entry point
│       ├── api/
│       │   └── genora.js       # All API calls + field mapping
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Hero.jsx
│       │   ├── ThemeToggle.jsx
│       │   ├── search/
│       │   │   ├── TextSearch.jsx
│       │   │   ├── ImageSearch.jsx
│       │   │   ├── AutoComplete.jsx
│       │   │   └── ModeSwitcher.jsx
│       │   └── results/
│       │       ├── ResultsSection.jsx
│       │       ├── OriginalCard.jsx
│       │       ├── AltsGrid.jsx
│       │       └── DetailPanel.jsx
│       ├── data/
│       │   ├── medicines.js    # Fallback/demo data
│       │   └── allMedicines.json  # Local medicine dataset (offline fallback)
│       └── hooks/
│           └── useSearch.js
│
├── dataset/                    # Medicine data
│   └── master_medicines_clean.csv
│
├── mobile_app/                 # Future mobile app (placeholder)
├── SETUP_GUIDE.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| PostgreSQL | 14+ | [postgresql.org](https://postgresql.org) |

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/KarthikUnnikrishnan/Genora.git
cd Genora
```

**2. Set up the Backend**
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**3. Set up the Frontend**
```bash
cd web_app
npm install
```

### Running Locally

**Step 1 — Set up environment variables**

Copy the example env file and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/genora
```

**Step 2 — Set up the database**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE genora;"

# Run the schema
psql -U postgres -d genora -f backend/schema.sql

# Import medicine data
psql -U postgres -d genora -c "\COPY medicines(product_name,sub_category,salt_composition,dosage_form,price,price_available,manufacturer,is_discontinued,description,uses,side_effects,drug_interactions,drug_interaction_count,image_url,review_excellent_pct,review_average_pct,review_poor_pct) FROM 'dataset/master_medicines_clean.csv' DELIMITER ',' CSV HEADER;"
```

**Step 3 — Start the Backend**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

API will be live at: `http://localhost:8000`
Interactive docs at: `http://localhost:8000/docs`

**Step 4 — Start the Frontend**
```bash
cd web_app
npm run dev
```

App will be live at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/genora` |

### Frontend (`web_app/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

For production, set `VITE_API_URL` to your Render backend URL.

---

## 🗄️ Database Setup

### Schema Overview

```sql
medicines (
  id                    SERIAL PRIMARY KEY,
  product_name          TEXT NOT NULL,
  sub_category          TEXT,
  salt_composition      TEXT,        -- used for finding alternatives
  dosage_form           TEXT,
  price                 NUMERIC(10,2),
  manufacturer          TEXT,
  is_discontinued       BOOLEAN,
  description           TEXT,
  uses                  TEXT,
  side_effects          TEXT,
  drug_interactions     TEXT,        -- stored as JSON string
  drug_interaction_count INTEGER,
  review_excellent_pct  NUMERIC(5,2),
  review_average_pct    NUMERIC(5,2),
  review_poor_pct       NUMERIC(5,2)
)
```

### Dataset Stats

| Metric | Count |
|---|---|
| Total Medicines | 7,466 |
| Total Ingredients | 12,675 |
| Dosage Forms | 49 |
| Categories | 400+ |

---

## 📡 API Reference

Base URL: `https://genora-e3sm.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/search/{name}` | Search medicine + get alternatives |
| `GET` | `/autocomplete/{query}` | Get suggestions while typing |
| `GET` | `/medicine/{id}` | Get single medicine by ID |
| `GET` | `/alternatives/{id}` | Get all alternatives for a medicine |
| `GET` | `/categories` | List all medicine categories |
| `GET` | `/category/{name}` | Get all medicines in a category |
| `POST` | `/image/analyze` | Analyze medicine image (OCR) |

### Example Response — `/search/paracetamol`

```json
{
  "medicine": {
    "id": 123,
    "product_name": "Crocin 500mg Tablet",
    "salt_composition": "Paracetamol (500mg)",
    "price": 30.50,
    "manufacturer": "GSK",
    "interactions_parsed": []
  },
  "alternatives": [
    {
      "id": 456,
      "product_name": "Calpol 500mg Tablet",
      "salt_composition": "Paracetamol (500mg)",
      "price": 12.00,
      "manufacturer": "Johnson & Johnson"
    }
  ],
  "total_alternatives": 8
}
```

---

## 👨‍💻 The Builders

<table>
  <tr>
    <td align="center">
      <b>Karthik Unnikrishnan</b><br/>
      <sub>Co-Founder · Full Stack Developer</sub><br/>
      <sub>React · FastAPI · PostgreSQL · EasyOCR</sub>
    </td>
    <td align="center">
      <b>Fidha Fathima Salim</b><br/>
      <sub>Co-Founder · Data & UI</sub><br/>
      <sub>Data Science · UI/UX · Python · ML</sub>
    </td>
  </tr>
</table>

Both pursuing **Integrated M.Sc. Computer Science & Data Science** at **Nirmala College, Muvattupuzha**, affiliated to Mahatma Gandhi University, Kerala · Batch 2026.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ for India's healthcare access**

*"Healthcare should be affordable for everyone. Genora is our answer."*

**© 2026 Genora · Created By Karthik Unnikrishnan**

</div>
