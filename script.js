window.addEventListener('DOMContentLoaded', () => {
    if (navigator.platform && navigator.platform.toUpperCase().includes('MAC')) {
        switchTab('mac');
    }
});

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
        let countMatched = 0;
        let tableRowsHtml = '';

        items.forEach((item, index) => {
            const judul = item.judul || '-';
            const tanggalStr = item.tanggal || '-';
            const match = tanggalStr.match(/JKEM:\s*([\d.]+)/);
            let nilaiJkem = 0;
            let badgeHtml = '<span class="badge badge-empty">0.00</span>';

            if (match) {
                nilaiJkem = parseFloat(match[1]);
                totalJKEM += nilaiJkem;
                countMatched++;
                badgeHtml = `<span class="badge badge-jkem">+ ${nilaiJkem.toFixed(2)}</span>`;
            }

            tableRowsHtml += `<tr><td>${index + 1}</td><td><b>${escapeHtml(judul)}</b></td><td>${formatTanggal(tanggalStr)}</td><td>${badgeHtml}</td></tr>`;
        });

        document.getElementById('totalLogbook').innerText = items.length;
        document.getElementById('totalValidJkem').innerText = countMatched;
        document.getElementById('grandTotalJkem').innerText = totalJKEM.toFixed(2);
        document.getElementById('tableBody').innerHTML = tableRowsHtml;

        dashboard.style.display = 'grid';
        tableSection.style.display = 'block';
        dashboard.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        errorDiv.textContent = 'Data belum terbaca. Pastikan seluruh teks JSON dari halaman logbook sudah disalin, lalu coba lagi.';
        errorDiv.style.display = 'block';
        dashboard.style.display = 'none';
        tableSection.style.display = 'none';
        console.error(error);
    }
}
