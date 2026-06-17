# Global Guide for Superteam OpenCode

## Tools

Use your configured **external knowledge sources** when you encounter unfamiliar terms, acronyms, or need context not in the codebase.

### Available Tools

- **explore** - Codebase search and analysis
- **librarian** - External documentation lookup
- **webfetch** - Web content retrieval
- **context7** - Library documentation

### Usage Pattern

1. **Local search first** - Use grep, glob, read for codebase
2. **External search** - Use explore, librarian for broader context
3. **Documentation** - Use context7 for library docs
4. **Web search** - Use webfetch for external resources

## General Rules

### 1. Think Before Coding

State assumptions explicitly. If multiple interpretations exist, present them - don't pick silently. If something is unclear, stop and ask.

```markdown
## Assumptions
1. The API should follow REST conventions
2. Authentication uses JWT tokens
3. Database is PostgreSQL

## Questions
- Should we use connection pooling?
- What's the expected request rate?
```

### 2. Simplicity First

Write the minimum code that solves the problem. No speculative features, no abstractions for single-use code, no error handling for impossible scenarios.

**Bad**: 200 lines with 5 abstraction layers
**Good**: 50 lines that solve the problem directly

### 3. Surgical Changes

Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Match existing style. Remove only imports/variables that YOUR changes made unused.

```diff
- import { unused } from './utils';
+ import { needed } from './utils';
```

## Superteam Rules

### 1. Check Knowledge First

Before searching externally, check:
- `.superteam/knowledge/index.md` - Session knowledge
- `~/.superteam/index.md` - Global wiki

### 2. Ask the Explorer

If knowledge base doesn't have the answer, spawn an Explorer task:

```typescript
task(subagent_type="explore", run_in_background=true, load_skills=[],
  description="Research topic",
  prompt="Investigate: ${question}. Return findings with file references.")
```

### 3. Log Everything

Record decisions and findings:

```bash
node scripts/record-event.js \
  --actor agent-name \
  --type decision \
  --summary "What was decided" \
  --rationale "Why" \
  --action "What was done"
```

### 4. Follow Contracts

When working on an increment:
- Read the contract first
- Follow it exactly
- Don't exceed scope
- Run all gates before completing

### 5. Verify Before Claiming

Never claim work is complete without:
- Running gate scripts
- Checking test results
- Verifying lint passes
- Confirming types check

## Company Knowledge

Replace this section with your team's specifics:

### Build System
- `npm run build` - Build project
- `npm run dev` - Start dev server
- `npm test` - Run tests
- `npm run lint` - Check lint
- `npm run typecheck` - Check types

### Deployment
- `npm run deploy` - Deploy to staging
- `npm run deploy:prod` - Deploy to production

### Database
- `npm run migrate` - Run migrations
- `npm run seed` - Seed database

### Testing
- `npm test` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - End-to-end tests

## Code Conventions

### Naming
- Files: kebab-case (`my-file.js`)
- Classes: PascalCase (`MyClass`)
- Functions: camelCase (`myFunction`)
- Constants: UPPER_SNAKE (`MY_CONSTANT`)

### Imports
```javascript
// External libraries first
import express from 'express';
import jwt from 'jsonwebtoken';

// Then internal modules
import { UserService } from './services/user';
import { authMiddleware } from './middleware/auth';
```

### Error Handling
```javascript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new AppError('Operation failed', 500);
}
```

### Testing
```javascript
describe('Feature', () => {
  it('should do something', async () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = await feature(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Workflow

### Before Starting
1. Read the contract/requirements
2. Check knowledge base
3. Understand existing patterns
4. Plan your approach

### During Work
1. Make small, focused changes
2. Test as you go
3. Log decisions
4. Ask for help if stuck

### After Completing
1. Run all gates
2. Write lessons learned
3. Update documentation
4. Request evaluation

## Communication

### With Teammates
- Use message bus for async communication
- Be specific in requests
- Include relevant context
- Reference file paths

### With User
- Present clear options
- Explain tradeoffs
- Ask for approval when needed
- Report progress regularly
