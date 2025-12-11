# ⚡ QUICK FIX COMMANDS

## 🔥 Run These Commands Right Now

### 1. Check Current Status
```bash
cd /Users/jo-remi/Desktop/ss
node test-core-functionality.js
```

### 2. Fix Missing Brand Profile
```bash
# First, find the user without a brand profile
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
(async () => {
  const users = await sql\`
    SELECT u.id, u.email, u.clerk_id
    FROM users u
    LEFT JOIN brands b ON u.user_id = b.user_id
    WHERE u.role = 'BRAND' AND b.id IS NULL
  \`;
  if (users.length > 0) {
    console.log('Found brand user without profile:');
    console.log('Email:', users[0].email);
    console.log('User ID:', users[0].id);
    console.log('\nCreating brand profile...');
    await sql\`
      INSERT INTO brands (user_id, company_name, created_at, updated_at)
      VALUES (\${users[0].id}, 'New Brand Company', NOW(), NOW())
    \`;
    console.log('✅ Brand profile created!');
  } else {
    console.log('✅ All brand users have profiles');
  }
})();
"
```

### 3. Test the Application
```bash
# Start dev server
npm run dev

# In another terminal, test the build
npm run build
```

### 4. Deploy to Production
```bash
# Deploy to Vercel
vercel --prod

# Or test deployment first
vercel
```

---

## 🧪 Test Commands

### Database Health Check
```bash
node test-core-functionality.js
```

### Check All Tables
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name\`.then(r => {
  console.log('📊 Database Tables (' + r.length + ' total):');
  r.forEach(t => console.log('  ✅', t.table_name));
});
"
```

### Check User Count
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT role, COUNT(*) as count FROM users GROUP BY role\`.then(r => {
  console.log('👥 User Distribution:');
  r.forEach(row => console.log('  ', row.role + ':', row.count));
});
"
```

### Check Influencers
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT COUNT(*) as count FROM influencers\`.then(r => {
  console.log('🌟 Total Influencers:', r[0].count);
});
"
```

### Check Campaigns
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT COUNT(*) as count FROM campaigns\`.then(r => {
  console.log('📊 Total Campaigns:', r[0].count);
});
"
```

---

## 🔧 Fix Linter Warnings (Optional - Do After Launch)

### Check Linter Issues
```bash
npm run lint 2>&1 | grep "Error:" | wc -l
```

### Auto-fix What Can Be Fixed
```bash
# This will fix some issues automatically
npx eslint --fix src/**/*.ts src/**/*.tsx
```

---

## 🚀 Deployment Commands

### Deploy to Vercel (Production)
```bash
vercel --prod
```

### Deploy to Vercel (Preview)
```bash
vercel
```

### Check Vercel Status
```bash
vercel whoami
vercel list
```

### View Deployment Logs
```bash
vercel logs
```

---

## 📊 Monitoring Commands

### Check Database Connection
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT NOW() as current_time\`.then(r => {
  console.log('✅ Database connected!');
  console.log('Current time:', r[0].current_time);
}).catch(e => {
  console.log('❌ Database connection failed:', e.message);
});
"
```

### Check Environment Variables
```bash
node -e "
require('dotenv').config({ path: '.env.local' });
const vars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'MODASH_API_KEY',
  'SHORT_IO_API_KEY'
];
console.log('🔐 Environment Variables:');
vars.forEach(v => {
  console.log('  ', v + ':', process.env[v] ? '✅ Present' : '❌ Missing');
});
"
```

---

## 🎯 Quick Fixes

### Fix: "Module not found" errors
```bash
npm install
```

### Fix: "Build failed" errors
```bash
rm -rf .next
npm run build
```

### Fix: "Database connection failed"
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# If not, check .env.local
cat .env.local | grep DATABASE_URL
```

### Fix: "Clerk authentication failed"
```bash
# Check Clerk keys
node -e "
require('dotenv').config({ path: '.env.local' });
console.log('Clerk Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '✅ Present' : '❌ Missing');
console.log('Clerk Secret Key:', process.env.CLERK_SECRET_KEY ? '✅ Present' : '❌ Missing');
"
```

---

## 📈 Performance Check

### Check Query Performance
```bash
node -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
const start = Date.now();
sql\`SELECT * FROM influencers LIMIT 10\`.then(r => {
  const time = Date.now() - start;
  console.log('⚡ Query time:', time + 'ms');
  console.log(time < 100 ? '✅ Excellent' : time < 500 ? '✅ Good' : '⚠️  Slow');
});
"
```

### Check Build Size
```bash
npm run build 2>&1 | grep "First Load JS"
```

---

## 🎉 Success Indicators

After running these commands, you should see:

✅ Database connected  
✅ 36 tables present  
✅ 21 users  
✅ 12 influencers  
✅ 10 campaigns  
✅ Build successful  
✅ All environment variables present  
✅ Query time < 100ms  

**If you see all these ✅ marks, YOU'RE READY TO LAUNCH! 🚀**

