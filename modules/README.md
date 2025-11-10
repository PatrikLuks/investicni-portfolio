# ⚠️ LEGACY CODE - DO NOT USE FOR NEW FEATURES

**Status:** ARCHIVED & DEPRECATED  
**Phase:** 1-3 (Pre-Phase 4)  
**Replacement:** Use `src/js/` instead

---

## ⚡ QUICK REFERENCE

### What Is This?
This directory contains **legacy code from Phases 1-3** of the project. These modules are:
- ❌ No longer maintained
- ❌ No longer tested
- ❌ Gradually being replaced
- ⚠️ Use only if absolutely necessary

### What Should I Use Instead?
**For new features, ALWAYS use:**
- `src/js/features/` - Feature modules (auth, charts, cloud, i18n, etc.)
- `src/js/utilities/` - Utility functions & Phase 4 modules
- `src/js/core/` - Core functionality
- `src/js/loaders/` - Module loading system

---

## 📁 What's Here

```
modules/
├── app-core.js                     # Legacy app initialization
├── data-manager.js                 # Legacy data storage
├── event-handlers.js               # Legacy event system
├── help-system.js                  # Legacy help feature
├── portfolio-calculator.js         # Legacy calculations
├── ui-manager.js                   # Legacy UI utilities
├── utilities.js                    # Legacy general utilities
├── refactored-styles.css           # Legacy CSS styles
└── README.md                       # This file
```

---

## 🚨 Migration Status

| File | Status | Migration Path |
|------|--------|-----------------|
| app-core.js | Deprecated | Use loaders/* |
| data-manager.js | Deprecated | Use utilities/auto-save.js |
| event-handlers.js | Deprecated | Use src/js/features/* |
| help-system.js | Deprecated | Not migrated yet |
| portfolio-calculator.js | Deprecated | Use utilities/calculations-engine.js |
| ui-manager.js | Deprecated | Use DOM utilities in core/ |
| utilities.js | Deprecated | Use utilities/* |
| refactored-styles.css | Deprecated | Use CSS in src/css/ |

---

## 🔗 How Legacy Code Is Loaded

These modules are loaded via:
```javascript
// src/js/loaders/legacy-modules-loader.js
```

**DO NOT add new imports from `/modules/` in new code!**

---

## ⚖️ Why Keep It?

1. **Backward Compatibility** - Existing features still depend on it
2. **Gradual Migration** - Planned replacement in Phase 7
3. **Testing** - Verify new code doesn't break old functionality
4. **Reference** - See how things used to be done

---

## 🗺️ Migration Roadmap

### Phase 6 (Current)
- UI Data Binding with Phase 4 modules
- New features use src/js/ only

### Phase 7
- Complete migration of remaining legacy features
- Removal of /modules/ directory
- All functionality in src/js/

---

## 📝 For Maintainers Only

If you MUST modify something in `/modules/`:

1. **Document WHY** - Add comment explaining necessity
2. **Plan Migration** - Create ticket for moving to src/js/
3. **Add Tests** - Ensure changes don't break dependent code
4. **Update This README** - Note what was changed

**Example Comment:**
```javascript
// LEGACY: This function is deprecated.
// Will be removed in Phase 7 when ported to src/js/utilities/
// Depends: src/js/loaders/legacy-modules-loader.js
```

---

## ❌ NEVER DO

```javascript
// ❌ DO NOT - Add new code to legacy modules
// ❌ DO NOT - Import from /modules/ in new features
// ❌ DO NOT - Rely on legacy functions in Phase 4+ code
// ❌ DO NOT - Extend or refactor legacy code
```

## ✅ ALWAYS DO

```javascript
// ✅ DO - Use src/js/features/* for new features
// ✅ DO - Use src/js/utilities/* for utilities
// ✅ DO - Ask in code review if unsure
// ✅ DO - Plan migration path for new code
```

---

## 🎯 What To Do If You Find A Bug

**If bug is in legacy code AND:**
- ...still used by active features → Fix in /modules/, plan migration
- ...only in legacy code → Create migration ticket, don't fix
- ...in production → Urgent fix required, document in ticket

**Always:**
1. Add test case (if possible)
2. Create GitHub issue for migration
3. Notify team in standup
4. Don't add new code to legacy

---

## 📞 Questions?

1. Check `src/` for modern equivalent
2. Read `docs/architecture/ARCHITECTURE.md`
3. Ask in code review
4. Check DEVELOPER_GUIDE

---

**Last Updated:** November 10, 2025  
**Next Phase:** Phase 7 (removal planned)  
**Status:** DEPRECATED - Use src/js/ instead
