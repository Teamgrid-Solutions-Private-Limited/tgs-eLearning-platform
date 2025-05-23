export const editorDataToHtml = (data) => {
  if (!data || !data.blocks || !Array.isArray(data.blocks)) return '';

  return data.blocks.map((block) => {
    const { type, data } = block;

    switch (type) {
      case 'header':
        return `<h${data.level}>${data.text}</h${data.level}>`;

      case 'paragraph':
        return `<p>${data.text}</p>`;

      case 'list':
        const tag = data.style === 'ordered' ? 'ol' : 'ul';
        const items = data.items.map((item) => `<li>${item}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;

      case 'image':
        return `
          <div style="text-align:center; margin: 20px 0;">
            <img src="${data.file?.url || ''}" alt="${data.caption || ''}" style="max-width: 100%;" />
            ${data.caption ? `<div><em>${data.caption}</em></div>` : ''}
          </div>A
        `;

      case 'quote':
        return `
          <blockquote style="border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em;">
            <p>${data.text}</p>
            <footer>— ${data.caption || 'Unknown'}</footer>
          </blockquote>
        `;

      case 'code':
        return `<pre style="background:#f4f4f4;padding:10px;border-radius:5px;"><code>${data.code}</code></pre>`;

      case 'delimiter':
        return `<hr/>`;

      case 'checklist':
        return `
          <ul style="list-style-type: none; padding: 0;">
            ${data.items.map(item => `
              <li>
                <input type="checkbox" disabled ${item.checked ? 'checked' : ''} />
                ${item.text}
              </li>
            `).join('')}
          </ul>
        `;

      case 'video':
        return `<video controls style="max-width: 100%;"><source src="${data.file.url}" type="video/mp4"></video>`;

      case 'embed':
        return `<iframe width="100%" height="400" src="${data.embed}" frameborder="0" allowfullscreen></iframe>`;

      case 'attaches':
        return `<p><a href="${data.file.url}" target="_blank" download>${data.file.name}</a></p>`;

      default:
        // If a block type is unrecognized, you can log it or skip
        console.warn(`Unsupported block type: ${type}`);
        return '';
    }
  }).join('\n');
};
