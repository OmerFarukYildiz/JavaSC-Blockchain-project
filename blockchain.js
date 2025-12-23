/* =========================================
   JS P2P BLOCKCHAIN - TAM SÜRÜM (FULL + STATS + CHART)
   ========================================= */

// --- YARDIMCI FONKSİYONLAR ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const nodeId = generateId();
document.getElementById('nodeIdDisplay').innerText = nodeId;

const log = (msg, type = 'info') => {
    const term = document.getElementById('terminal');
    if (!term) return;
    const time = new Date().toLocaleTimeString();
    let colorClass = 'log-info';
    if (type === 'success') colorClass = 'log-success';
    if (type === 'error') colorClass = 'log-error';
    if (type === 'p2p') colorClass = 'log-p2p';
    term.innerHTML += `<div class="log-entry"><span class="log-time">[${time}]</span> <span class="${colorClass}">${msg}</span></div>`;
    term.scrollTop = term.scrollHeight;
};

// --- SES EFEKTLERİ MOTORU (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') { audioCtx.resume(); }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'coin') { // 💰 Para Sesi
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
    else if (type === 'success') { // ✨ Başarı / Madencilik Bitti
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // Do
        osc.frequency.setValueAtTime(659.25, now + 0.1); // Mi
        osc.frequency.setValueAtTime(783.99, now + 0.2); // Sol
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
    else if (type === 'error') { // 🚨 Hata / Hack
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

// --- GÜVENLİK & CÜZDAN YÖNETİMİ ---
let myWalletId = null;
let myPrivateKey = null;

// --- MARKET SİMÜLASYONU & GRAFİK ---
let marketPrice = 100.00;
let lastPrice = 100.00;
let priceChart = null; // Grafik nesnesi

function initPriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // Gradient Renk (Yeşil dolgu)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(46, 160, 67, 0.5)');
    gradient.addColorStop(1, 'rgba(46, 160, 67, 0.0)');

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Zaman etiketleri buraya gelecek
            datasets: [{
                label: 'Coin Price ($)',
                data: [], // Fiyatlar buraya gelecek
                borderColor: '#2ea043',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0, // Noktaları gizle
                pointHoverRadius: 4,
                fill: true,
                tension: 0.4 // Çizgiyi yumuşat
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { display: false }, // X eksenini gizle (temiz görünüm)
                y: {
                    grid: { color: '#30363d' },
                    ticks: { color: '#8b949e' }
                }
            },
            animation: { duration: 1000 }
        }
    });

    // İlk değeri ekle
    addDataToChart(marketPrice);
}

function addDataToChart(price) {
    if (!priceChart) return;

    const now = new Date().toLocaleTimeString();
    priceChart.data.labels.push(now);
    priceChart.data.datasets[0].data.push(price);

    // Son 30 veriyi tut, gerisini sil (Performans için)
    if (priceChart.data.labels.length > 30) {
        priceChart.data.labels.shift();
        priceChart.data.datasets[0].data.shift();
    }
    priceChart.update();
}

function loadMarketData() {
    const storedPrice = localStorage.getItem('marketPrice');
    if (storedPrice) {
        marketPrice = parseFloat(storedPrice);
        lastPrice = marketPrice;
    }
    updateTickerUI(0);
}

function updateMarketPrice(action) {
    lastPrice = marketPrice;
    let change = 0;
    switch (action) {
        case 'MINE': change = (Math.random() * 5) + 1; break; // +$1 ile +$5
        case 'TX': change = (Math.random() * 2); break; // +$0 ile +$2
        case 'HACK': change = -(marketPrice * 0.20); break; // %20 Çöküş
        case 'RESET': marketPrice = 100.00; change = 0; break;
    }
    marketPrice += change;
    if (marketPrice < 0.01) marketPrice = 0.01;
    localStorage.setItem('marketPrice', marketPrice.toFixed(2));

    updateTickerUI(change);
    addDataToChart(marketPrice); // <--- Grafiği Güncelle
}

function updateTickerUI(change) {
    const display = document.getElementById('marketPriceDisplay');
    const changeDisplay = document.getElementById('marketChange');
    if (!display) return;

    display.innerText = `$${marketPrice.toFixed(2)}`;
    const percent = lastPrice > 0 ? ((marketPrice - lastPrice) / lastPrice) * 100 : 0;

    if (change > 0) {
        display.className = "price-up";
        changeDisplay.innerText = `(▲ ${percent.toFixed(2)}%)`;
        changeDisplay.style.color = "#2ea043";
    } else if (change < 0) {
        display.className = "price-down";
        changeDisplay.innerText = `(▼ ${Math.abs(percent).toFixed(2)}%)`;
        changeDisplay.style.color = "#da3633";
    } else {
        display.className = "";
        changeDisplay.innerText = `(0.00%)`;
        changeDisplay.style.color = "#888";
    }
    setTimeout(() => { display.className = ""; }, 1000);
}

