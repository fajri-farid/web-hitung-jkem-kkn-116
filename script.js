// Konfigurasi endpoint Google Apps Script Web App untuk data feedback.
// Nilai dibaca otomatis dari file .env (VITE_GOOGLE_SCRIPT_FEEDBACK_URL)
const GOOGLE_SCRIPT_FEEDBACK_URL = import.meta.env.VITE_GOOGLE_SCRIPT_FEEDBACK_URL || '';

const feedbackState = {
    manualTime: null,
    webTime: null,
    rating: null
};

window.addEventListener('DOMContentLoaded', () => {
    if (navigator.platform && navigator.platform.toUpperCase().includes('MAC')) {
        switchTab('mac');
    }

    const promoModal = document.getElementById('promoModal');
    const closePromoBtn = document.getElementById('closePromoModal');
    
    if (promoModal && closePromoBtn) {
        const openModal = () => {
            promoModal.showModal();
            document.body.classList.add('modal-open');
            document.documentElement.classList.add('modal-open');
        };

        const closeModal = () => {
            promoModal.close();
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        };

        setTimeout(() => {
            openModal();
        }, 1500);

        closePromoBtn.addEventListener('click', () => {
            closeModal();
        });

        promoModal.addEventListener('click', (e) => {
            const dialogDimensions = promoModal.getBoundingClientRect();
            if (
                e.clientX < dialogDimensions.left || e.clientX > dialogDimensions.right ||
                e.clientY < dialogDimensions.top || e.clientY > dialogDimensions.bottom
            ) {
                closeModal();
            }
        });

        promoModal.addEventListener('close', () => {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        });

        promoModal.addEventListener('cancel', () => {
            document.body.classList.remove('modal-open');
            document.documentElement.classList.remove('modal-open');
        });
    }

    initFeedbackModal();
});

function initFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    const submitBtn = document.getElementById('submitFeedbackBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackSuccess = document.getElementById('feedbackSuccess');
    const closeFeedbackSuccessBtn = document.getElementById('closeFeedbackSuccessBtn');
    let autoCloseTimer = null;

    if (!feedbackModal) return;

    const closeSuccessModal = () => {
        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }
        feedbackModal.close();
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
    };

    if (closeFeedbackSuccessBtn) {
        closeFeedbackSuccessBtn.addEventListener('click', closeSuccessModal);
    }

    feedbackModal.addEventListener('click', (e) => {
        // Jika sudah selesai mengisi, izinkan klik di luar area modal untuk menutup
        if (feedbackSuccess && feedbackSuccess.style.display === 'block') {
            const rect = feedbackModal.getBoundingClientRect();
            if (
                e.clientX < rect.left || e.clientX > rect.right ||
                e.clientY < rect.top || e.clientY > rect.bottom
            ) {
                closeSuccessModal();
            }
        }
    });

    feedbackModal.addEventListener('close', () => {
        if (autoCloseTimer) {
            clearTimeout(autoCloseTimer);
            autoCloseTimer = null;
        }
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
    });

    feedbackModal.addEventListener('cancel', (e) => {
        // Jika sudah selesai submit, izinkan tutup via tombol Escape
        if (feedbackSuccess && feedbackSuccess.style.display === 'block') {
            closeSuccessModal();
            return;
        }
        e.preventDefault();
    });

    // Pilihan chip untuk Pertanyaan 1 & 2
    document.querySelectorAll('.feedback-chips').forEach((container) => {
        const questionKey = container.getAttribute('data-question');
        const chips = container.querySelectorAll('.feedback-chip');
        chips.forEach((chip) => {
            chip.addEventListener('click', () => {
                chips.forEach((c) => c.classList.remove('active'));
                chip.classList.add('active');
                feedbackState[questionKey] = chip.getAttribute('data-value');
                checkFormValidity();
            });
        });
    });

    // Pilihan emoji rating untuk Pertanyaan 3
    const ratingContainer = document.querySelector('.feedback-rating');
    if (ratingContainer) {
        const ratingButtons = ratingContainer.querySelectorAll('.rating-btn');
        ratingButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                ratingButtons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                feedbackState.rating = btn.getAttribute('data-value');
                checkFormValidity();
            });
        });
    }

    function checkFormValidity() {
        const isValid = Boolean(feedbackState.manualTime && feedbackState.webTime && feedbackState.rating);
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (!feedbackState.manualTime || !feedbackState.webTime || !feedbackState.rating) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Mengirim jawaban…</span>';

            const payload = {
                timestamp: new Date().toISOString(),
                manualTime: feedbackState.manualTime,
                webTime: feedbackState.webTime,
                rating: feedbackState.rating
            };

            try {
                if (GOOGLE_SCRIPT_FEEDBACK_URL && GOOGLE_SCRIPT_FEEDBACK_URL.trim() !== '') {
                    await fetch(GOOGLE_SCRIPT_FEEDBACK_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    console.info('[Feedback JKEM] Payload tersimpan lokal (URL belum diisi di GOOGLE_SCRIPT_FEEDBACK_URL):', payload);
                }
            } catch (err) {
                console.error('[Feedback JKEM] Gagal mengirim data:', err);
            }

            // Simpan status di localStorage agar tidak meminta kembali
            localStorage.setItem('jkem_feedback_submitted', 'true');

            if (feedbackForm) feedbackForm.style.display = 'none';
            if (feedbackSuccess) feedbackSuccess.style.display = 'block';

            // Auto-close selama 15 detik memberi waktu santai bagi user membaca pesan
            autoCloseTimer = setTimeout(() => {
                closeSuccessModal();
            }, 15000);
        });
    }
}

