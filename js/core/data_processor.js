const dataProcessor = (() => {

    function calculateAge(birthDateStr, examDateStr) {
        if (!birthDateStr || !examDateStr) return null;
        try {
            const birthDate = new Date(birthDateStr);
            const examDate = new Date(examDateStr);
            if (isNaN(birthDate.getTime()) || isNaN(examDate.getTime()) || birthDate > examDate) {
                return null;
            }
            let age = examDate.getFullYear() - birthDate.getFullYear();
            const monthDiff = examDate.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && examDate.getDate() < birthDate.getDate())) {
                age--;
            }
            return age >= 0 ? age : null;
        } catch (e) {
            return null;
        }
    }

    function processSinglePatient(rawPatient, index) {
        const p = {};
        const config = APP_CONFIG;

        p.id = typeof rawPatient.nr === 'number' ? rawPatient.nr : index + 1;
        p.name = typeof rawPatient.name === 'string' ? rawPatient.name.trim() : 'Unknown';
        p.firstName = typeof rawPatient.vorname === 'string' ? rawPatient.vorname.trim() : '';
        p.birthDate = rawPatient.geburtsdatum || null;
        p.examDate = rawPatient.untersuchungsdatum || null;
        p.sex = (rawPatient.geschlecht === 'm' || rawPatient.geschlecht === 'f') ? rawPatient.geschlecht : 'unknown';
        p.therapy = (rawPatient.therapie === 'direkt OP' || rawPatient.therapie === 'nRCT') ? rawPatient.therapie : 'unknown';
        p.nStatus = (rawPatient.n === '+' || rawPatient.n === '-') ? rawPatient.n : null;
        p.asStatus = (rawPatient.as === '+' || rawPatient.as === '-') ? rawPatient.as : null;

        const validateCount = (value) => (typeof value === 'number' && value >= 0 && Number.isInteger(value)) ? value : 0;
        p.countPathologyNodes = validateCount(rawPatient.anzahl_patho_lk);
        p.countPathologyNodesPositive = validateCount(rawPatient.anzahl_patho_n_plus_lk);
        p.countASNodes = validateCount(rawPatient.anzahl_as_lk);
        p.countASNodesPositive = validateCount(rawPatient.anzahl_as_plus_lk);

        p.notes = typeof rawPatient.bemerkung === 'string' ? rawPatient.bemerkung.trim() : '';
        p.age = calculateAge(p.birthDate, p.examDate);

        const rawT2Nodes = rawPatient.lymphknoten_t2;
        p.t2Nodes = [];

        if (Array.isArray(rawT2Nodes)) {
            p.t2Nodes = rawT2Nodes.map(lk => {
                if (typeof lk !== 'object' || lk === null) return null;
                const processedLk = {};
                processedLk.size = (typeof lk.groesse === 'number' && !isNaN(lk.groesse) && lk.groesse >= 0) ? lk.groesse : null;

                const validateEnum = (value, allowedValues) => (typeof value === 'string' && value !== null && allowedValues.includes(value.trim().toLowerCase())) ? value.trim().toLowerCase() : null;

                processedLk.shape = validateEnum(lk.form, config.T2_CRITERIA_SETTINGS.FORM_VALUES);
                processedLk.border = validateEnum(lk.kontur, config.T2_CRITERIA_SETTINGS.KONTUR_VALUES);
                processedLk.homogeneity = validateEnum(lk.homogenitaet, config.T2_CRITERIA_SETTINGS.HOMOGENITAET_VALUES);
                processedLk.signal = validateEnum(lk.signal, config.T2_CRITERIA_SETTINGS.SIGNAL_VALUES);
                return processedLk;
            }).filter(lk => lk !== null);
        }
        
        p.countT2Nodes = p.t2Nodes.length;
        p.t2Status = null;
        p.countT2NodesPositive = 0;
        p.t2NodesEvaluated = [];

        return p;
    }

    function processAllData(rawData) {
        if (!Array.isArray(rawData)) return [];
        if (typeof APP_CONFIG === 'undefined') return [];
        return rawData.map((patient, index) => processSinglePatient(patient, index));
    }

    function filterDataByCohort(data, cohortId) {
        if (!Array.isArray(data)) return [];
        if (!cohortId || cohortId === 'Gesamt') {
            return cloneDeep(data);
        }
        return cloneDeep(data.filter(p => p && p.therapy === cohortId));
    }

    function calculateHeaderStats(data, cohortId) {
        const n = data?.length ?? 0;
        const cohortName = getCohortDisplayName(cohortId);
        const placeholder = '--';

        if (!Array.isArray(data) || n === 0) {
            return { cohort: cohortName, patientCount: 0, statusN: placeholder, statusAS: placeholder, statusT2: placeholder, nPos: 0, nNeg: 0, asPos: 0, asNeg: 0, t2Pos: 0, t2Neg: 0 };
        }

        let nPos = 0, nNeg = 0, asPos = 0, asNeg = 0, t2Pos = 0, t2Neg = 0;
        data.forEach(p => {
            if (p) {
                if (p.nStatus === '+') nPos++; else if (p.nStatus === '-') nNeg++;
                if (p.asStatus === '+') asPos++; else if (p.asStatus === '-') asNeg++;
                if (p.t2Status === '+') t2Pos++; else if (p.t2Status === '-') t2Neg++;
            }
        });

        const formatStatus = (pos, neg) => {
            const totalKnown = pos + neg;
            return totalKnown > 0 ? `${formatPercent(pos / totalKnown, 0)} (+)` : placeholder;
        };

        return {
            cohort: cohortName,
            patientCount: n,
            statusN: formatStatus(nPos, nNeg),
            statusAS: formatStatus(asPos, asNeg),
            statusT2: formatStatus(t2Pos, t2Neg),
            nPos: nPos,
            nNeg: nNeg,
            asPos: asPos,
            asNeg: asNeg,
            t2Pos: t2Pos,
            t2Neg: t2Neg
        };
    }

    return Object.freeze({
        processAllData,
        filterDataByCohort,
        calculateHeaderStats
    });

})();