// Cüzdan Fonksiyonları
function loadOrGenerateWallet() {
    const storedPriv = localStorage.getItem('myPrivateKey');
    const storedPub = localStorage.getItem('myWalletId');
    if (storedPriv && storedPub) {
        myPrivateKey = storedPriv;
        myWalletId = storedPub;
    } else {
        generateNewWallet(false);
        return;
    }
    updateWalletUI();
}

function generateNewWallet(save = true) {
    const randomPart = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    myPrivateKey = "Priv_" + CryptoJS.SHA256(randomPart).toString().substring(0, 32);
    const derivedHash = CryptoJS.SHA256(myPrivateKey).toString();
    myWalletId = "Wallet_" + derivedHash.substring(0, 10).toUpperCase();

    if (save) {
        localStorage.setItem('myPrivateKey', myPrivateKey);
        localStorage.setItem('myWalletId', myWalletId);
        log('🔐 Yeni Kimlik Oluşturuldu.', 'info');
    }
    updateWalletUI();
    updateUI();
}

function updateWalletUI() {
    const walletInput = document.getElementById('myWalletAddress');
    const privateInput = document.getElementById('myPrivateKey');
    if (walletInput) walletInput.value = myWalletId;
    if (privateInput) privateInput.value = myPrivateKey;
}

// --- BLOCKCHAIN SINIFLARI ---

