document.addEventListener('DOMContentLoaded', () => {
    const debtForm = document.getElementById('debtForm');
    const nameInput = document.getElementById('name');
    const amountInput = document.getElementById('amount');
    const debtList = document.getElementById('debtList');
    const trashList = document.getElementById('trashList');
    const totalAmountDisplay = document.getElementById('totalAmount');
    const searchInput = document.getElementById('search');
    const exportBtn = document.getElementById('exportBtn');

    let debts = JSON.parse(localStorage.getItem('debts')) || [];
    let trash = JSON.parse(localStorage.getItem('trash')) || [];

    // Formani yuborish
    debtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);

        // Ismda faqat harf bo'lishini tekshirish (ixtiyoriy)
        if (!/^[a-zA-Z\s'ʻʼ]+$/.test(name)) {
            alert("Iltimos, ismga faqat harf yozing!");
            return;
        }

        const newDebt = {
            id: Date.now(),
            name: name,
            amount: amount,
            date: new Date().toLocaleDateString(),
        };

        debts.push(newDebt);
        saveAndRender();
        debtForm.reset();
    });

    // O'chirish (Korzinkaga o'tkazish)
    window.moveToTrash = (id) => {
        const itemIndex = debts.findIndex(d => d.id === id);
        const item = debts.splice(itemIndex, 1)[0];
        trash.push(item);
        saveAndRender();
    };

    // Qayta tiklash
    window.restoreDebt = (id) => {
        const itemIndex = trash.findIndex(t => t.id === id);
        const item = trash.splice(itemIndex, 1)[0];
        debts.push(item);
        saveAndRender();
    };

    // Butunlay o'chirish
    window.permanentlyDelete = (id) => {
        trash = trash.filter(t => t.id !== id);
        saveAndRender();
    };

    // Qidiruv
    searchInput.addEventListener('input', () => {
        render();
    });

    // Excel (CSV) yuklab olish funksiyasi
    exportBtn.addEventListener('click', () => {
        if (debts.length === 0) {
            alert("Eksport qilish uchun ma'lumot topilmadi!");
            return;
        }

        // Excelda o'zbekcha harflar (o', g') to'g'ri chiqishi uchun BOM (\ufeff) qo'shiladi
        let csvContent = "\ufeff"; 
        csvContent += "Ism,Summa (UZS),Qo'shilgan sana\n";

        debts.forEach(debt => {
            const name = `"${debt.name.replace(/"/g, '""')}"`; // Ism ichida vergul bo'lsa xato bo'lmasligi uchun
            csvContent += `${name},${debt.amount},${debt.date}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `qarzlar_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    function saveAndRender() {
        localStorage.setItem('debts', JSON.stringify(debts));
        localStorage.setItem('trash', JSON.stringify(trash));
        render();
    }

    function render() {
        const searchTerm = searchInput.value.toLowerCase();
        
        // Ro'yxatni tozalash
        debtList.innerHTML = '';
        trashList.innerHTML = '';

        let total = 0;

        // Qarzdorlarni chiqarish
        debts.filter(d => d.name.toLowerCase().includes(searchTerm)).forEach(debt => {
            total += debt.amount;

            debtList.innerHTML += `
                <li class="debt-item">
                    <div class="debt-info">
                        <b>${debt.name}</b>
                        <span>${debt.amount.toLocaleString()} UZS | Qo'shilgan: ${debt.date}</span>
                    </div>
                    <div class="actions">
                        <button class="btn-delete" onclick="moveToTrash(${debt.id})"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </li>
            `;
        });

        // Korzinkani chiqarish
        trash.forEach(item => {
            trashList.innerHTML += `
                <div class="debt-item trash-item">
                    <div class="debt-info">
                        <b>${item.name}</b>
                        <span>${item.amount.toLocaleString()} UZS</span>
                    </div>
                    <div class="actions">
                        <button class="btn-restore" onclick="restoreDebt(${item.id})"><i class="fa-solid fa-rotate-left"></i></button>
                        <button class="btn-delete" onclick="permanentlyDelete(${item.id})"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                </div>
            `;
        });

        totalAmountDisplay.innerText = `${total.toLocaleString()} UZS`;
    }

    render(); // Birinchi marta yuklanganda
});