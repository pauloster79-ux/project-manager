# Chat Functionality Fix

## Issue
The AI assistant was returning "Sorry—couldn't answer right now." for all user inputs.

## Root Cause
The issue was caused by missing database environment variables. The chat API requires:
- `DATABASE_URL`
- `POSTGRES_URL` 
- `POSTGRES_URL_NON_POOLING`

## Solution

### 1. Set Environment Variables
Before starting the development server, set these environment variables:

**PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:POSTGRES_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:POSTGRES_URL_NON_POOLING="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
$env:LLM_PROVIDER="mock"
```

**Bash/Linux:**
```bash
export DATABASE_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
export POSTGRES_URL="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
export POSTGRES_URL_NON_POOLING="postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres"
export LLM_PROVIDER="mock"
```

### 2. Setup Database
Run the database setup script to create required tables and sample data:
```bash
node setup-db.js
```

### 3. Start Development Server
```bash
cd apps/web
npm run dev
```

### 4. Alternative: Use PowerShell Script
A PowerShell script has been created at `apps/web/start-dev.ps1` that sets all required environment variables and starts the server.

## Improvements Made

1. **Better Error Handling**: Added proper error logging and more descriptive error messages
2. **Fallback Responses**: Improved fallback responses when the LLM fails
3. **HTTP Status Checking**: Added proper HTTP status code checking in the frontend
4. **Environment Setup**: Created scripts to easily set up the development environment

## Testing
The chat functionality can be tested by:
1. Opening the application in a browser
2. Navigating to a project page
3. Using the chat assistant in the right sidebar
4. Asking questions like "What are the top risks?" or "What changed this week?"

## Files Modified
- `apps/web/app/api/chat/route.ts` - Improved error handling and fallback responses
- `apps/web/components/ChatDock.tsx` - Better error messages and HTTP status checking
- `apps/web/start-dev.ps1` - PowerShell script for easy development setup
- `test-chat-api.js` - Test script for verifying chat API functionality