class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return CryptoJS.SHA256(
            this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }

    async mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        const batchSize = 500;

        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
            if (this.nonce % batchSize === 0) {
                const hashRateElem = document.getElementById('hashRate');
                if (hashRateElem) hashRateElem.innerText = `Nonce: ${this.nonce}`;
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        log(`Blok kazıldı! Hash: ${this.hash}`, 'success');
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 10;
        this.gasFee = 3;
        this.loadFromStorage();
    }

    createGenesisBlock() {
        return new Block(0, 1704067200000, ["Genesis Block"], "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    saveToStorage() {
        localStorage.setItem('blockchain_chain', JSON.stringify(this.chain));
        localStorage.setItem('blockchain_pending', JSON.stringify(this.pendingTransactions));
    }

    loadFromStorage() {
        if (localStorage.getItem('blockchain_chain')) {
            const storedChain = JSON.parse(localStorage.getItem('blockchain_chain'));
            this.chain = storedChain.map(b => {
                const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash);
                block.nonce = b.nonce;
                block.hash = b.hash;
                return block;
            });
            if (localStorage.getItem('blockchain_pending')) {
                this.pendingTransactions = JSON.parse(localStorage.getItem('blockchain_pending'));
            }
            log('💾 Veriler yüklendi.', 'info');
        }
    }

    addTransaction(transaction) {
        if (!transaction.from || !transaction.to) {
            alert('Eksik bilgi.');
            return false;
        }

        // 1. Mevcut cüzdan bakiyesini al
        const currentBalance = this.getBalanceOfAddress(transaction.from);

        // 2. ŞU AN HAVUZDA BEKLEYEN harcamaları hesapla
        let pendingSpend = 0;
        this.pendingTransactions.forEach(tx => {
            if (tx.from === transaction.from) {
                pendingSpend += tx.amount;
                if (tx.fee) pendingSpend += tx.fee; // Gas fee'yi de hesaba kat
            }
        });

        // 3. Toplam Maliyet (Gönderilecek + Gas Fee)
        const totalCost = transaction.amount + this.gasFee;

        // 4. KRİTİK KONTROL: (Mevcut Bakiye) - (Havuzdakiler) yetiyor mu?
        // Yani: Cebindeki paradan, söz verdiğin paraları çıkar, kalan buna yeter mi?
        if ((currentBalance - pendingSpend) < totalCost) {
            playSound('error');
            alert(`Yetersiz Bakiye!\n\nCüzdan: ${currentBalance}\nHavuzda Bekleyen: -${pendingSpend}\nKalan Kullanılabilir: ${currentBalance - pendingSpend}\n\nGerekli: ${totalCost}`);
            return false;
        }

        if (!this.verifySignature(transaction)) {
            playSound('error');
            log('🚨 HATA: Geçersiz İmza!', 'error');
            alert("İmza geçersiz!");
            return false;
        }

        transaction.fee = this.gasFee;
        this.pendingTransactions.push(transaction);
        this.saveToStorage();
        updateMarketPrice('TX');
        playSound('coin');

        // UI Güncellemeleri
        updateStatsDashboard(); // Sayacı artır
        updatePendingListUI();  // Listeyi güncelle

        return true;
    }

    verifySignature(tx) {
        if (tx.from === "SİSTEM") return true;
        const derivedAddress = "Wallet_" + CryptoJS.SHA256(tx.signature).toString().substring(0, 10).toUpperCase();
        return derivedAddress === tx.from;
    }

    async minePendingTransactions(minerAddress, difficulty) {
        let totalFees = 0;
        this.pendingTransactions.forEach(tx => {
            if (tx.fee) totalFees += tx.fee;
        });

        const totalReward = this.miningReward + totalFees;

        const rewardTx = {
            from: "SİSTEM",
            to: minerAddress,
            amount: totalReward,
            note: "Madencilik Ödülü"
        };

        let blockTransactions = [...this.pendingTransactions, rewardTx];

        let latestBlock = this.getLatestBlock();
        let newBlock = new Block(
            latestBlock.index + 1,
            Date.now(),
            blockTransactions,
            latestBlock.hash
        );

        await newBlock.mineBlock(difficulty);
        this.chain.push(newBlock);
        this.pendingTransactions = [];
        this.saveToStorage();

        updateMarketPrice('MINE');
        return newBlock;
    }

    addBlockFromNetwork(newBlock) {
        const latestBlock = this.getLatestBlock();
        if (newBlock.previousHash !== latestBlock.hash) return false;
        this.chain.push(newBlock);
        this.pendingTransactions = [];
        this.saveToStorage();
        updateMarketPrice('MINE');
        return true;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }

    replaceChain(newChainData) {
        if (newChainData.length <= this.chain.length) return;
        this.chain = newChainData.map(b => {
            const block = new Block(b.index, b.timestamp, b.transactions, b.previousHash);
            block.nonce = b.nonce;
            block.hash = b.hash;
            return block;
        });
        this.pendingTransactions = [];
        this.saveToStorage();
        log('Zincir senkronize edildi.', 'p2p');
        updateUI();
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            const txs = Array.isArray(block.transactions) ? block.transactions : [];
            for (const tx of txs) {
                if (typeof tx === 'string') continue;
                if (tx.from === address) {
                    balance -= tx.amount;
                    if (tx.fee) balance -= tx.fee;
                }
                if (tx.to === address) {
                    balance += tx.amount;
                }
            }
        }
        return balance;
    }
}

// --- GLOBAL DEĞİŞKENLER ---
let myBlockchain = new Blockchain();
let isMining = false;

loadOrGenerateWallet();
loadMarketData();
initPriceChart(); // <--- GRAFİĞİ BAŞLAT

// --- UI ETKİLEŞİMLERİ ---

function createTransaction() {
    const receiver = document.getElementById('receiverWallet').value;
    const amountVal = document.getElementById('amount').value;
    const amount = parseInt(amountVal);

    if (receiver === "" || amountVal === "" || isNaN(amount) || amount <= 0) {
        playSound('error');
        alert("Geçerli veri giriniz!");
        return;
    }

    const tx = {
        from: myWalletId,
        to: receiver,
        amount: amount,
        note: "Transfer",
        signature: myPrivateKey
    };

    if (myBlockchain.addTransaction(tx)) {
        log(`⛽ İşlem (+3 Gas) havuza eklendi.`, 'info');
        updatePendingListUI();
        document.getElementById('receiverWallet').value = "";
        document.getElementById('amount').value = "";
    }
}

async function minePendingTransactions() {
    if (isMining) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    const btn = document.getElementById('mineBtn');
    const status = document.getElementById('miningStatus');
    const diffInput = document.getElementById('difficulty');
    const difficulty = parseInt(diffInput.value);

    isMining = true;
    btn.disabled = true;
    if (document.getElementById('addTxBtn')) document.getElementById('addTxBtn').disabled = true;
    status.style.display = 'block';

    log(`Madencilik başladı...`, 'info');
    await new Promise(r => setTimeout(r, 100));

    const newBlock = await myBlockchain.minePendingTransactions(myWalletId, difficulty);

    p2pChannel.postMessage({
        type: MSG_TYPES.NEW_BLOCK,
        payload: newBlock,
        sender: nodeId
    });

    log(`Blok #${newBlock.index} kazıldı!`, 'success');
    playSound('success');

    updateUI();
    updatePendingListUI();

    isMining = false;
    btn.disabled = false;
    if (document.getElementById('addTxBtn')) document.getElementById('addTxBtn').disabled = false;
    status.style.display = 'none';
}

