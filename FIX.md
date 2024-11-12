Here's how to update npm packages:

```bash
# Check outdated packages
npm outdated

# Update packages according to package.json
npm update

# Update packages to latest versions (including major versions)
npm install -g npm-check-updates
ncu -u
npm install

# Update a specific package
npm update package-name

# Update global packages
npm update -g

# Update npm itself
npm install -g npm@latest
```

Detailed explanation:

1. Check what needs updating:
```bash
npm outdated
```

2. Safe update (respecting semver):
```bash
npm update
```

3. Update to latest versions:
```bash
# Install the npm-check-updates tool
npm install -g npm-check-updates

# Update package.json to latest versions
ncu -u

# Install updated packages
npm install
```

4. Update specific package:
```bash
# Update single package
npm update lodash

# Update and save to dependencies
npm update lodash --save

# Update and save to devDependencies
npm update jest --save-dev
```

5. Global packages:
```bash
# Check outdated global packages
npm outdated -g

# Update global packages
npm update -g
```

6. Cleanup:
```bash
# Remove unused packages
npm prune

# Clean npm cache
npm cache clean --force
```

Safety tips:
- Make a backup of package.json before major updates
- Test after updating
- Review changelog of major version updates
- Consider using package-lock.json
- Update packages in stages for large projects
