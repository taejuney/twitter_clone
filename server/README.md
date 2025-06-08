# Flask API

## Setup
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # fill in real creds
flask db init
flask db migrate
flask db upgrade
flask run
