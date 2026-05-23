// DOM Elementlarini tanlab olish
const debtForm = document.getElementById('debtForm');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const debtList = document.getElementById('debtList');
const totalAmountEl = document.getElementById('totalAmount');
const searchInput = document.getElementById('search');

// LocalStorage'dan ma'lumotlarni o'qish yoki bo'sh massiv olish
let debts = JSON.parse(localStorage.getItem('debts')) || [];

// Raqamlarni chiroyli formatda chiqarish (masalan: 100 000)
function formatMoney(amount) {
    return Number(amount).toLocaleString('uz-UZ') + ' UZS';
}

// Umumiy summani hisoblash va yangilash
function updateSummary() {
    const total = debts.reduce((sum, item) => sum + Number(item.amount), 0);
    totalAmountEl.textContent = formatMoney(total);
}

// Xavfsizlik uchun (HTML Injection oldini olish) - TO'G'RILANDI
function escapeHTML(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Qarzlar ro'yxatini ekranga chizish
function renderDebts(filterText = '') {
    debtList.innerHTML = '';

    const filteredDebts = debts.filter(item => 
        item.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredDebts.length === 0) {
        debtList.innerHTML = `<li class="empty-msg">Hech qanday qarz topilmadi.</li>`;
        return;
    }

    filteredDebts.forEach(debt => {
        const li = document.createElement('li');
        li.className = 'debt-item';
        li.innerHTML = `
            <div class="debt-info">
                <div class="debt-name">${escapeHTML(debt.name)}</div>
                <div class="debt-date">${debt.date}</div>
            </div>
            <div class="debt-actions">
                <div class="debt-amount">${formatMoney(debt.amount)}</div>
                <button class="btn-delete" onclick="deleteDebt('${debt.id}')" title="O'chirish">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        debtList.appendChild(li);
    });
}

// Qarz qo'shish hodisasi - TO'G'RILANDI
debtForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();

    if (!name || !amount) return;

    // Hozirgi sanani olish
    const now = new Date();
    const dateString = now.toLocaleDateString('uz-UZ') + ' ' + now.toLocaleTimeString('uz-UZ', {hour: '2-digit', minute:'2-digit'});

    const newDebt = {
        id: Date.now().toString(),
        name: name,
        amount: parseFloat(amount),
        date: dateString
    };

    debts.push(newDebt);
    saveData();
    
    // Formani tozalash
    debtForm.reset();
    nameInput.focus();
});

// Qarzni o'chirish funksiyasi
function deleteDebt(id) {
    debts = debts.filter(item => item.id !== id);
    saveData();
}

// Qidiruv tizimi
searchInput.addEventListener('input', (e) => {
    renderDebts(e.target.value);
});

// Ma'lumotlarni saqlash va yangilash
function saveData() {
    localStorage.setItem('debts', JSON.stringify(debts));
    renderDebts(searchInput.value);
    updateSummary();
}

// Dasturni ilk bor ishga tushirish
updateSummary();
renderDebts();