function resetChain() {
    if (confirm("DİKKAT: Her şey silinecek! Onaylıyor musun?")) {
        p2pChannel.postMessage({ type: MSG_TYPES.RESET_NETWORK, sender: nodeId });
        performReset();
    }
}

function performReset() {
    localStorage.clear();
    location.reload();
}

// --- EXPLORER & UI ---

function updatePendingListUI() {
    const list = document.getElementById('pendingList');
    if (!list) return;
    list.innerHTML = "";

    if (myBlockchain.pendingTransactions.length === 0) {
        list.innerHTML = '<li style="color:#555; font-style:italic;">Havuz boş...</li>';
        return;
    }

    myBlockchain.pendingTransactions.forEach((tx) => {
        const li = document.createElement('li');
        li.style.color = "#d29922";
        const feeInfo = tx.fee ? `(+${tx.fee} Fee)` : '';
        li.innerHTML = `⏳ <b>${tx.amount} Coin</b> ${feeInfo} -> ${tx.to.substring(0, 8)}...`;
        list.appendChild(li);
    });
}

function updateLedgerUI() {
    const ledgerDiv = document.getElementById('ledgerList');
    if (!ledgerDiv) return;
    ledgerDiv.innerHTML = "";

    const allWallets = {};
    myBlockchain.chain.forEach(block => {
        const txs = Array.isArray(block.transactions) ? block.transactions : [];
        txs.forEach(tx => {
            if (typeof tx === 'string') return;
            if (tx.from !== "SİSTEM") {
                if (!allWallets[tx.from]) allWallets[tx.from] = 0;
                allWallets[tx.from] -= tx.amount;
                if (tx.fee) allWallets[tx.from] -= tx.fee;
            }
            if (!allWallets[tx.to]) allWallets[tx.to] = 0;
            allWallets[tx.to] += tx.amount;
        });
    });

    const sortedWallets = Object.keys(allWallets)
        .map(wallet => { return { id: wallet, balance: allWallets[wallet] }; })
        .sort((a, b) => b.balance - a.balance);

    if (sortedWallets.length === 0) {
        ledgerDiv.innerHTML = '<span style="color:#555; font-style:italic;">Henüz işlem yok...</span>';
        return;
    }

    sortedWallets.forEach(w => {
        if (w.balance === 0) return;
        const isMe = w.id === myWalletId;
        const color = isMe ? "#2ea043" : "#58a6ff";

        const item = document.createElement('div');
        item.style.borderBottom = "1px solid #30363d";
        item.style.padding = "4px 0";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";

        item.innerHTML = `
            <span style="color:${color}; font-family:monospace;">${w.id.substring(0, 12)}...${isMe ? "(Ben)" : ""}</span>
            <span style="font-weight:bold; color:#fff;">${w.balance} 💰</span>
        `;
        ledgerDiv.appendChild(item);
    });
}

