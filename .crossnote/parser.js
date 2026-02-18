({
  // Please visit the URL below for more information:
  // https://shd101wyy.github.io/markdown-preview-enhanced/#/extend-parser

  onWillParseMarkdown: async function(markdown) {
    const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return markdown;

    const fm = fmMatch[1];
    const body = fmMatch[2];

    const titleMatch = fm.match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
    if (!titleMatch) return markdown;

    const title = titleMatch[1];

    // Don't add if the body already opens with an H1
    if (/^\s*#[^#]/.test(body)) return markdown;

    // Parse date, categories, tags from front matter lines
    const lines = fm.split('\n');
    let currentKey = null;
    const meta = { date: null, categories: [], tags: [] };
    for (const line of lines) {
      const keyLine = line.match(/^(\w+):\s*(.*)$/);
      if (keyLine) {
        currentKey = keyLine[1];
        if (keyLine[2].trim()) meta[currentKey] = keyLine[2].trim();
      } else {
        const listItem = line.match(/^\s+-\s+(.+)$/);
        if (listItem && (currentKey === 'categories' || currentKey === 'tags')) {
          meta[currentKey].push(listItem[1].trim());
        }
      }
    }

    const parts = [];
    if (meta.date) {
      const d = new Date(meta.date);
      parts.push(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
    if (meta.categories.length) parts.push(meta.categories.join(', '));
    if (meta.tags.length) parts.push(meta.tags.map(t => `#${t}`).join(' '));

    const metaLine = parts.length ? `*${parts.join(' · ')}*\n\n` : '';

    const footer = `\n\n---\n*Ivan Bliskavka · [bliskavka.com](https://bliskavka.com)*`;

    return `---\n${fm}\n---\n# ${title}\n\n${metaLine}${body}${footer}`;
  },

  onDidParseMarkdown: async function(html) {
    return html;
  },
})