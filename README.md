# Study Notes Web Application

This repository contains a static web application for managing vocabulary, mathematical symbols, and formulas using Supabase for authentication and data storage.

## Features

- User authentication (sign-up, sign-in, reset password)
- Manage vocabulary lists
- Manage scientific symbols
- Manage math/physics/chemistry formulas with LaTeX rendering

## Getting Started

### 1. Serve the files locally

Because the application uses JavaScript modules and Supabase, it must be served over HTTP. You can use any static server. Two quick options:

```bash
# From the repository root
cd "voca-2"
# Using Node.js http-server
npx http-server -p 8080
# Or using Python
# python3 -m http.server 8080
```

Then open `http://localhost:8080/main/index.html` in your browser.

### 2. Configure Supabase

1. Create a project on [Supabase](https://supabase.com/).
2. Copy your project URL and anonymous key.
3. Copy `js/config.example.js` to `js/config.js` and fill in your Supabase URL and anon key. This file is ignored by Git so your keys stay private.
4. In Supabase SQL editor, run the migration script `supabase/migrations/20230517_create_formulas_table.sql` to create the `formulas` table and policies. The script requires the `pgcrypto` extension, which is created automatically.

### 3. Authentication Pages

All authentication pages are located in the `auth` directory. After starting the static server, you can access them via:

- `http://localhost:8080/auth/auth-sign-up.html`
- `http://localhost:8080/auth/auth-sign-in.html`

## Project Structure

```
voca-2/
├── auth/          # Authentication pages and styles
├── js/            # Reusable JavaScript modules (auth, main, supabase)
├── main/          # Main application pages (index, vocabulary, formulas, ...)
└── supabase/      # SQL migrations and database setup
```

## License

This project uses the MIT license.
