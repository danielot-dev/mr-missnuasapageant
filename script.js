// ============ ADMIN CREDENTIALS ============
const ADMIN_USERNAME = "nuasa";
const ADMIN_PASSWORD = "nuasa2025";

// ============ CONTESTANTS DATA ============
let contestants = [];

// ============ SPECIAL AWARDS DATA ============
const awardCategories = [
    { id: 1, name: "Most Influential Student", icon: "fa-star-of-life", nominees: [] },
    { id: 2, name: "Most Popular Student", icon: "fa-fire", nominees: [] },
    { id: 3, name: "Best Dressed (Male)", icon: "fa-user-tie", nominees: [] },
    { id: 4, name: "Best Dressed (Female)", icon: "fa-female", nominees: [] },
    { id: 5, name: "Money Bag of the Year", icon: "fa-sack-dollar", nominees: [] },
    { id: 6, name: "Hall of Fame", icon: "fa-trophy", nominees: [] },
    { id: 7, name: "Brand of the Year", icon: "fa-building", nominees: [] },
    { id: 8, name: "Fastest Rising Brand", icon: "fa-chart-line", nominees: [] },
    { id: 9, name: "Squad of the Year", icon: "fa-users", nominees: [] },
    { id: 10, name: "Friend Group of the Year", icon: "fa-user-friends", nominees: [] },
    { id: 11, name: "Most Supportive Exco", icon: "fa-handshake", nominees: [] },
    { id: 12, name: "FYN", icon: "fa-gem", nominees: [] },
    { id: 13, name: "Fresher of the Year", icon: "fa-seedling", nominees: [] },
    { id: 14, name: "Artist of the Year", icon: "fa-microphone-alt", nominees: [] }
];

// ============ TICKET SYSTEM ============
let tickets = {
    sold: [],
    used: []
};

// ============ SESSION STATE ============
let isLoggedIn = false;
let currentSpecialNominee = null;
let currentSpecialCategory = null;

// ============ LOAD DATA ============
function loadData() {
    const savedContestants = localStorage.getItem('nuasaContestants');
    if (savedContestants) {
        contestants = JSON.parse(savedContestants);
    } else {
        contestants = [];
    }
    
    const savedTickets = localStorage.getItem('nuasaTickets');
    if (savedTickets) {
        tickets = JSON.parse(savedTickets);
    } else {
        tickets = { sold: [], used: [] };
    }
    
    const savedAwards = localStorage.getItem('nuasaSpecialAwards');
    if (savedAwards) {
        const savedData = JSON.parse(savedAwards);
        awardCategories.forEach((cat, idx) => {
            if (savedData[idx]) {
                cat.nominees = savedData[idx].nominees || [];
            }
        });
    } else {
        // Add sample nominees for demonstration
        addSampleNominees();
    }
    
    loadVotes();
    loadSponsors();
    renderContestants();
    updateResults();
    renderAwardsCategories();
}

function addSampleNominees() {
    const sampleNames = [
        "John Doe", "Jane Smith", "Michael Lee", "Sarah Johnson", 
        "David Brown", "Emily Davis", "Chris Wilson", "Amanda Taylor"
    ];
    
    awardCategories.forEach(category => {
        for (let i = 0; i < 4; i++) {
            category.nominees.push({
                id: Date.now() + i + Math.random(),
                name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
                votes: Math.floor(Math.random() * 100)
            });
        }
    });
    saveSpecialAwards();
}

function saveSpecialAwards() {
    const toSave = awardCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        nominees: cat.nominees
    }));
    localStorage.setItem('nuasaSpecialAwards', JSON.stringify(toSave));
}

// ============ TICKET CODE GENERATOR ============
function generateTicketCode() {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return `NUSA-${randomNum}`;
}

function saveTickets() {
    localStorage.setItem('nuasaTickets', JSON.stringify(tickets));
}

function purchaseTicket(type, price, buyerName, buyerEmail, buyerPhone) {
    let ticketCode;
    let isUnique = false;
    
    while (!isUnique) {
        ticketCode = generateTicketCode();
        const existing = tickets.sold.find(t => t.code === ticketCode);
        if (!existing) {
            isUnique = true;
        }
    }
    
    const newTicket = {
        code: ticketCode,
        type: type,
        price: price,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        buyerPhone: buyerPhone,
        purchaseDate: new Date().toISOString()
    };
    
    tickets.sold.push(newTicket);
    saveTickets();
    return newTicket;
}

