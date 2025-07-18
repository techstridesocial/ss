# 🐰 CodeRabbit AI Code Review Setup

## Overview

CodeRabbit is now configured for the Stride Social Dashboard repository to provide AI-powered code reviews on all pull requests. This guide explains how to use CodeRabbit effectively.

---

## 🚀 **Quick Setup Steps**

### 1. **Install CodeRabbit GitHub App**
1. Go to: https://github.com/apps/coderabbitai
2. Click "Install" 
3. Select `techstridesocial/ss` repository
4. Grant necessary permissions

### 2. **Configuration Complete** ✅
- ✅ `.coderabbit.yaml` configuration file added
- ✅ GitHub PR template created
- ✅ Project-specific rules configured
- ✅ Security and performance focus areas set

---

## 🎯 **What CodeRabbit Reviews**

### **Automatic Focus Areas:**
- 🔒 **Security** - API endpoints, authentication, data handling
- ⚡ **Performance** - Bundle size, React optimization, database queries
- 🏗️ **Architecture** - TypeScript types, component structure
- ♿ **Accessibility** - WCAG compliance, screen reader support
- 📱 **Responsive Design** - Mobile compatibility, touch targets

### **Platform-Specific Checks:**
- 💰 Financial data security and encryption
- 🔐 OAuth implementation and token handling  
- 👥 Role-based access control (Brand/Staff/Influencer)
- 📊 GDPR compliance and data privacy
- 🚦 API rate limiting and error handling

---

## 📝 **How to Use CodeRabbit**

### **Creating Pull Requests:**

1. **Use the PR Template** - Automatically appears when creating PRs
2. **Fill out relevant sections** - Testing, security considerations, etc.
3. **Tag CodeRabbit** - Use `@coderabbitai` for specific requests

### **CodeRabbit Commands:**

```markdown
@coderabbitai help                    # Show available commands
@coderabbitai summary                 # Generate PR summary
@coderabbitai walkthrough            # Create code walkthrough
@coderabbitai review                  # Full review
@coderabbitai security               # Focus on security issues
@coderabbitai performance            # Focus on performance issues
@coderabbitai pause                  # Pause reviews for this PR
@coderabbitai resume                 # Resume reviews for this PR
```

### **Example Usage:**

```markdown
@coderabbitai Please review this authentication component with extra attention to security vulnerabilities and session management.
```

---

## 🔧 **Configuration Details**

### **File-Specific Instructions:**

| Path | Focus Areas | Special Instructions |
|------|-------------|---------------------|
| `src/app/api/**` | Security, Error Handling, Validation | Extra scrutiny on API security |
| `src/components/auth/**` | Security, Authentication | Critical security review |
| `src/lib/db/**` | Security, Performance, Data Integrity | Database security focus |
| `src/middleware.ts` | Security, Performance | Middleware critical review |

### **Ignored Files:**
- Lock files (`*.lock`)
- Build outputs (`.next/`, `dist/`, `build/`)
- Assets (`*.png`, `*.svg`, `*.jpg`)
- Documentation (`*.md`)
- Node modules

---

## 🎨 **Review Types**

### **Security Reviews:**
- Input validation and sanitization
- Authentication and authorization
- SQL injection prevention
- XSS protection
- CSRF protection
- Data encryption

### **Performance Reviews:**
- Bundle size optimization
- React rendering optimization
- Database query efficiency
- Image optimization
- Caching strategies
- Loading performance

### **Code Quality Reviews:**
- TypeScript type safety
- React best practices
- Next.js optimization
- Component structure
- Error boundaries
- Testing coverage

---

## 🚦 **Best Practices**

### **For Developers:**

1. **Small, Focused PRs** - Easier for CodeRabbit to review thoroughly
2. **Descriptive Commit Messages** - Help CodeRabbit understand context
3. **Fill PR Template** - Provide context for better reviews
4. **Address CodeRabbit Comments** - Treat them as valuable feedback
5. **Use Specific Commands** - Direct CodeRabbit's attention where needed

### **For Reviewers:**

1. **Read CodeRabbit Summary** - Get quick overview before manual review
2. **Focus on Business Logic** - Let CodeRabbit handle syntax/style
3. **Check CodeRabbit Missed Items** - Complex business requirements
4. **Validate Security Suggestions** - Ensure they fit your threat model

---

## 🔍 **Monitoring and Analytics**

### **PR Summary Includes:**
- 📊 Code changes overview
- 🎯 Key changes highlighted  
- ⚠️ Potential issues identified
- 📈 Complexity analysis
- 🧪 Test coverage gaps
- 🔒 Security considerations

### **Review Quality Metrics:**
- Issues caught before merge
- Security vulnerabilities identified
- Performance improvements suggested
- Code quality improvements
- Type safety enhancements

---

## 🛠️ **Troubleshooting**

### **CodeRabbit Not Responding:**
1. Check if app is installed on repository
2. Verify permissions are granted
3. Ensure PR is not in draft mode
4. Try `@coderabbitai help` command

### **Too Many Comments:**
- Use `@coderabbitai pause` to pause reviews
- Adjust focus areas in `.coderabbit.yaml`
- Use more specific commands

### **Missing Reviews:**
- Check file patterns in configuration
- Ensure files aren't in ignore list
- Verify PR size isn't too large

---

## 📚 **Additional Resources**

- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [GitHub App Settings](https://github.com/settings/installations)
- [Configuration Reference](https://docs.coderabbit.ai/configuration)

---

## 🎉 **Getting Started**

Your next pull request will automatically get CodeRabbit reviews! Simply:

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Push and create a PR
4. CodeRabbit will automatically review within minutes
5. Address feedback and iterate

**Happy coding with AI-powered reviews!** 🚀 