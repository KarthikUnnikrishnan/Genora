# 🌿 Genora — Complete Setup Guide
### For: Anyone running this project for the first time on Windows

---

## What you need to install (one time only)
1. Node.js → https://nodejs.org (click "LTS" version)
2. Python → https://www.python.org/downloads (click "Download Python 3.x")
3. PostgreSQL → https://www.postgresql.org/download/windows (click "Download the installer")
4. Git → https://git-scm.com/download/win

---

## PART 1 — Get the project

Open PowerShell and run:

```
git clone https://github.com/KarthikUnnikrishnan/Genora.git
cd Genora
```

---

## PART 2 — Setup PostgreSQL (Database)

### Step 1 — Install PostgreSQL
- Run the installer you downloaded
- When it asks for a password, type: **genora123** (write this down!)
- Port: keep it as **5432**
- Uncheck "Stack Builder" at the end
- Click Finish

### Step 2 — Add PostgreSQL to PATH
Open PowerShell and run this ONE TIME:

```
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Program Files\PostgreSQL\17\bin", "Machine")
```

Close PowerShell and open a NEW one.

### Step 3 — Create the database
```
psql -U postgres
```
It will ask for your password → type **genora123**

When you see `postgres=#` type:
```
CREATE DATABASE genora;
\q
```

### Step 4 — Create the tables
```
psql -U postgres -d genora -f "C:\path\to\Genora\backend\schema.sql"
```
Replace `C:\path\to\Genora` with your actual folder path.
Example: `psql -U postgres -d genora -f "C:\Users\YourName\Genora\backend\schema.sql"`

### Step 5 — Import the medicines data
Karthik will send you the file: **master_medicines_clean.csv**
Save it somewhere easy like your Desktop.

Then run:
```
psql -U postgres -d genora
```

When you see `genora=#` paste this entire line:
```
\COPY medicines(id, product_name, sub_category, salt_composition, dosage_form, price, price_available, manufacturer, is_discontinued, description, uses, side_effects, drug_interactions, drug_interaction_count, image_url, review_excellent_pct, review_average_pct, review_poor_pct) FROM 'C:/Users/YourName/Desktop/master_medicines_clean.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');
```

Replace `C:/Users/YourName/Desktop/` with wherever you saved the CSV.

You should see: **COPY 7466** ✅

Type `\q` to exit.

---

## PART 3 — Setup Backend (FastAPI)

### Step 1 — Go to backend folder
```
cd "C:\path\to\Genora\backend"
```

### Step 2 — Create virtual environment
```
python -m venv venv
venv\Scripts\Activate.ps1
```

If you get an error about scripts, run this first:
```
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try `venv\Scripts\Activate.ps1` again.

### Step 3 — Install packages
```
pip install greenlet --only-binary :all:
pip install sqlalchemy --only-binary :all:
pip install fastapi uvicorn python-dotenv python-multipart psycopg2-binary
```

### Step 4 — Create the .env file
In the `backend` folder, create a new file called `.env`
(no other extension — just `.env`)

Paste this inside:
```
DATABASE_URL=postgresql://postgres:genora123@localhost:5432/genora
FRONTEND_URL=http://localhost:5173
```

If you used a different password during PostgreSQL install,
replace `genora123` with your password.

### Step 5 — Run the backend
```
uvicorn main:app --reload
```

You should see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete.
```
✅ Backend is running!

---

## PART 4 — Setup Frontend (React)

Open a NEW PowerShell window (keep the backend one running).

### Step 1 — Go to web_app folder
```
cd "C:\path\to\Genora\web_app"
```

### Step 2 — Install packages
```
npm install
```
This takes 1-2 minutes.

### Step 3 — Run the frontend
```
npm run dev
```

You should see:
```
VITE ready on http://localhost:5173
```
✅ Frontend is running!

---

## PART 5 — Open the app

Open your browser and go to:
```
http://localhost:5173
```

You should see the Genora app! 🎉

Try searching: **Paracetamol 500mg**

---

## Every time you want to run the app

You need TWO terminals open at the same time:

**Terminal 1 — Backend:**
```
cd "C:\path\to\Genora\backend"
venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```
cd "C:\path\to\Genora\web_app"
npm run dev
```

Then open http://localhost:5173

---

## Troubleshooting

**psql not recognized?**
Run this in PowerShell:
```
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"
```
Then try again.

**pip install fails with C++ error?**
```
pip install greenlet --only-binary :all:
pip install sqlalchemy --only-binary :all:
```

**Port 8000 already in use?**
```
uvicorn main:app --reload --port 8001
```

**npm install fails?**
Make sure Node.js is installed:
```
node --version
```
Should show v18 or higher.

---

## Need help?
Contact Karthik 😊
