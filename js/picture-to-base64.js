document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const includePrefix = document.getElementById('include-prefix');
    const outputType = document.getElementById('output-type');
    const enableResize = document.getElementById('enable-resize');
    const maxWidthEl = document.getElementById('max-width');
    const maxHeightEl = document.getElementById('max-height');
    const qualityEl = document.getElementById('quality');
    const qualityVal = document.getElementById('quality-val');

    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');

    const previewImg = document.getElementById('preview');
    const outArea = document.getElementById('output');

    // Meta fields
    const inName = document.getElementById('in-name');
    const inType = document.getElementById('in-type');
    const inSize = document.getElementById('in-size');
    const inDim = document.getElementById('in-dim');
    const outType = document.getElementById('out-type');
    const outSize = document.getElementById('out-size');
    const outChars = document.getElementById('out-chars');

    let currentFile = null;
    let currentImage = null; // HTMLImageElement
    let naturalWidth = 0;
    let naturalHeight = 0;

    // Helpers
    function fmtBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024, dm = 2, sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function resetState() {
        currentFile = null;
        currentImage = null;
        naturalWidth = 0;
        naturalHeight = 0;

        previewImg.removeAttribute('src');
        inName.textContent = '-';
        inType.textContent = '-';
        inSize.textContent = '-';
        inDim.textContent = '-';
        outType.textContent = '-';
        outSize.textContent = '-';
        outChars.textContent = '-';
        outArea.value = '';

        convertBtn.disabled = true;
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
    }

    function updateQualityUI() {
        const type = outputType.value;
        const isLossy = (type === 'image/jpeg' || type === 'image/webp');
        qualityEl.disabled = !isLossy;
        qualityVal.textContent = (+qualityEl.value).toFixed(2);
    }

    function setFile(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showNotification('Please choose an image file', 'error');
            return;
        }

        currentFile = file;
        inName.textContent = file.name;
        inType.textContent = file.type || 'unknown';
        inSize.textContent = fmtBytes(file.size);

        // Load preview and get dimensions
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            previewImg.src = dataUrl;

            const img = new Image();
            img.onload = () => {
                currentImage = img;
                naturalWidth = img.naturalWidth || img.width;
                naturalHeight = img.naturalHeight || img.height;
                inDim.textContent = `${naturalWidth} × ${naturalHeight}px`;
                convertBtn.disabled = false;
            };
            img.onerror = () => {
                showNotification('Failed to load image for preview', 'error');
                convertBtn.disabled = true;
            };
            img.src = dataUrl;
        };
        reader.onerror = () => {
            showNotification('Failed to read file', 'error');
            convertBtn.disabled = true;
        };
        reader.readAsDataURL(file);
    }

    async function fileToDataUrlViaCanvas(img, targetType, q, resizeOpts) {
        // Determine target size
        let targetW = img.naturalWidth || img.width;
        let targetH = img.naturalHeight || img.height;

        if (resizeOpts && resizeOpts.enable && (resizeOpts.maxW || resizeOpts.maxH)) {
            const maxW = resizeOpts.maxW || targetW;
            const maxH = resizeOpts.maxH || targetH;
            const ratio = Math.min(maxW / targetW, maxH / targetH, 1);
            targetW = Math.max(1, Math.round(targetW * ratio));
            targetH = Math.max(1, Math.round(targetH * ratio));
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        // Improve scaling quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Convert to dataURL
        const quality = (targetType === 'image/jpeg' || targetType === 'image/webp') ? q : 1.0;

        // Use toBlob for memory efficiency then convert to data URL
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, targetType, quality));
        if (!blob) {
            // Fallback to toDataURL
            return canvas.toDataURL(targetType, quality);
        }
        const blobDataUrl = await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = reject;
            fr.readAsDataURL(blob);
        });
        return blobDataUrl;
    }

    function svgTextToDataUrl(text) {
        const svgBase64 = btoa(unescape(encodeURIComponent(text)));
        return `data:image/svg+xml;base64,${svgBase64}`;
    }

    async function convert() {
        if (!currentFile) return;

        try {
            convertBtn.disabled = true;
            copyBtn.disabled = true;
            downloadBtn.disabled = true;
            outArea.value = 'Converting...';

            const wantType = outputType.value; // 'same' or a mime
            const resize = !!enableResize.checked;
            const maxW = parseInt(maxWidthEl.value || '0', 10) || undefined;
            const maxH = parseInt(maxHeightEl.value || '0', 10) || undefined;
            const q = Math.min(1, Math.max(0.1, parseFloat(qualityEl.value || '0.92')));

            const isSVG = (currentFile.type === 'image/svg+xml');
            let targetType = (wantType === 'same') ? (currentFile.type || 'image/png') : wantType;

            // If original is SVG and user selected "same" but wants resize or non-SVG target => rasterize via canvas
            let dataUrl = '';
            if (isSVG) {
                const text = await currentFile.text();
                if (resize || (targetType !== 'image/svg+xml')) {
                    // Create an image from SVG text and draw to canvas
                    const svgUrl = svgTextToDataUrl(text);
                    const tmpImg = new Image();
                    await new Promise((resolve, reject) => {
                        tmpImg.onload = resolve;
                        tmpImg.onerror = reject;
                        tmpImg.src = svgUrl;
                    });
                    dataUrl = await fileToDataUrlViaCanvas(tmpImg, targetType === 'image/svg+xml' ? 'image/png' : targetType, q, { enable: resize, maxW, maxH });
                    // If target was still SVG, we produced PNG as fallback
                    if (targetType === 'image/svg+xml') targetType = 'image/png';
                } else {
                    // Keep SVG as data URL
                    dataUrl = svgTextToDataUrl(text);
                    targetType = 'image/svg+xml';
                }
            } else {
                // Raster input
                if (!currentImage) {
                    // Fallback: read file directly
                    dataUrl = await new Promise((resolve, reject) => {
                        const fr = new FileReader();
                        fr.onload = () => resolve(fr.result);
                        fr.onerror = reject;
                        fr.readAsDataURL(currentFile);
                    });
                    // If resize or type change requested, use canvas
                    if (resize || (wantType !== 'same')) {
                        const tmp = new Image();
                        await new Promise((resolve, reject) => {
                            tmp.onload = resolve;
                            tmp.onerror = reject;
                            tmp.src = dataUrl;
                        });
                        dataUrl = await fileToDataUrlViaCanvas(tmp, targetType, q, { enable: resize, maxW, maxH });
                    } else {
                        targetType = (currentFile.type || 'image/png');
                    }
                } else {
                    // Have loaded image
                    if (resize || (wantType !== 'same')) {
                        dataUrl = await fileToDataUrlViaCanvas(currentImage, targetType, q, { enable: resize, maxW, maxH });
                    } else {
                        // Read direct as data URL
                        dataUrl = await new Promise((resolve, reject) => {
                            const fr = new FileReader();
                            fr.onload = () => resolve(fr.result);
                            fr.onerror = reject;
                            fr.readAsDataURL(currentFile);
                        });
                        targetType = (currentFile.type || 'image/png');
                    }
                }
            }

            // Prepare output string
            let outputString = dataUrl;
            if (!includePrefix.checked) {
                const commaIdx = dataUrl.indexOf(',');
                outputString = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
            }

            outArea.value = outputString;
            outType.textContent = targetType;

            // Estimate output size
            // Base64 encoding: 4 chars per 3 bytes; data URL includes prefix before comma
            const b64 = includePrefix.checked ? outputString.substring(outputString.indexOf(',') + 1) : outputString;
            const approxBytes = Math.floor((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
            outSize.textContent = fmtBytes(Math.max(0, approxBytes));
            outChars.textContent = outputString.length.toLocaleString();

            copyBtn.disabled = false;
            downloadBtn.disabled = false;
            showNotification('Conversion complete', 'success');
        } catch (err) {
            console.error(err);
            outArea.value = '';
            showNotification('Conversion failed: ' + (err.message || err), 'error');
        } finally {
            convertBtn.disabled = !currentFile;
        }
    }

    function copyOutput() {
        const text = outArea.value;
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => showNotification('Copied to clipboard', 'success'))
                .catch(err => showNotification('Copy failed: ' + err, 'error'));
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                showNotification('Copied to clipboard', 'success');
            } catch (e) {
                showNotification('Copy failed', 'error');
            }
            document.body.removeChild(ta);
        }
    }

    function downloadOutput() {
        const text = outArea.value;
        if (!text) return;
        const nameBase = (currentFile?.name || 'image').replace(/\.[^.]+$/, '');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nameBase}.base64.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // Events
    fileInput.addEventListener('change', (e) => {
        resetState();
        const file = e.target.files?.[0];
        if (file) setFile(file);
    });

    // Drag & drop
    ['dragenter', 'dragover'].forEach(ev =>
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        })
    );
    ['dragleave', 'drop'].forEach(ev =>
        dropZone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (ev === 'drop') {
                const file = e.dataTransfer?.files?.[0];
                resetState();
                if (file) setFile(file);
            }
            dropZone.classList.remove('dragover');
        })
    );
    // Click open file dialog
    dropZone.addEventListener('click', () => fileInput.click());

    // Options UI
    outputType.addEventListener('change', updateQualityUI);
    qualityEl.addEventListener('input', updateQualityUI);
    updateQualityUI();

    // Buttons
    convertBtn.addEventListener('click', convert);
    copyBtn.addEventListener('click', copyOutput);
    downloadBtn.addEventListener('click', downloadOutput);
});