function verifyTicket(ticketCode) {
    const cleanCode = ticketCode.trim().toUpperCase();
    
    if (tickets.used.includes(cleanCode)) {
        return { valid: false, reason: "❌ Ticket already used" };
    }
    
    const ticket = tickets.sold.find(t => t.code === cleanCode);
    if (!ticket) {
        return { valid: false, reason: "❌ Invalid ticket code" };
    }
    
    return { valid: true, ticket: ticket };
}

function useTicket(ticketCode) {
    const cleanCode = ticketCode.trim().toUpperCase();
    const verification = verifyTicket(cleanCode);
    if (!verification.valid) {
        return { success: false, message: verification.reason };
    }
    
    tickets.used.push(cleanCode);
    saveTickets();
    return { success: true, message: "✅ ENTRY GRANTED! Welcome to MR & MISS NUASA." };
}

// ============ LOGIN FUNCTIONS ============
function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginError = document.getElementById('loginError');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        loginError.style.display = 'none';
        
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('verifySection').style.display = 'block';
        
        document.getElementById('ticketCodeInput').value = '';
        document.getElementById('verificationResult').innerHTML = '';
        
        setTimeout(() => {
            document.getElementById('ticketCodeInput').focus();
        }, 100);
    } else {
        loginError.textContent = 'Invalid username or password';
        loginError.style.display = 'block';
    }
}

function handleLogout() {
    isLoggedIn = false;
    
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('verifySection').style.display = 'none';
    
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('ticketCodeInput').value = '';
    document.getElementById('verificationResult').innerHTML = '';
}

function openVerificationModal() {
    const modal = document.getElementById('verifyModal');
    modal.style.display = 'block';
    
    if (!isLoggedIn) {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('verifySection').style.display = 'none';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').style.display = 'none';
    } else {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('verifySection').style.display = 'block';
        document.getElementById('ticketCodeInput').value = '';
        document.getElementById('verificationResult').innerHTML = '';
        setTimeout(() => {
            document.getElementById('ticketCodeInput').focus();
        }, 100);
    }
}

function closeVerificationModal() {
    const modal = document.getElementById('verifyModal');
    modal.style.display = 'none';
}

function verifyTicketCode() {
    const ticketCode = document.getElementById('ticketCodeInput').value.trim().toUpperCase();
    const resultDiv = document.getElementById('verificationResult');
    
    if (!ticketCode) {
        resultDiv.innerHTML = '<p class="error">❌ Please enter a ticket code</p>';
        return;
    }
    
    const verification = verifyTicket(ticketCode);
    
    if (verification.valid) {
        const confirmUse = confirm(`✅ VALID TICKET!\n\nCode: ${verification.ticket.code}\nType: ${verification.ticket.type}\nBuyer: ${verification.ticket.buyerName}\nPrice: ₦${verification.ticket.price.toLocaleString()}\n\nAllow entry?`);
        
        if (confirmUse) {
            const useResult = useTicket(ticketCode);
            if (useResult.success) {
                resultDiv.innerHTML = `<p class="success">${useResult.message}</p>`;
                document.getElementById('ticketCodeInput').value = '';
                setTimeout(() => {
                    document.getElementById('ticketCodeInput').focus();
                }, 500);
            } else {
                resultDiv.innerHTML = `<p class="error">❌ ${useResult.message}</p>`;
            }
        } else {
            resultDiv.innerHTML = `<p class="info">ℹ️ Ticket verified but NOT marked as used.</p>`;
        }
    } else {
        resultDiv.innerHTML = `<p class="error">${verification.reason}</p>`;
    }
}

// ============ VOTING FUNCTIONS ============
function loadVotes() {
    const saved = localStorage.getItem('nuasaVotes');
    if (saved) {
        const savedVotes = JSON.parse(saved);
        contestants.forEach(c => {
            if (savedVotes[c.id]) c.votes = savedVotes[c.id];
        });
    }
}

function saveVotes() {
    const votesToSave = {};
    contestants.forEach(c => {
        votesToSave[c.id] = c.votes;
    });
    localStorage.setItem('nuasaVotes', JSON.stringify(votesToSave));
}

