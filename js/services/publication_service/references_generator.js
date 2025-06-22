window.referencesGenerator = (() => {

    function processAndNumberReferences(html, allReferences) {
        const citedRefKeys = new Map();
        let refCounter = 1;

        if (typeof html !== 'string' || !allReferences) {
            return { processedHtml: html || '', referencesHtml: '' };
        }

        const processedHtml = html.replace(/(\[[A-Za-z0-9_]+\])+/g, (match) => {
            const keys = match.match(/\[([A-Za-z0-9_]+)\]/g).map(k => k.slice(1, -1));
            const numbers = keys.map(refKey => {
                if (!allReferences[refKey]) {
                    return `REF_NOT_FOUND: ${refKey}`;
                }
                if (!citedRefKeys.has(refKey)) {
                    citedRefKeys.set(refKey, refCounter++);
                }
                return citedRefKeys.get(refKey);
            });
            
            const uniqueNumbers = [...new Set(numbers)].sort((a, b) => a - b);
            return `(${uniqueNumbers.join(', ')})`;
        });

        const sortedCitedRefs = Array.from(citedRefKeys.entries()).sort((a, b) => a[1] - b[1]);

        let referencesHtml = '';
        if (sortedCitedRefs.length > 0) {
            const listItems = sortedCitedRefs.map(([key, number]) => {
                const refData = allReferences[key];
                if (!refData || !refData.text) {
                    return `<li>Reference for key '${key}' not found.</li>`;
                }
                const formattedText = refData.text.replace(/(\d{4};\d{1,3}:\d{1,4}–\d{1,4})/, '<strong>$1</strong>');
                return `<li>${formattedText}</li>`;
            }).join('');
            referencesHtml = `<section id="references_main"><h2>References</h2><ol>${listItems}</ol></section>`;
        } else {
             referencesHtml = `<section id="references_main"><h2>References</h2><p class="text-muted">No references cited in the text.</p></section>`;
        }

        return { processedHtml, referencesHtml };
    }

    return Object.freeze({
        processAndNumberReferences
    });

})();