function updateUI() {
    const container = document.getElementById('chainContainer');
    if (container) {
        container.innerHTML = '';
        myBlockchain.chain.forEach((block, index) => {
            const isGenesis = index === 0;
            const truncHash = str => str.substring(0, 15) + '...';
            const timeStr = new Date(block.timestamp).toLocaleTimeString();

            let txHtml = "";
            if (Array.isArray(block.transactions)) {
                block.transactions.forEach(tx => {
                    if (typeof tx === 'string') {
                        txHtml += `<div style="color:#888; font-style:italic;">${tx}</div>`;
                    } else {
                        const icon = tx.from === 'SİSTEM' ? '🏆' : '💸';
                        const from = tx.from === 'SİSTEM' ? 'SİSTEM' : tx.from.substring(0, 8) + '...';
                        const to = tx.to === myWalletId ? 'Ben' : tx.to.substring(0, 8) + '...';
                        const feeText = tx.fee ? `<span style="color:#da3633; font-size:0.7em;">(+${tx.fee} Fee)</span>` : '';

                        txHtml += `<div style="border-bottom:1px solid #444; padding:2px; font-size:0.75rem;">${icon} ${from} ➔ ${to} : <b>${tx.amount}</b> ${feeText}</div>`;
                    }
                });
            } else {
                txHtml = block.transactions;
            }

            const div = document.createElement('div');
            div.className = `block-card ${isGenesis ? 'genesis' : ''}`;

            div.innerHTML = `
                <div style="font-weight:bold; color:white; margin-bottom:5px;">
                    ${isGenesis ? 'GENESIS' : 'BLOCK #' + block.index}
                </div>
                <div><span class=\"lbl\">Zaman:</span> ${timeStr}</div>
                <div style="margin: 5px 0; background:#2d333b; padding:5px; border-radius:3px; max-height:100px; overflow-y:auto;">
                    ${txHtml}
                </div>
                <div style="margin-top:5px;">
                    <span class=\"lbl\">Hash:</span> <span class=\"hash-text\">${truncHash(block.hash)}</span>
                </div>
            `;
            container.appendChild(div);
        });
    }

    const balance = myBlockchain.getBalanceOfAddress(myWalletId);
    const walletLabel = document.querySelector('.wallet-box .lbl');
    if (walletLabel) walletLabel.innerHTML = `Genel Adres (Public Key) - Bakiye: <span style="color:#fff;">${balance} Coin</span>`;

    updateLedgerUI();
    updateStatsDashboard();
}

function updateStatsDashboard() {
    const totalBlocks = myBlockchain.chain.length;
    const statTotalBlocks = document.getElementById('statTotalBlocks');
    if (statTotalBlocks) statTotalBlocks.innerText = totalBlocks;

    const pendingCount = myBlockchain.pendingTransactions.length;
    const statPending = document.getElementById('statPending');
    if (statPending) statPending.innerText = pendingCount;

    const diffElem = document.getElementById('difficulty');
    const statDiff = document.getElementById('statDifficulty');
    if (diffElem && statDiff) statDiff.innerText = diffElem.value;

    const totalCoins = totalBlocks * 10;
    const marketCap = totalCoins * marketPrice;

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    const statCap = document.getElementById('statMarketCap');
    if (statCap) statCap.innerText = formatter.format(marketCap);
}

// Explorer Fonksiyonları
function closeModal() { document.getElementById('explorerModal').style.display = "none"; }
window.onclick = function (event) {
    const modal = document.getElementById('explorerModal');
    if (event.target == modal) modal.style.display = "none";
}