function saveSpecialVotes() {
    const votesToSave = {};
    awardCategories.forEach(category => {
        category.nominees.forEach(nominee => {
            votesToSave[`${category.id}_${nominee.id}`] = nominee.votes;
        });
    });
    localStorage.setItem('nuasaSpecialVotes', JSON.stringify(votesToSave));
}

function loadSpecialVotes() {
    const saved = localStorage.getItem('nuasaSpecialVotes');
    if (saved) {
        const savedVotes = JSON.parse(saved);
        awardCategories.forEach(category => {
            category.nominees.forEach(nominee => {
                const key = `${category.id}_${nominee.id}`;
                if (savedVotes[key]) {
                    nominee.votes = savedVotes[key];
                }
            });
        });
    }
}

function saveContestants() {
    localStorage.setItem('nuasaContestants', JSON.stringify(contestants));
}

function addVotes(contestantId, voteCount) {
    const contestant = contestants.find(c => c.id === contestantId);
    if (contestant) {
        contestant.votes += voteCount;
        saveVotes();
        saveContestants();
        renderContestants();
        updateResults();
    }
}

function addSpecialVotes(categoryId, nomineeId, voteCount) {
    const category = awardCategories.find(c => c.id === categoryId);
    if (category) {
        const nominee = category.nominees.find(n => n.id === nomineeId);
        if (nominee) {
            nominee.votes += voteCount;
            saveSpecialAwards();
            saveSpecialVotes();
            renderAwardsCategories();
        }
    }
}

// ============ RENDER FUNCTIONS ============
function updateResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;
    
    if (contestants.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <p>No contestants yet</p>
                <span>Check back soon!</span>
            </div>
        `;
        return;
    }
    
    const sorted = [...contestants].sort((a, b) => b.votes - a.votes);
    const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
    
    resultsContainer.innerHTML = sorted.map((c, index) => {
        const percentage = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0;
        const medal = index === 0 ? '👑 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : '';
        return `
            <div class="result-item">
                <span class="result-name">${medal}${c.emoji || '👤'} ${c.name} (${c.number})</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="result-votes">${c.votes} votes</span>
            </div>
        `;
    }).join('');
}

function renderContestants() {
    const grid = document.getElementById('contestantsGrid');
    if (!grid) return;
    
    if (contestants.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <p>No contestants yet</p>
                <span>Check back soon for our amazing contestants!</span>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = contestants.map(c => `
        <div class="contestant-card">
            <div class="contestant-image">
                <img src="${c.image}" alt="${c.name}" loading="lazy">
            </div>
            <div class="contestant-info">
                <div class="contestant-number">${c.number}</div>
                <h3>${c.name}</h3>
                <div class="vote-count">⭐ ${c.votes} votes</div>
                <button class="vote-btn" data-id="${c.id}" data-name="${c.name}">Vote (₦50/vote) →</button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.vote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const name = btn.dataset.name;
            openVoteModal(id, name);
        });
    });
}

function renderAwardsCategories() {
    const grid = document.getElementById('awardsCategoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = awardCategories.map(category => {
        const sortedNominees = [...category.nominees].sort((a, b) => b.votes - a.votes);
        const totalVotes = category.nominees.reduce((sum, n) => sum + n.votes, 0);
        
        return `
            <div class="category-card" data-category-id="${category.id}">
                <div class="category-header">
                    <div class="category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <h3>${category.name}</h3>
                </div>
                <div class="category-content">
                    <div class="nominees-list">
                        ${sortedNominees.map(nominee => {
                            const percentage = totalVotes > 0 ? (nominee.votes / totalVotes) * 100 : 0;
                            return `
                                <div class="nominee-item">
                                    <div class="nominee-info">
                                        <div class="nominee-avatar">
                                            <i class="fas fa-user"></i>
                                        </div>
                                        <div class="nominee-details">
                                            <div class="nominee-name">${nominee.name}</div>
                                            <div class="nominee-votes">${nominee.votes} votes</div>
                                            <div class="progress-bar" style="width: 100%; margin-top: 4px;">
                                                <div class="progress-fill" style="width: ${percentage}%"></div>
                                            </div>
                                        </div>
                                        <div class="nominee-vote-count">⭐ ${nominee.votes}</div>
                                    </div>
                                    <button class="vote-special-btn" data-category-id="${category.id}" data-nominee-id="${nominee.id}" data-nominee-name="${nominee.name}" data-category-name="${category.name}">
                                        <i class="fas fa-heart"></i> Vote
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <button class="add-nominee-btn" data-category-id="${category.id}" data-category-name="${category.name}">
                        <i class="fas fa-plus"></i> Add Nominee
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.vote-special-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoryId = parseInt(btn.dataset.categoryId);
            const nomineeId = parseInt(btn.dataset.nomineeId);
            const nomineeName = btn.dataset.nomineeName;
            const categoryName = btn.dataset.categoryName;
            openSpecialVoteModal(categoryId, nomineeId, nomineeName, categoryName);
        });
    });
    
    document.querySelectorAll('.add-nominee-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const categoryId = parseInt(btn.dataset.categoryId);
            const categoryName = btn.dataset.categoryName;
            addNomineePrompt(categoryId, categoryName);
        });
    });
}

