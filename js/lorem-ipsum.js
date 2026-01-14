document.addEventListener('DOMContentLoaded', () => {
    const paragraphsInput = document.getElementById('paragraphs');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const outputEl = document.getElementById('output');

    const LOREM_PARAGRAPH = [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt consectetur, nisi nisl aliquam eros, a malesuada dui sapien ut nulla.",
        "Suspendisse potenti. Proin commodo, massa eu facilisis gravida, justo velit pretium sem, quis porta augue sem eget erat.",
        "Mauris placerat, quam in mattis laoreet, dui orci dictum urna, vitae dictum enim turpis ut leo.",
        "Praesent nec velit at enim feugiat efficitur ac ut erat. Nam euismod, eros ut cursus tincidunt, risus velit euismod nibh, non dictum urna lacus eu enim.",
        "Quisque euismod, ex ut dictum pharetra, orci purus faucibus erat, sit amet pretium tellus sapien eu est.",
        "Etiam at turpis eu elit cursus tempus. Pellentesque et scelerisque sem, eu gravida velit.",
        "Vivamus dictum arcu nec tortor cursus, eget maximus lorem dictum. Proin sodales sem in cursus cursus.",
        "Donec nec lorem non urna facilisis cursus. Morbi accumsan, augue ut mollis tempus, sem massa pretium ex, ac iaculis velit enim ac urna.",
        "Phasellus ac orci id nulla luctus molestie. Curabitur maximus, erat in efficitur cursus, massa enim mollis arcu, at scelerisque libero tellus a felis.",
        "Sed ac massa ut urna feugiat scelerisque. Quisque gravida dictum nisi, in dictum erat dictum in."
    ];

    function generateLorem(paragraphs) {
        let result = [];
        for (let i = 0; i < paragraphs; i++) {
            // Pick random paragraphs (or cycle)
            result.push(LOREM_PARAGRAPH[i % LOREM_PARAGRAPH.length]);
        }
        return result.join('\n\n');
    }

    generateBtn.addEventListener('click', () => {
        const num = Math.max(1, Math.min(20, parseInt(paragraphsInput.value, 10) || 1));
        const text = generateLorem(num);
        outputEl.value = text;
        copyBtn.disabled = !text;
    });

    copyBtn.addEventListener('click', () => {
        if (!outputEl.value) return;
        navigator.clipboard.writeText(outputEl.value)
            .then(() => showNotification('Copied to clipboard', 'success'))
            .catch(() => showNotification('Copy failed', 'error'));
    });

    // Initial state
    outputEl.value = '';
    copyBtn.disabled = true;
});