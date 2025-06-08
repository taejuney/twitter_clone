# Database setup

1. Start your MySQL server (e.g. `brew services start mysql`).
2. Create the schema:
   ```bash
   mysql -u root -p < init.sql