function triggerFeedbackModal() {
    if (localStorage.getItem('jkem_feedback_submitted') === 'true') {
        return;
    }
    if (sessionStorage.getItem('jkem_feedback_dismissed') === 'true') {
        return;
    }

    const feedbackModal = document.getElementById('feedbackModal');
    if (!feedbackModal) return;

    setTimeout(() => {
        const promoModal = document.getElementById('promoModal');
        if (promoModal && promoModal.open) {
            return;
        }
        feedbackModal.showModal();
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
    }, 1800);
}

function switchTab(os) {
    document.querySelectorAll('.tab-btn').forEach((button) => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-content').forEach((content) => {
        content.classList.remove('active');
    });

    const isWindows = os === 'win';
    const tabClass = isWindows ? 'windows' : 'mac';
    const activeButton = document.querySelector(`.tab-btn.${tabClass}`);

    activeButton.classList.add('active');
    activeButton.setAttribute('aria-selected', 'true');
    document.getElementById(`content-${os}`).classList.add('active');
}

function bukaSumberData() {
    const targetUrl = "https://sipbpm.unhas.ac.id/logbook-list?draw=1&columns%5B0%5D%5Bdata%5D=&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=judul&columns%5B1%5D%5Bname%5D=judul&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=deskripsi&columns%5B2%5D%5Bname%5D=deskripsi&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=tanggal&columns%5B3%5D%5Bname%5D=tanggal&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=status&columns%5B4%5D%5Bname%5D=status&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=foto&columns%5B5%5D%5Bname%5D=foto&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bname%5D=foto&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=actions&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&length=10000&search%5Bvalue%5D=&search%5Bregex%5D=false&_=" + Date.now();
    window.open(targetUrl, '_blank');
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[character]));
}

function formatTanggal(value) {
    const normalized = String(value).replace(/\s+/g, ' ').trim();
    const parts = normalized.match(/^(.*?)(?:\s*Jam:\s*)(.*?)(?:\s+JKEM:\s*(.*))?$/i);

    if (!parts) {
        return escapeHtml(normalized);
    }

    const tanggal = parts[1].trim();
    const waktu = parts[2].trim();
    const jkem = parts[3] ? parts[3].trim() : '';
    const jkemHtml = jkem
        ? `<span class="date-separator">·</span><span>JKEM: ${escapeHtml(jkem)}</span>`
        : '';

    return `<div class="date-cell"><span>${escapeHtml(tanggal)}</span><span class="date-separator">·</span><span>Jam: ${escapeHtml(waktu)}</span>${jkemHtml}</div>`;
}

