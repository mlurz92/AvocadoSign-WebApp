window.chartRenderer = (() => {

    function createSvgContainer(targetElementId, options = {}) {
        const container = d3.select(`#${targetElementId}`);
        if (container.empty() || !container.node()) { return null; }
        container.selectAll("svg").remove();
        container.html('');

        const containerNode = container.node();
        const initialWidth = containerNode.clientWidth || 0;
        const initialHeight = containerNode.clientHeight || 0;
        const margin = { ...window.APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...(options.margin || {}) };
        const width = options.width || (initialWidth > 20 ? initialWidth : window.APP_CONFIG.CHART_SETTINGS.DEFAULT_WIDTH);
        let height = options.height || (initialHeight > 20 ? initialHeight : window.APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT);

        const legendItemCount = options.legendItemCount || 0;
        const estimatedLegendHeight = options.legendBelow ? Math.max(25, legendItemCount * 12 + 15) : 0;
        if (options.useCompactMargins && options.legendBelow) {
            height = Math.max(height, (options.height || window.APP_CONFIG.CHART_SETTINGS.DEFAULT_HEIGHT) + estimatedLegendHeight);
        }

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom - estimatedLegendHeight;

        if (innerWidth <= 20 || innerHeight <= 20) {
            container.html('<p class="text-muted small text-center p-2">Chart size invalid or too small.</p>');
            return null;
        }

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .style("width", "100%").style("height", "100%").style("max-width", `${width}px`)
            .style("background-color", options.backgroundColor || window.APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR)
            .style("font-family", "var(--font-family-sans-serif)").style("overflow", "visible");

        const chartArea = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("class", "chart-area");
        return { svg, chartArea, width, height, innerWidth, innerHeight, margin, legendSpaceY: estimatedLegendHeight };
    }

    function createTooltip() {
        let tooltip = d3.select("body").select(".chart-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "chart-tooltip")
                .style("opacity", 0).style("position", "absolute").style("pointer-events", "none")
                .style("background", "rgba(33, 37, 41, 0.9)").style("color", "#fff").style("padding", "6px 10px")
                .style("border-radius", "4px").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TOOLTIP_FONT_SIZE).style("z-index", "3050")
                .style("line-height", "1.4").style("transition", `opacity ${window.APP_CONFIG.UI_SETTINGS.TRANSITION_DURATION_MS / 2}ms ease-out`);
        }
        return tooltip;
    }

    function renderAgeDistributionChart(ageData, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: { ...window.APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup;
        const tooltip = createTooltip();
        const barColor = window.APP_CONFIG.CHART_SETTINGS.AS_COLOR;

        if (!Array.isArray(ageData) || ageData.length === 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('No age data available.');
            return;
        }

        const xMin = d3.min(ageData);
        const xMax = d3.max(ageData);
        const xDomain = (xMin !== undefined && xMax !== undefined && !isNaN(xMin) && !isNaN(xMax)) ? [Math.max(0, xMin - 5), xMax + 5] : [0, 100];
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
        const tickCountX = Math.max(3, Math.min(10, Math.floor(innerWidth / 50)));
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(tickCountX).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", height - 5).style("font-size", window.APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE).text(window.APP_CONFIG.UI_TEXTS.axisLabels.age);

        const histogram = d3.histogram().value(d => d).domain(x.domain()).thresholds(x.ticks(Math.max(5, Math.min(20, Math.floor(innerWidth / 25)))));
        const bins = histogram(ageData.filter(d => !isNaN(d) && isFinite(d)));
        const yMax = d3.max(bins, d => d.length);
        const y = d3.scaleLinear().range([innerHeight, 0]).domain([0, yMax > 0 ? yMax : 1]).nice();
        const tickCountY = Math.max(2, Math.min(6, Math.floor(innerHeight / 35)));
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(tickCountY).tickSizeOuter(0).tickFormat(d3.format("d"))).selectAll("text").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 5}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", window.APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE).text(window.APP_CONFIG.UI_TEXTS.axisLabels.patientCount);

        if (window.APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES) {
            chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(tickCountY).tickSize(-innerWidth).tickFormat(""));
        }

        chartArea.selectAll(".bar").data(bins).join("rect").attr("class", "bar").attr("x", d => x(d.x0) + 1).attr("y", y(0)).attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)).attr("height", 0).style("fill", barColor).style("opacity", 0.8).attr("rx", 1).attr("ry", 1)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(50).style("opacity", .95);
                tooltip.html(`Age: ${formatNumber(d.x0, 0)}-${formatNumber(d.x1, 0)}<br>Count: ${d.length}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px");
                d3.select(event.currentTarget).style("opacity", 1).style("stroke", "#333").style("stroke-width", 0.5);
            })
            .on("mouseout", (event) => {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(event.currentTarget).style("opacity", 0.8).style("stroke", "none");
            })
            .transition().duration(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.length)).attr("height", d => Math.max(0, innerHeight - y(d.length)));
    }

    function renderPieChart(data, targetElementId, options = {}) {
        const setupOptions = { ...options, margin: options.useCompactMargins ? { ...window.APP_CONFIG.CHART_SETTINGS.COMPACT_PIE_MARGIN, ...options.margin } : { ...window.APP_CONFIG.CHART_SETTINGS.DEFAULT_MARGIN, ...options.margin }, legendBelow: options.legendBelow ?? options.useCompactMargins, legendItemCount: data?.length || 0 };
        const containerSetup = createSvgContainer(targetElementId, setupOptions);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, margin, legendSpaceY } = containerSetup;
        const tooltip = createTooltip();
        const colorScheme = [window.APP_CONFIG.CHART_SETTINGS.AS_COLOR, window.APP_CONFIG.CHART_SETTINGS.T2_COLOR, '#2ca02c', '#d62728'];
        const validData = data.filter(d => d && typeof d.value === 'number' && d.value >= 0 && typeof d.label === 'string');
        const totalValue = d3.sum(validData, d => d.value);

        if (validData.length === 0 || totalValue <= 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('No data available.');
            return;
        }

        const outerRadius = Math.min(innerWidth, innerHeight) / 2 * (options.outerRadiusFactor ?? 0.9);
        const innerRadius = outerRadius * (options.innerRadiusFactor ?? 0.5);
        if (outerRadius <= innerRadius || outerRadius <= 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('Chart too small');
            return;
        }

        const color = d3.scaleOrdinal().domain(validData.map(d => d.label)).range(colorScheme);
        const pie = d3.pie().value(d => d.value).sort(null);
        const arcGenerator = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).cornerRadius(options.cornerRadius ?? 2);
        const labelArcGenerator = d3.arc().innerRadius(innerRadius + (outerRadius - innerRadius) * 0.6).outerRadius(innerRadius + (outerRadius - innerRadius) * 0.6);

        const pieGroup = chartArea.append("g").attr("class", "pie-group").attr("transform", `translate(${innerWidth / 2},${innerHeight / 2})`);
        const arcs = pieGroup.selectAll(".arc").data(pie(validData)).join("g").attr("class", "arc");

        arcs.append("path").style("fill", d => color(d.data.label)).style("stroke", window.APP_CONFIG.CHART_SETTINGS.PLOT_BACKGROUND_COLOR).style("stroke-width", "1.5px").style("opacity", 0.85)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(50).style("opacity", .95);
                tooltip.html(`<strong>${d.data.label}:</strong> ${formatNumber(d.data.value, 0)} (${formatPercent(d.data.value / totalValue)})`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px");
                d3.select(this).transition().duration(100).style("opacity", 1).attr("transform", "scale(1.03)");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(this).transition().duration(100).style("opacity", 0.85).attr("transform", "scale(1)");
            })
            .transition().duration(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attrTween("d", d => {
                const i = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d);
                return t => arcGenerator(i(t));
            });
        
        if (setupOptions.legendBelow && legendSpaceY > 0) {
            const legendGroup = svg.append("g").attr("class", "legend pie-legend").attr("transform", `translate(${margin.left}, ${margin.top + innerHeight + 15})`).attr("font-size", window.APP_CONFIG.CHART_SETTINGS.LEGEND_FONT_SIZE).attr("text-anchor", "start");
            let currentX = 0; let currentY = 0;
            const legendItems = legendGroup.selectAll("g.legend-item").data(validData).join("g").attr("class", "legend-item");
            legendItems.each(function(d, i) {
                const item = d3.select(this);
                item.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", color(d.label));
                item.append("text").attr("x", 14).attr("y", 5).attr("dy", "0.35em").text(`${d.label} (${formatNumber(d.value, 0)})`);
                const itemWidth = this.getBBox().width + 15;
                if (i > 0 && currentX + itemWidth > innerWidth) { currentX = 0; currentY += 18; }
                item.attr("transform", `translate(${currentX}, ${currentY})`);
                currentX += itemWidth;
            });
        }
    }

    function renderComparisonBarChart(chartData, targetElementId, options = {}, t2Label = 'T2') {
        const setupOptions = { ...options, margin: { top: 20, right: 20, bottom: 60, left: 50, ...options.margin } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, width, height, margin } = containerSetup;
        const tooltip = createTooltip();
        if (!Array.isArray(chartData) || chartData.length === 0) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('No comparison data.');
            return;
        }
        
        const groups = chartData.map(d => d.metric);
        const subgroups = Object.keys(chartData[0]).filter(key => key !== 'metric');
        const subgroupDisplayNames = { 'AS': window.APP_CONFIG.UI_TEXTS.legendLabels.avocadoSign, 'T2': t2Label };
        const x0 = d3.scaleBand().domain(groups).range([0, innerWidth]).paddingInner(0.35);
        const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.15);
        const y = d3.scaleLinear().domain([0, 1.0]).nice().range([innerHeight, 0]);
        const color = d3.scaleOrdinal().domain(subgroups).range([window.APP_CONFIG.CHART_SETTINGS.AS_COLOR, window.APP_CONFIG.CHART_SETTINGS.T2_COLOR]);
        
        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(5, "%").tickSizeOuter(0)).selectAll("text").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", window.APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE).text(window.APP_CONFIG.UI_TEXTS.axisLabels.metricValue);
        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x0).tickSizeOuter(0)).selectAll(".tick text").style("text-anchor", "middle").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        if (window.APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES) {
            chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""));
        }
        
        const metricGroup = chartArea.selectAll(".metric-group").data(chartData).join("g").attr("class", "metric-group").attr("transform", d => `translate(${x0(d.metric)},0)`);
        metricGroup.selectAll("rect").data(d => subgroups.map(key => ({key: key, value: d[key], metric: d.metric}))).join("rect").attr("class", d => `bar bar-${d.key.toLowerCase()}`).attr("x", d => x1(d.key)).attr("y", y(0)).attr("width", x1.bandwidth()).attr("height", 0).attr("fill", d => color(d.key)).style("opacity", 0.9).attr("rx", 1).attr("ry", 1)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(50).style("opacity", .95);
                const displayName = subgroupDisplayNames[d.key] || d.key;
                const digits = (d.metric === 'AUC' || d.metric === 'F1') ? 2 : 0;
                const formattedValue = (d.metric === 'AUC' || d.metric === 'F1') ? formatNumber(d.value, digits) : formatPercent(d.value, digits);
                tooltip.html(`<strong>${d.metric} (${displayName}):</strong> ${formattedValue}`).style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 15) + "px");
                d3.select(this).style("opacity", 1).style("stroke", "#333").style("stroke-width", 1);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(this).style("opacity", 0.9).style("stroke", "none");
            })
            .transition().duration(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS).ease(d3.easeCubicOut).attr("y", d => y(d.value ?? 0)).attr("height", d => Math.max(0, innerHeight - y(d.value ?? 0)));
        
        const legendGroup = svg.append("g").attr("class", "legend bar-legend").attr("font-size", window.APP_CONFIG.CHART_SETTINGS.LEGEND_FONT_SIZE).attr("text-anchor", "start");
        const legendItems = legendGroup.selectAll("g.legend-item").data(subgroups).join("g").attr("class", "legend-item");
        let totalLegendWidth = 0; const legendSpacings = [];
        legendItems.append("rect").attr("x", 0).attr("y", -5).attr("width", 10).attr("height", 10).attr("fill", color);
        legendItems.append("text").attr("x", 14).attr("y", 0).attr("dy", "0.35em").text(d => subgroupDisplayNames[d] || d).each(function() {
            legendSpacings.push(this.getBBox().width + 25);
            totalLegendWidth += this.getBBox().width + 25;
        });
        const legendStartX = margin.left + Math.max(0, (innerWidth - totalLegendWidth) / 2);
        let currentX = legendStartX;
        legendItems.attr("transform", (d, i) => {
            const tx = currentX;
            currentX += legendSpacings[i];
            return `translate(${tx}, ${height - margin.bottom + 30})`;
        });
    }

    function renderDiagnosticPerformanceChart(data, predictionKey, referenceKey, targetElementId, methodName) {
        const setupOptions = { margin: { top: 30, right: 40, bottom: 50, left: 70 } };
        const containerSetup = createSvgContainer(targetElementId, setupOptions);
        if (!containerSetup) return;
        const { svg, chartArea, innerWidth, innerHeight, margin } = containerSetup;
        const tooltip = createTooltip();

        const performance = window.statisticsService.calculateDiagnosticPerformance(data, predictionKey, referenceKey);
        if (!performance || !isFinite(performance.sens?.value) || !isFinite(performance.spec?.value)) {
            chartArea.append('text').attr('x', innerWidth / 2).attr('y', innerHeight / 2).attr('text-anchor', 'middle').attr('class', 'text-muted small').text('No valid data for ROC chart.');
            return;
        }

        const sensitivity = performance.sens.value;
        const specificity = performance.spec.value;
        const oneMinusSpecificity = 1 - specificity;
        const auc = performance.auc.value;

        const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
        const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);

        chartArea.append("g").attr("class", "x-axis axis").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label x-axis-label").attr("text-anchor", "middle").attr("x", margin.left + innerWidth / 2).attr("y", innerHeight + margin.top + 30).style("font-size", window.APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE).text(window.APP_CONFIG.UI_TEXTS.axisLabels.oneMinusSpecificity);

        chartArea.append("g").attr("class", "y-axis axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".1f"))).selectAll("text").style("font-size", window.APP_CONFIG.CHART_SETTINGS.TICK_LABEL_FONT_SIZE);
        svg.append("text").attr("class", "axis-label y-axis-label").attr("text-anchor", "middle").attr("transform", `translate(${margin.left / 2 - 10}, ${margin.top + innerHeight / 2}) rotate(-90)`).style("font-size", window.APP_CONFIG.CHART_SETTINGS.AXIS_LABEL_FONT_SIZE).text(window.APP_CONFIG.UI_TEXTS.axisLabels.sensitivity);

        if (window.APP_CONFIG.CHART_SETTINGS.ENABLE_GRIDLINES) {
            chartArea.append("g").attr("class", "grid x-grid").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickSize(-innerHeight).tickFormat(""));
            chartArea.append("g").attr("class", "grid y-grid").call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(""));
        }

        chartArea.append("line")
            .attr("class", "reference-line")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", x(1))
            .attr("y2", y(1))
            .style('stroke', '#adb5bd')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '4 2');

        const rocLine = d3.line()
            .x(d => x(d[0]))
            .y(d => y(d[1]))
            .curve(d3.curveMonotoneX);

        const dataPoints = [
            [0, 0], 
            [oneMinusSpecificity, sensitivity], 
            [1, 1]
        ];

        chartArea.append("path")
            .datum(dataPoints)
            .attr("class", "roc-curve")
            .attr("fill", "none")
            .attr("stroke", window.APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .attr("stroke-width", 2);

        const pathLength = chartArea.select(".roc-curve").node().getTotalLength();
        chartArea.select(".roc-curve")
            .attr("stroke-dasharray", pathLength + " " + pathLength)
            .attr("stroke-dashoffset", pathLength)
            .transition()
            .duration(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .attr('d', rocLine);

        const circle = chartArea.append("circle")
            .attr("cx", x(oneMinusSpecificity))
            .attr("cy", y(sensitivity))
            .attr("r", 0)
            .attr("fill", window.APP_CONFIG.CHART_SETTINGS.AS_COLOR)
            .on("mouseover", (event) => {
                tooltip.transition().duration(50).style("opacity", .95);
                tooltip.html(`<strong>${methodName}</strong><br>Sensitivity: ${formatPercent(sensitivity, 1)}<br>1-Specificity: ${formatPercent(oneMinusSpecificity, 1)}<br>AUC: ${formatNumber(auc, 2)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
                 d3.select(event.currentTarget).transition().duration(100).attr('r', 7);
            })
            .on("mouseout", (event) => {
                tooltip.transition().duration(200).style("opacity", 0);
                d3.select(event.currentTarget).transition().duration(100).attr('r', 5);
            });
            
        circle.transition()
            .delay(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS / 2)
            .duration(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS / 2)
            .attr("r", 5);

        chartArea.append("text")
            .attr("class", "auc-label")
            .attr("x", innerWidth - 5)
            .attr("y", innerHeight - 5)
            .attr("text-anchor", "end")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("opacity", 0)
            .text(`AUC: ${formatNumber(auc, 2)}`)
            .transition()
            .delay(window.APP_CONFIG.CHART_SETTINGS.ANIMATION_DURATION_MS)
            .duration(400)
            .style("opacity", 1);
    }

    return Object.freeze({
        renderAgeDistributionChart,
        renderPieChart,
        renderComparisonBarChart,
        renderDiagnosticPerformanceChart
    });

})();