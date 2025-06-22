window.flowchartRenderer = (() => {

    function renderFlowchart(statsData, targetElementId) {
        const container = d3.select(`#${targetElementId}`);
        container.html('');

        const nOverall = statsData?.Overall?.descriptive?.patientCount || 0;
        const nSurgeryAlone = statsData?.surgeryAlone?.descriptive?.patientCount || 0;
        const nNeoadjuvantTherapy = statsData?.neoadjuvantTherapy?.descriptive?.patientCount || 0;
        const nExcluded = 0;
        const nIncluded = nOverall;

        if (nOverall === 0) {
            container.html('<p class="text-muted small p-2">Flowchart data not available.</p>');
            return;
        }

        const width = 600;
        const height = 450;
        const boxWidth = 280;
        const boxHeight = 55;
        const hSpacing = 300;
        const vSpacing = 85;

        const svg = container.append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('width', '100%')
            .style('height', 'auto')
            .style('max-width', `${width}px`)
            .style('font-family', 'Arial, sans-serif')
            .style('font-size', '12px');

        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#333')
            .style('stroke', 'none');

        const nodes = [
            { id: 'start', x: (width - boxWidth) / 2, y: 10, text: [`Patients with rectal cancer`, `assessed for eligibility (n = ${nOverall})`] },
            { id: 'exclusion', x: (width - boxWidth) / 2, y: 10 + vSpacing, text: [`Excluded (n = ${nExcluded})`, `(No additional exclusions for this analysis)`] },
            { id: 'included', x: (width - boxWidth) / 2, y: 10 + 2 * vSpacing, text: [`Included in final analysis (n = ${nIncluded})`] },
            { id: 'surgeryAlone', x: (width - hSpacing - boxWidth) / 2, y: 10 + 3 * vSpacing, text: [`Underwent primary surgery`, `(Analyzed: n = ${nSurgeryAlone})`] },
            { id: 'neoadjuvant', x: (width + hSpacing - boxWidth) / 2, y: 10 + 3 * vSpacing, text: [`Received neoadjuvant therapy`, `(Analyzed: n = ${nNeoadjuvantTherapy})`] }
        ];
        
        const lineGenerator = d3.line().x(d => d.x).y(d => d.y);
        
        const links = [
            { path: [{x: nodes[0].x + boxWidth / 2, y: nodes[0].y + boxHeight}, {x: nodes[1].x + boxWidth / 2, y: nodes[1].y}] },
            { path: [{x: nodes[1].x + boxWidth / 2, y: nodes[1].y + boxHeight}, {x: nodes[2].x + boxWidth / 2, y: nodes[2].y}] },
            { path: [
                {x: nodes[2].x + boxWidth / 2, y: nodes[2].y + boxHeight},
                {x: nodes[2].x + boxWidth / 2, y: nodes[2].y + boxHeight + 20}
            ]},
            { path: [
                {x: nodes[3].x + boxWidth / 2, y: nodes[2].y + boxHeight + 20},
                {x: nodes[4].x + boxWidth / 2, y: nodes[2].y + boxHeight + 20}
            ]},
            { path: [{x: nodes[3].x + boxWidth / 2, y: nodes[2].y + boxHeight + 20}, {x: nodes[3].x + boxWidth / 2, y: nodes[3].y}] },
            { path: [{x: nodes[4].x + boxWidth / 2, y: nodes[2].y + boxHeight + 20}, {x: nodes[4].x + boxWidth / 2, y: nodes[4].y}] }
        ];

        svg.selectAll('.flowchart-link')
            .data(links)
            .enter()
            .append('path')
            .attr('d', d => lineGenerator(d.path))
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .attr('marker-end', (d, i) => i !== 3 ? 'url(#arrowhead)' : 'none');
        
        const nodeGroups = svg.selectAll('.flowchart-node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'flowchart-node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        nodeGroups.append('rect')
            .attr('width', d => d.width || boxWidth)
            .attr('height', d => d.height || boxHeight)
            .attr('fill', '#ffffff')
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .attr('rx', 2)
            .attr('ry', 2);

        const textElements = nodeGroups.append('text')
            .attr('x', d => (d.width || boxWidth) / 2)
            .attr('y', d => (d.height || boxHeight) / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central');

        textElements.each(function(d) {
            const el = d3.select(this);
            const lineHeight = 1.2;
            const startY = -((d.text.length - 1) * lineHeight) / 2 * 12; 
            d.text.forEach((line, i) => {
                const tspan = el.append('tspan')
                    .attr('x', (d.width || boxWidth) / 2)
                    .attr('dy', i === 0 ? `${startY}px` : `${lineHeight}em`)
                    .text(line);
                if (line.startsWith('•')) {
                    tspan.attr('text-anchor', 'start').attr('x', 15).style('font-size', '11px');
                }
            });
        });
    }

    return Object.freeze({
        renderFlowchart
    });

})();