function getApprovalType(item) {
    const rawStatus = [
        item.status,
        item.status_persetujuan,
        item.approval_status,
        item.status_approval,
        item.approved
    ].find((value) => value !== undefined && value !== null && value !== '');

    const status = String(rawStatus ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;|&amp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();

    if (/belum\s*disetujui|tidak\s*disetujui|menunggu|pending|diajukan|proses/.test(status)) {
        return 'pending';
    }

    if (/tolak|ditolak|reject|revisi|perbaikan/.test(status)) {
        return 'rejected';
    }

    if (/dierima|diterima|disetujui|disetuj|approve|approved|terima|^1$|^true$/.test(status)) {
        return 'approved';
    }

    return 'pending';
}

function getStatusLabel(type) {
    return {
        approved: 'Disetujui',
        rejected: 'Perlu diperbaiki',
        pending: 'Belum disetujui'
    }[type];
}

function prosesData() {
    let inputRaw = document.getElementById('jsonInput').value.trim();
    const errorDiv = document.getElementById('errorMessage');
    const dashboard = document.getElementById('dashboard');
    const tableSection = document.getElementById('tableSection');

    errorDiv.style.display = 'none';

    if (!inputRaw) {
        errorDiv.textContent = 'Belum ada data. Tempelkan JSON logbook terlebih dahulu.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const startJson = inputRaw.indexOf('{');
        const endJson = inputRaw.lastIndexOf('}');

        if (startJson !== -1 && endJson !== -1) {
            inputRaw = inputRaw.substring(startJson, endJson + 1);
        }

        const parsedData = JSON.parse(inputRaw);
        const items = parsedData.data || [];

        if (!Array.isArray(items)) {
            throw new Error('Data bukan array yang valid.');
        }

        let totalJKEM = 0;
        let approvedJKEM = 0;
        let pendingJKEM = 0;
        let countMatched = 0;
        let approvedCount = 0;
        let pendingCount = 0;
        let tableRowsHtml = '';

        items.forEach((item, index) => {
            const judul = item.judul || '-';
            const tanggalStr = item.tanggal || '-';
            const match = tanggalStr.match(/JKEM:\s*([\d.]+)/);
            const approvalType = getApprovalType(item);
            const statusLabel = getStatusLabel(approvalType);
            const statusHtml = `<span class="status-badge status-${approvalType}">${statusLabel}</span>`;
            let nilaiJkem = 0;
            let badgeHtml = '<span class="badge badge-empty">0.00</span>';

            if (match) {
                nilaiJkem = parseFloat(match[1]);
                totalJKEM += nilaiJkem;
                countMatched++;
                if (approvalType === 'approved') {
                    approvedJKEM += nilaiJkem;
                    approvedCount++;
                } else {
                    pendingJKEM += nilaiJkem;
                    pendingCount++;
                }
                badgeHtml = `<span class="badge badge-jkem">+ ${nilaiJkem.toFixed(2)}</span>`;
            }

            tableRowsHtml += `<tr><td>${index + 1}</td><td><b>${escapeHtml(judul)}</b></td><td>${formatTanggal(tanggalStr)}</td><td>${statusHtml}</td><td>${badgeHtml}</td></tr>`;
        });

        document.getElementById('totalLogbook').innerText = items.length;
        document.getElementById('totalValidJkem').innerText = countMatched;
        document.getElementById('grandTotalJkem').innerText = totalJKEM.toFixed(2);
        const targetJKEM = 180;
        const remainingJKEM = Math.max(targetJKEM - approvedJKEM, 0);
        const progress = Math.min((approvedJKEM / targetJKEM) * 100, 100);
        const approvalSummary = document.getElementById('approvalSummary');
        document.getElementById('approvedJkem').innerText = `${approvedJKEM.toFixed(2)} jam`;
        document.getElementById('pendingJkem').innerText = `${pendingJKEM.toFixed(2)} jam`;
        document.getElementById('approvedCount').innerText = `${approvedCount} logbook`;
        document.getElementById('pendingCount').innerText = `${pendingCount} logbook`;
        document.getElementById('targetJkem').innerText = `${targetJKEM.toFixed(2)} jam`;
        document.getElementById('remainingJkem').innerText = `${remainingJKEM.toFixed(2)} jam`;
        document.getElementById('approvalStatus').innerText = remainingJKEM > 0 ? 'Belum mencapai target' : 'Target tercapai';
        document.getElementById('approvalProgress').style.width = `${progress}%`;
        document.getElementById('tableBody').innerHTML = tableRowsHtml;

        dashboard.style.display = 'grid';
        approvalSummary.style.display = 'block';
        tableSection.style.display = 'block';
        dashboard.scrollIntoView({ behavior: 'smooth' });

        triggerFeedbackModal();
    } catch (error) {
        errorDiv.textContent = 'Data belum terbaca. Pastikan seluruh teks JSON dari halaman logbook sudah disalin, lalu coba lagi.';
        errorDiv.style.display = 'block';
        dashboard.style.display = 'none';
        document.getElementById('approvalSummary').style.display = 'none';
        tableSection.style.display = 'none';
        console.error(error);
    }
}

// Fungsi dipanggil oleh tombol HTML, sehingga tetap diekspos saat file dibundel sebagai modul.
window.switchTab = switchTab;
window.bukaSumberData = bukaSumberData;
window.prosesData = prosesData;
