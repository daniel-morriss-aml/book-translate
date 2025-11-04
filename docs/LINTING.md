# Linting Guidelines

This project uses ESLint with Angular-specific rules to maintain code quality and consistency.

## Component File Length Rule

**IMPORTANT**: Component files (`.component.ts`) must not exceed 200 lines (excluding blank lines and comments).

This rule is enforced by ESLint and will cause the build to fail if violated.

### Refactoring Strategies

When a component exceeds 200 lines, consider these approaches:

1. **Extract Child Components**: Break down complex UI into smaller, focused components
2. **Move Logic to Services**: Extract business logic into injectable services
3. **Create Utility Functions**: Move pure functions to separate utility files
4. **Split Large Methods**: Break down large methods into smaller, single-purpose functions
5. **Use Composition**: Combine multiple smaller components instead of one large component

## Available Scripts

### Linting Commands

```bash
# Run all linting rules
npm run lint

# Run linting with automatic fixes
npm run lint:fix

# Check only component files for length violations
npm run lint:components
```

### Pre-commit Hooks

This project uses Husky and lint-staged to automatically run linting on staged files before commits:

- Automatically fixes TypeScript files where possible
- Ensures component files pass all linting rules
- Prevents commits that would violate the 200-line rule

## ESLint Configuration

The project uses these key ESLint rules:

- `max-lines`: 200 lines maximum for `.component.ts` files
- `@angular-eslint/prefer-standalone`: Enforces standalone components
- `@angular-eslint/prefer-inject`: Encourages using `inject()` over constructor injection
- `@typescript-eslint/no-explicit-any`: Prevents use of `any` type
- `@typescript-eslint/no-inferrable-types`: Removes unnecessary type annotations

## Integration with CI/CD

Linting is integrated into the development workflow:

1. **Pre-commit**: Runs automatically before each commit
2. **Development**: Run `npm run lint` regularly during development
3. **Component Check**: Use `npm run lint:components` to specifically check component file lengths

## Best Practices

1. **Run linting before committing**: Always run `npm run lint` before pushing code
2. **Fix violations immediately**: Don't let linting errors accumulate
3. **Refactor large components**: When approaching 150 lines, start planning refactoring
4. **Use the auto-fix**: Many linting issues can be automatically resolved with `npm run lint:fix`

## Troubleshooting

### Common Issues

1. **"File has too many lines"**: Refactor the component using the strategies above
2. **"Prefer using inject()"**: Replace constructor injection with the `inject()` function
3. **"Unexpected any"**: Replace `any` types with proper TypeScript types

### Disabling Rules (Not Recommended)

While not recommended, you can disable specific rules with:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response;
```

However, it's better to fix the underlying issue rather than disable the rule.