function addNomineePrompt(categoryId, categoryName) {
    const nomineeName = prompt(`Enter nominee name for "${categoryName}":`);
    if (nomineeName && nomineeName.trim()) {
        const category = awardCategories.find(c => c.id === categoryId);
        if (category) {
            const newNominee = {
                id: Date.now(),
                name: nomineeName.trim(),
                votes: 0
            };
            category.nominees.push(newNominee);
            saveSpecialAwards();
            renderAwardsCategories();
            alert(`✅ Added "${nomineeName}" to ${categoryName}`);
        }
    }
}

// ============ MODAL FUNCTIONS ============
let currentTicketType = null;
let currentTicketPrice = null;
let currentContestantId = null;

function openTicketModal(type, price) {
    currentTicketType = type;
    currentTicketPrice = price;
    const modal = document.getElementById('ticketModal');
    document.getElementById('ticketTypeDisplay').textContent = type;
    document.getElementById('ticketPriceDisplay').textContent = price.toLocaleString();
    modal.style.display = 'block';
}

function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'none';
    document.getElementById('ticketForm').reset();
}

function openVoteModal(contestantId, contestantName) {
    currentContestantId = contestantId;
    const modal = document.getElementById('voteModal');
    document.getElementById('contestantName').textContent = contestantName;
    document.getElementById('voteCount').value = 1;
    document.getElementById('totalAmount').textContent = '50';
    modal.style.display = 'block';
}

function closeVoteModal() {
    const modal = document.getElementById('voteModal');
    modal.style.display = 'none';
}

function openSpecialVoteModal(categoryId, nomineeId, nomineeName, categoryName) {
    currentSpecialNominee = { id: nomineeId, categoryId: categoryId };
    currentSpecialCategory = categoryName;
    const modal = document.getElementById('specialVoteModal');
    document.getElementById('specialContestantName').textContent = nomineeName;
    document.getElementById('specialCategoryName').textContent = categoryName;
    document.getElementById('specialVoteCount').value = 1;
    document.getElementById('specialTotalAmount').textContent = '50';
    modal.style.display = 'block';
}

function closeSpecialVoteModal() {
    const modal = document.getElementById('specialVoteModal');
    modal.style.display = 'none';
}

// ============ ADMIN FUNCTIONS (Console) ============
window.addContestant = function(name, number, imageUrl, emoji = '👑') {
    const newId = contestants.length > 0 ? Math.max(...contestants.map(c => c.id)) + 1 : 1;
    const newContestant = {
        id: newId,
        name: name,
        number: number,
        votes: 0,
        emoji: emoji,
        image: imageUrl || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=400&h=500&fit=crop',
        alt: name
    };
    contestants.push(newContestant);
    saveContestants();
    renderContestants();
    updateResults();
    console.log(`✅ Added ${name} (${number})`);
    return newContestant;
};

window.removeContestant = function(contestantId) {
    contestants = contestants.filter(c => c.id !== contestantId);
    saveContestants();
    renderContestants();
    updateResults();
    console.log(`✅ Removed contestant ID: ${contestantId}`);
};

window.viewContestants = function() {
    console.table(contestants);
    return contestants;
};

window.addSpecialNominee = function(categoryId, nomineeName) {
    const category = awardCategories.find(c => c.id === categoryId);
    if (category) {
        const newNominee = {
            id: Date.now(),
            name: nomineeName,
            votes: 0
        };
        category.nominees.push(newNominee);
        saveSpecialAwards();
        renderAwardsCategories();
        console.log(`✅ Added "${nomineeName}" to ${category.name}`);
        return newNominee;
    } else {
        console.log(`❌ Category ID ${categoryId} not found`);
        return null;
    }
};

