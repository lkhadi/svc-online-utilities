document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input-text');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');

    function updateCounts() {
        const text = input.value;
        charCount.textContent = text.length;

        // Word count: split by whitespace, filter out empty strings
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        wordCount.textContent = text.trim().length === 0 ? 0 : words.length;
    }

    input.addEventListener('input', updateCounts);
    updateCounts();
});