function searchExplorer() {
    const query = document.getElementById('searchInput').value.trim();
    const modal = document.getElementById('explorerModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!query) return;

    modal.style.display = "block";
    body.innerHTML = "";

    if (query.startsWith("Wallet_")) {
        title.innerHTML = `👛 Cüzdan Özeti: <span style="font-size:0.8rem; color:#58a6ff">${query}</span>`;
        let historyHtml = "";
        let found = false;
        let balance = 0;

        myBlockchain.chain.forEach(block => {
            const txs = Array.isArray(block.transactions) ? block.transactions : [];
            txs.forEach(tx => {
                if (typeof tx === 'string') return;
                if (tx.to === query) {
                    balance += tx.amount;
                    historyHtml += `<div class="search-result-item"><div><span style="color:#888; font-size:0.8rem;">Blok #${block.index}</span><br>📥 <b>GELEN:</b> ${tx.from.substring(0, 10)}...</div><div class="tx-in">+${tx.amount}</div></div>`;
                    found = true;
                }
                if (tx.from === query) {
                    let totalOut = tx.amount;
                    if (tx.fee) totalOut += tx.fee;
                    balance -= totalOut;
                    historyHtml += `<div class="search-result-item"><div><span style="color:#888; font-size:0.8rem;">Blok #${block.index}</span><br>📤 <b>GİDEN:</b> ${tx.to.substring(0, 10)}...</div><div class="tx-out">-${totalOut} (Fee dahil)</div></div>`;
                    found = true;
                }
            });
        });
        const balanceHtml = `<div style="background:#21262d; padding:15px; border-radius:5px; margin-bottom:15px; text-align:center;"><span style="color:#8b949e;">Güncel Bakiye</span><br><span style="font-size:2rem; font-weight:bold; color:white;">${balance} Coin</span></div><h3>İşlem Geçmişi</h3>`;
        body.innerHTML = !found ? balanceHtml + "<p>İşlem yok.</p>" : balanceHtml + historyHtml;

    } else if (query.length > 20) {
        title.innerHTML = `📦 Blok Detayı`;
        const block = myBlockchain.chain.find(b => b.hash === query);
        if (block) {
            let txList = "";
            if (Array.isArray(block.transactions)) {
                block.transactions.forEach(tx => {
                    if (typeof tx === 'string') txList += `<div>${tx}</div>`;
                    else {
                        const feeInfo = tx.fee ? `(+${tx.fee} Fee)` : '';
                        txList += `<div style="padding:5px; border-bottom:1px solid #333;">${tx.from} ➔ ${tx.to} : <b>${tx.amount}</b> ${feeInfo}</div>`;
                    }
                });
            }
            body.innerHTML = `<div style="font-family:monospace; line-height:1.6;"><div><b>Index:</b> ${block.index}</div><div><b>Hash:</b> ${block.hash}</div><div style="margin-top:10px; background:#0d1117; padding:10px;">${txList}</div></div>`;
        } else {
            body.innerHTML = "<p>Blok bulunamadı.</p>";
        }
    } else {
        body.innerHTML = "<p>Geçersiz arama.</p>";
    }
}

// P2P
const p2pChannel = new BroadcastChannel('p2p_blockchain_net');
const MSG_TYPES = { NEW_BLOCK: 'NEW_BLOCK', REQUEST_CHAIN: 'REQUEST_CHAIN', SEND_CHAIN: 'SEND_CHAIN', RESET_NETWORK: 'RESET_NETWORK' };

p2pChannel.onmessage = (event) => {
    const { type, payload, sender } = event.data;
    if (sender === nodeId) return;
    switch (type) {
        case MSG_TYPES.NEW_BLOCK:
            const newBlock = new Block(payload.index, payload.timestamp, payload.transactions, payload.previousHash);
            newBlock.nonce = payload.nonce;
            newBlock.hash = payload.hash;
            if (myBlockchain.addBlockFromNetwork(newBlock)) {
                log(`Blok #${newBlock.index} eklendi.`, 'success');
                playSound('success');
                updateUI();
                updatePendingListUI();
            }
            break;
        case MSG_TYPES.REQUEST_CHAIN:
            p2pChannel.postMessage({ type: MSG_TYPES.SEND_CHAIN, payload: myBlockchain.chain, sender: nodeId });
            break;
        case MSG_TYPES.SEND_CHAIN:
            myBlockchain.replaceChain(payload);
            break;
        case MSG_TYPES.RESET_NETWORK:
            log('⚠️ Ağ sıfırlanıyor...', 'error');
            performReset();
            break;
    }
};

setTimeout(() => {
    if (myBlockchain.chain.length === 1) {
        log('Ağa bağlanıldı...', 'p2p');
        p2pChannel.postMessage({ type: MSG_TYPES.REQUEST_CHAIN, sender: nodeId });
    } else {
        log('Hafızadan zincir yüklendi.', 'success');
    }
}, 1000);

function validateChainUI() {
    if (myBlockchain.isChainValid()) {
        log('Zincir geçerli. ✅', 'success');
        playSound('success');
        document.querySelectorAll('.block-card').forEach(el => el.classList.remove('invalid'));
    } else {
        log('UYARI: Zincir bozuk! 🚨', 'error');
        playSound('error');
        document.querySelectorAll('.block-card').forEach(el => el.classList.add('invalid'));
    }
}

function corruptChain() {
    // 1. ADIM: Sadece sağlam olan blokları listele (Genesis bloğu hariç)
    // "Sağlam" demek: İçinde "HACKLENDİ" yazısı olmayan demektir.
    const targets = myBlockchain.chain.filter(block =>
        block.index > 0 &&
        !JSON.stringify(block.transactions).includes("HACKLENDİ")
    );

    // 2. ADIM: Eğer sağlam blok kalmadıysa uyar
    if (targets.length === 0) {
        log('⚠️ Zaten bütün ağ hacklenmiş durumda! Daha fazla bozulamaz.', 'error');
        playSound('error');
        return;
    }

    // 3. ADIM: Sadece sağlamların arasından rastgele bir tane seç
    const randomBlock = targets[Math.floor(Math.random() * targets.length)];

    // 4. ADIM: O bloğu boz
    randomBlock.transactions = ["HACKLENDİ 💀"];

    // UI Güncellemeleri
    updateMarketPrice('HACK');
    updateUI();
    log(`Blok #${randomBlock.index} saldırıya uğradı ve bozuldu!`, 'error');
    playSound('error');
}

updateUI();
updatePendingListUI();