window.viewSpecialAwards = function() {
    console.table(awardCategories.map(cat => ({
        Category: cat.name,
        Nominees: cat.nominees.length,
        TotalVotes: cat.nominees.reduce((sum, n) => sum + n.votes, 0)
    })));
    return awardCategories;
};

window.viewAllTickets = function() {
    console.table(tickets.sold);
    return tickets.sold;
};

window.getTicketStats = function() {
    console.log(`📊 TICKET STATS:`);
    console.log(`   Total Sold: ${tickets.sold.length}`);
    console.log(`   Total Used: ${tickets.used.length}`);
    console.log(`   Total Unused: ${tickets.sold.length - tickets.used.length}`);
    return tickets;
};

window.clearAllData = function() {
    if (confirm('⚠️ WARNING: This will delete ALL data. Are you sure?')) {
        localStorage.clear();
        contestants = [];
        tickets = { sold: [], used: [] };
        awardCategories.forEach(cat => cat.nominees = []);
        renderContestants();
        updateResults();
        renderAwardsCategories();
        console.log('✅ All data cleared!');
    }
};

// ============ SPONSORS DATA ============
let sponsors = [];

function loadSponsors() {
    const savedSponsors = localStorage.getItem('nuasaSponsors');
    if (savedSponsors) {
        sponsors = JSON.parse(savedSponsors);
    } else {
        sponsors = [];
    }
    renderSponsors();
}

function saveSponsors() {
    localStorage.setItem('nuasaSponsors', JSON.stringify(sponsors));
}

function renderSponsors() {
    const sponsorsGrid = document.getElementById('sponsorsGrid');
    if (!sponsorsGrid) return;
    
    if (sponsors.length === 0) {
        sponsorsGrid.innerHTML = `
            <div class="empty-sponsors">
                <i class="fas fa-building"></i>
                <p>No sponsors yet</p>
                <span>Be the first to sponsor this event!</span>
            </div>
        `;
        return;
    }
    
    sponsorsGrid.innerHTML = sponsors.map(s => `
        <div class="sponsor-card" onclick="window.open('${s.website}', '_blank')">
            <div class="sponsor-logo">
                ${s.logoUrl ? `<img src="${s.logoUrl}" alt="${s.name}">` : `<i class="fas fa-building"></i>`}
            </div>
            <h4>${s.name}</h4>
            <p>${s.level}</p>
        </div>
    `).join('');
}

window.addSponsor = function(name, level, website, logoUrl = null) {
    const newSponsor = {
        id: sponsors.length + 1,
        name: name,
        level: level,
        website: website,
        logoUrl: logoUrl
    };
    sponsors.push(newSponsor);
    saveSponsors();
    renderSponsors();
    console.log(`✅ Added sponsor: ${name}`);
    return newSponsor;
};

window.removeSponsor = function(sponsorId) {
    sponsors = sponsors.filter(s => s.id !== sponsorId);
    saveSponsors();
    renderSponsors();
    console.log(`✅ Removed sponsor ID: ${sponsorId}`);
};

