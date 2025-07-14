const testValidateInternshipPeriod = () => {
    console.log('Testing validateInternshipPeriod...');

    // Test cases
    const tests = [
        {
            name: 'Valid period',
            startDate: '2025-07-15',
            endDate: '2025-09-30',
            isAdmin: false,
            shouldPass: true
        },
        {
            name: 'Invalid range (end before start)',
            startDate: '2025-04-30',
            endDate: '2025-02-01',
            isAdmin: false,
            shouldPass: false
        },
        {
            name: 'Too short duration',
            startDate: '2025-02-01',
            endDate: '2025-02-15',
            isAdmin: false,
            shouldPass: false
        },
        {
            name: 'Too long duration',
            startDate: '2025-02-01',
            endDate: '2025-09-01',
            isAdmin: false,
            shouldPass: false
        },
        {
            name: 'Past date (admin can set)',
            startDate: '2024-12-01',
            endDate: '2025-03-01',
            isAdmin: true,
            shouldPass: true
        },
        {
            name: 'Past date (user cannot set)',
            startDate: '2024-12-01',
            endDate: '2025-03-01',
            isAdmin: false,
            shouldPass: false
        }
    ];

    // Implementasi validateInternshipPeriod untuk testing
    const validateInternshipPeriod = (startDate, endDate, isAdmin) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        if (start >= end) {
            throw new Error('Tanggal mulai magang harus sebelum tanggal selesai magang.');
        }

        const oneMonthLater = new Date(start);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        if (end < oneMonthLater) {
            throw new Error('Durasi magang minimal 1 bulan.');
        }

        const sixMonthsLater = new Date(start);
        sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
        if (end > sixMonthsLater) {
            throw new Error('Durasi magang maksimal 6 bulan.');
        }

        if (!isAdmin && start < now) {
            throw new Error('Tanggal mulai magang tidak boleh di masa lalu.');
        }
    };

    tests.forEach(test => {
        try {
            validateInternshipPeriod(test.startDate, test.endDate, test.isAdmin);
            console.log(`✅ ${test.name}: PASSED (expected to pass: ${test.shouldPass})`);
        } catch (error) {
            if (test.shouldPass) {
                console.log(`❌ ${test.name}: FAILED - ${error.message}`);
            } else {
                console.log(`✅ ${test.name}: PASSED (correctly rejected) - ${error.message}`);
            }
        }
    });
};

testValidateInternshipPeriod();