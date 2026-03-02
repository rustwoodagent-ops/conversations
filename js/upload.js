(() => {
  const STORAGE_KEY = 'howard_upload_manifest_v1';

  const fileInput = document.getElementById('fileInput');
  const selectBtn = document.getElementById('selectBtn');
  const exportBtn = document.getElementById('exportBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fileList = document.getElementById('fileList');
  const emptyState = document.getElementById('emptyState');
  const dropZone = document.getElementById('dropZone');

  const readStore = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const writeStore = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const render = () => {
    const items = readStore();
    fileList.innerHTML = '';
    emptyState.style.display = items.length ? 'none' : 'block';

    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.style.border = '1px solid var(--glass-border)';
      el.style.borderRadius = 'var(--radius-md)';
      el.style.padding = '0.9rem';
      el.style.background = 'rgba(255,255,255,0.02)';
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${item.name}</div>
            <div style="font-size:.85rem; color:var(--text-secondary); margin-top:.2rem;">
              ${item.type || 'unknown'} • ${formatSize(item.size)} • ${new Date(item.addedAt).toLocaleString()}
            </div>
          </div>
          <button data-remove="${idx}" class="btn btn-ghost" style="padding:.35rem .7rem; font-size:.85rem;">Remove</button>
        </div>
        ${item.preview ? `<div style="margin-top:.55rem; color:var(--text-secondary); font-size:.88rem; line-height:1.5; white-space:pre-wrap;">${item.preview}</div>` : ''}
      `;
      fileList.appendChild(el);
    });

    fileList.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-remove'));
        const items = readStore();
        items.splice(i, 1);
        writeStore(items);
        render();
      });
    });
  };

  const readTextFile = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });

  const processFiles = async (files) => {
    const items = readStore();
    for (const file of files) {
      const isText = /text\//.test(file.type) || /\.(txt|md|json|csv)$/i.test(file.name);
      let preview = '';
      if (isText) {
        const text = await readTextFile(file);
        preview = text.slice(0, 320).trim();
        if (text.length > 320) preview += '…';
      }

      items.unshift({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        lastModified: file.lastModified,
        addedAt: new Date().toISOString(),
        preview,
      });
    }
    writeStore(items);
    render();
  };

  selectBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => processFiles(Array.from(e.target.files || [])));

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--accent-primary)';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'var(--glass-border-hover)';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--glass-border-hover)';
    processFiles(Array.from(e.dataTransfer?.files || []));
  });

  exportBtn.addEventListener('click', () => {
    const manifest = readStore();
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `howard-upload-manifest-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all uploaded document entries?')) return;
    writeStore([]);
    render();
  });

  render();
})();