window.viewSponsors = function() {
    console.table(sponsors);
    return sponsors;
};

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    loadSpecialVotes();
    
    document.querySelectorAll('.buy-ticket').forEach(btn => {
        btn.addEventListener('click', () => {
            const price = parseInt(btn.dataset.price);
            const type = btn.dataset.type;
            openTicketModal(type, price);
        });
    });
    
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const buyerName = document.getElementById('buyerName').value;
            const buyerEmail = document.getElementById('buyerEmail').value;
            const buyerPhone = document.getElementById('buyerPhone').value;
            
            if (!buyerName || !buyerEmail || !buyerPhone) {
                alert('Please fill in all fields');
                return;
            }
            
            alert(`💰 Payment Demo\n\nTicket: ${currentTicketType}\nAmount: ₦${currentTicketPrice.toLocaleString()}\n\nClick OK to complete demo purchase`);
            
            const ticket = purchaseTicket(currentTicketType, currentTicketPrice, buyerName, buyerEmail, buyerPhone);
            
            alert(`✅ TICKET PURCHASED!\n\n📱 YOUR TICKET CODE: ${ticket.code}\n\nSave this code! Present it at the entrance.\nEach code can only be used once.`);
            
            console.log('Ticket purchased:', ticket);
            closeTicketModal();
        });
    }
    
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }
    
    const ticketCodeInput = document.getElementById('ticketCodeInput');
    if (ticketCodeInput) {
        ticketCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                verifyTicketCode();
            }
        });
    }
    
    const verifyBtn = document.getElementById('verifyBtn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', verifyTicketCode);
    }
    
    const verifyTicketBtn = document.getElementById('verifyTicketBtn');
    if (verifyTicketBtn) {
        verifyTicketBtn.addEventListener('click', openVerificationModal);
    }
    
    const payVoteBtn = document.getElementById('payVoteBtn');
    if (payVoteBtn) {
        payVoteBtn.addEventListener('click', () => {
            const voteCount = parseInt(document.getElementById('voteCount').value) || 0;
            if (voteCount < 1) {
                alert('Please enter at least 1 vote');
                return;
            }
            
            const totalAmount = voteCount * 50;
            alert(`💰 Payment Demo\n\nVotes: ${voteCount}\nTotal: ₦${totalAmount}\n\nClick OK to add votes`);
            
            addVotes(currentContestantId, voteCount);
            closeVoteModal();
        });
    }
    
    const paySpecialVoteBtn = document.getElementById('paySpecialVoteBtn');
    if (paySpecialVoteBtn) {
        paySpecialVoteBtn.addEventListener('click', () => {
            const voteCount = parseInt(document.getElementById('specialVoteCount').value) || 0;
            if (voteCount < 1) {
                alert('Please enter at least 1 vote');
                return;
            }
            
            const totalAmount = voteCount * 50;
            alert(`💰 Payment Demo\n\nCategory: ${currentSpecialCategory}\nVotes: ${voteCount}\nTotal: ₦${totalAmount}\n\nClick OK to add votes`);
            
            addSpecialVotes(currentSpecialNominee.categoryId, currentSpecialNominee.id, voteCount);
            closeSpecialVoteModal();
        });
    }
    
    const voteCountInput = document.getElementById('voteCount');
    if (voteCountInput) {
        voteCountInput.addEventListener('input', (e) => {
            const count = parseInt(e.target.value) || 0;
            document.getElementById('totalAmount').textContent = count * 50;
        });
    }
    
    const specialVoteCountInput = document.getElementById('specialVoteCount');
    if (specialVoteCountInput) {
        specialVoteCountInput.addEventListener('input', (e) => {
            const count = parseInt(e.target.value) || 0;
            document.getElementById('specialTotalAmount').textContent = count * 50;
        });
    }
    
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('voteModal')) closeVoteModal();
        if (e.target === document.getElementById('specialVoteModal')) closeSpecialVoteModal();
        if (e.target === document.getElementById('ticketModal')) closeTicketModal();
        if (e.target === document.getElementById('verifyModal')) closeVerificationModal();
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});

// ============ HAMBURGER MENU ============
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

function toggleMobileMenu() {
    if (!navLinks) return;
    
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.backgroundColor = 'white';
        navLinks.style.padding = '1.5rem';
        navLinks.style.gap = '1rem';
        navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        navLinks.style.borderBottom = '2px solid rgba(212, 175, 55, 0.3)';
        navLinks.style.zIndex = '999';
    }
}

function closeMobileMenu() {
    if (navLinks && window.innerWidth <= 768) {
        navLinks.style.display = 'none';
    }
}

function resetMobileMenu() {
    if (window.innerWidth > 768) {
        if (navLinks) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'row';
            navLinks.style.position = 'relative';
            navLinks.style.top = 'auto';
            navLinks.style.left = 'auto';
            navLinks.style.right = 'auto';
            navLinks.style.backgroundColor = 'transparent';
            navLinks.style.padding = '0';
            navLinks.style.boxShadow = 'none';
        }
    } else {
        if (navLinks && navLinks.style.display !== 'flex') {
            navLinks.style.display = 'none';
        }
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

if (navLinks) {
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

window.addEventListener('resize', resetMobileMenu);
resetMobileMenu();

// Initialize everything
loadData();
loadSpecialVotes();
renderSponsors();
