const { jsPDF } = window.jspdf;

function showForm(formId) {
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        if (form.id === formId) {
            form.style.display = 'block';
            if (formId === 'form2') {
                initializeMapPicker();
            }
        } else {
            form.style.display = 'none';
        }
    });
}

function hideForm(formId) {
    document.getElementById(formId).style.display = 'none';
}

async function printPDF(formId) {
    const form = document.getElementById(formId);
    const pdf = new jsPDF();
    const formData = new FormData(form);
    let yPosition = 20;

    pdf.text(form.querySelector('h2').textContent, 10, yPosition);
    yPosition += 10;

    for (let [key, value] of formData.entries()) {
        const label = getLabelByKey(form, key);
        if (value instanceof File && value.type.startsWith('image/')) {
            const base64Image = await convertImageToBase64(value);
            pdf.addImage(base64Image, 'JPEG', 10, yPosition, 50, 50);
            yPosition += 60;
        } else {
            pdf.text(`${label}: ${value}`, 10, yPosition);
            yPosition += 10;
        }
    }

    pdf.save(`${formId}.pdf`);
}

function getLabelByKey(form, key) {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) {
        const label = input.closest('label');
        if (label) {
            return label.textContent.trim();
        } else {
            const previousSibling = input.previousElementSibling;
            if (previousSibling && previousSibling.tagName === 'LABEL') {
                return previousSibling.textContent.trim();
            }
        }
    }
    return key;
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

let mapPicker;
let marker;

function initializeMapPicker() {
    if (mapPicker) return;

    mapPicker = L.map('map-picker').setView([-3, 119], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(mapPicker);

    const lokasiInput = document.getElementById('lokasi');

    mapPicker.on('click', (e) => {
        const { lat, lng } = e.latlng;
        lokasiInput.value = `${lat} ${lng}`;
        if (marker) mapPicker.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(mapPicker);
    });
}
