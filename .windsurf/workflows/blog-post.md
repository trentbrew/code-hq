---
description: Create a blog post with Astro/Fuwari frontmatter
---

# Create Blog Post Workflow

This workflow guides you through creating a properly formatted blog post for Astro/Fuwari sites.

## Steps

### 1. Create the blog post file

Create a new markdown file in your blog posts directory (e.g., `blog/posts/my-post.md`)

### 2. Add frontmatter

Add the following frontmatter at the top of the file:

```markdown
---
title: Your Blog Post Title
published: YYYY-MM-DD
updated: YYYY-MM-DD
description: 'A compelling description of your post (shown in previews and SEO)'
image: './cover-image.png'
tags: [Tag1, Tag2, Tag3]
category: 'Category Name'
draft: false
---
```

**Field descriptions**:
- `title`: The main heading of your post
- `published`: Publication date (ISO format)
- `updated`: Last update date (ISO format)
- `description`: Short summary for SEO and social media previews (keep under 160 chars)
- `image`: Path to cover image (relative to the post file)
- `tags`: Array of relevant tags for filtering/discovery
- `category`: Main category for organization
- `draft`: Set to `true` to hide from production, `false` to publish

### 3. Write your content

Use standard Markdown syntax:

#### Headings
```markdown
# H1 - Main title (already in frontmatter)
## H2 - Major sections
### H3 - Subsections
```

#### Text formatting
```markdown
**bold** _italic_ `code`
```

#### Lists
```markdown
- Unordered list
  - Nested item

1. Ordered list
2. Second item
```

#### Code blocks
````markdown
```javascript
const example = "syntax highlighting";
```
````

#### Links and images
```markdown
[Link text](https://example.com)
![Alt text](./image.png "Optional title")
```

### 4. Add admonitions (optional)

Use for important callouts:

```markdown
:::note
Highlights information users should know
:::

:::tip
Helpful suggestions
:::

:::warning
Critical information
:::

:::caution
Potential risks
:::
```

Custom titles:
```markdown
:::note[CUSTOM TITLE]
Content here
:::
```

### 5. Add GitHub repo cards (optional)

```markdown
::github{repo="owner/repo-name"}
```

### 6. Create cover image

- Size: 1200x630px (optimal for social media)
- Format: PNG or JPG
- Save as: `./cover-image.png` (relative to post)
- Or: Set `image: ''` if no cover needed

### 7. Review checklist

Before publishing:

- [ ] Frontmatter fields complete and accurate
- [ ] Cover image created and linked
- [ ] Description under 160 characters
- [ ] Tags are relevant and consistent with other posts
- [ ] All links work
- [ ] Code blocks have syntax highlighting
- [ ] Grammar and spelling checked
- [ ] Preview in local dev server
- [ ] Set `draft: false` when ready to publish

### 8. Publish

```bash
# Commit and push
git add blog/posts/my-post.md
git commit -m "post: add 'Your Blog Post Title'"
git push
```

---

## Example Template

Copy this starter template:

```markdown
---
title: Your Post Title Here
published: 2025-10-24
updated: 2025-10-24
description: 'A concise description of what this post covers'
image: './cover.png'
tags: [Tag1, Tag2, Tag3]
category: 'Category'
draft: true
---

# Your Post Title Here

## Introduction

Hook the reader with why this matters.

## Main Content

### Section 1

Content here...

### Section 2

More content...

## Conclusion

Wrap up and call to action.

---

_Further reading: [Related Post](/posts/related)_
```

---

## Quick Reference

### Supported Markdown Features

- Headers (H1-H6)
- Bold, italic, code
- Lists (ordered, unordered, nested)
- Links, images
- Code blocks with syntax highlighting
- Tables
- Block quotes
- Footnotes
- Horizontal rules
- Definition lists
- Inline math: `$equation$`
- Display math: `$$equation$$`

### Extended Features

- **Admonitions**: `:::note`, `:::tip`, `:::warning`, `:::caution`
- **GitHub cards**: `::github{repo="owner/repo"}`
- **Footnotes**: `[^1]` and `[^1]: Text`
- **Definition lists**:
  ```markdown
  term
  : definition
  ```

---

**Next**: After publishing, promote on social media using tags from frontmatter!
