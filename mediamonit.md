# MediaMonit Brand Identity Guidelines

## 1. Brand Essence

### Mission Statement
MediaMonit empowers organizations with real-time media stream monitoring, ensuring reliable content delivery and immediate status insights.

### Core Values
- Reliability
- Precision
- Transparency
- Innovation
- Simplicity

### Brand Personality
Professional yet accessible, technical yet clear, innovative yet dependable.

## 2. Visual Identity

### Logo Specifications
The MediaMonit logo consists of three key elements:
1. Monitor Frame: Dark blue (#0f172a) rounded square
2. Play Button: Emerald green (#10b981) triangle
3. Wave Signal: White (#ffffff) animated sinusoidal wave

#### Logo Variations
```
Primary Logo: Full color with text
Symbol Only: Square icon for favicons and small applications
Monochrome: For single-color applications
```

#### Clear Space
Maintain minimum clear space equal to the height of the "M" in Media around all sides of the logo.

#### Minimum Size
- Digital: 80px width
- Print: 1 inch width
- Symbol only: 16px width

### Color Palette

#### Primary Colors
```css
--brand-dark-blue: #0f172a;    /* Monitor frame, primary text */
--brand-emerald: #10b981;      /* Play button, accent elements */
--brand-white: #ffffff;        /* Wave signal, light text */
```

#### Supporting Colors
```css
--status-active: #22c55e;      /* Online/active indicators */
--status-warning: #eab308;     /* Warning states */
--status-error: #ef4444;       /* Error states */
--ui-background: #f8fafc;      /* Interface background */
--ui-border: #e2e8f0;         /* Borders and separators */
```

### Typography

#### Primary Font
```css
font-family: 'Inter', sans-serif;
```
Usage:
- Headlines: Inter Bold (700)
- Body Text: Inter Regular (400)
- UI Elements: Inter Medium (500)

#### Monospace Font
```css
font-family: 'JetBrains Mono', monospace;
```
Usage:
- Code examples
- Technical documentation
- Terminal output

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

## 3. Brand Voice

### Tone Guidelines
- Clear and direct
- Technically accurate
- Solution-focused
- Confidently helpful
- Educational without being condescending

### Writing Style
- Use active voice
- Keep sentences concise
- Explain technical concepts clearly
- Include practical examples
- Focus on benefits and solutions

### Message Examples
```
✅ "Monitor your media streams in real-time"
✅ "Instant status updates for all your streams"
✅ "Simple integration, powerful monitoring"

❌ "Best monitoring solution ever"
❌ "Complex technical analysis system"
❌ "Revolutionary new technology"
```

## 4. Brand Applications

### Web Interface
- Clean, minimal design
- High contrast for readability
- Consistent spacing (8px grid)
- Clear status indicators
- Responsive layouts

### Documentation
- Clear hierarchy
- Code syntax highlighting
- Interactive examples
- Step-by-step guides
- Search-optimized structure

### Marketing Materials
- Focus on reliability
- Show real-time capabilities
- Use actual interface screenshots
- Include performance metrics
- Technical accuracy

## 5. Asset Usage

### Logo Files
Available formats:
- SVG (preferred for web)
- PNG (with transparency)
- PDF (for print)

### Icon Set
```css
/* Status Icons */
.icon-active { color: var(--status-active); }
.icon-warning { color: var(--status-warning); }
.icon-error { color: var(--status-error); }
```

### Code Snippets Style
```css
/* Code block styling */
.code-block {
    font-family: 'JetBrains Mono', monospace;
    background: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
}
```

## 6. Implementation Guidelines

### Animation Standards
```css
/* Logo wave animation */
@keyframes waveMotion {
    from { stroke-dashoffset: 60; }
    to { stroke-dashoffset: 0; }
}

.wave-animation {
    animation: waveMotion 2s linear infinite;
}
```

### Responsive Behavior
```css
/* Logo scaling */
.logo {
    width: clamp(80px, 15vw, 320px);
    height: auto;
}
```

### Accessibility
- Maintain WCAG 2.1 AA compliance
- Ensure sufficient color contrast
- Provide text alternatives for icons
- Support keyboard navigation
- Enable screen reader compatibility
