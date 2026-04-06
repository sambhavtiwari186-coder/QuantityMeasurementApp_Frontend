const API_BASE_URL = 'http://localhost:5000'; // Updated to match user's backend host

class QuantifyApp {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.currentType = 'Length';
        this.currentView = 'convert';
        this.units = {
            'Length': ['Feet', 'Inch', 'Yard', 'Centimeter'],
            'Weight': ['Kilogram', 'Gram', 'Tonne', 'Milligram'],
            'Volume': ['Litre', 'Gallon', 'Millilitre'],
            'Temperature': ['Celsius', 'Fahrenheit', 'Kelvin'],
            'Area': ['SquareMeter', 'SquareFoot', 'SquareInch', 'Acre', 'Hectare'],
            'Time': ['Second', 'Minute', 'Hour', 'Day', 'Week']
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateAuthUI();
        this.populateUnits();
        this.navigate('convert');
        
        if (this.token) {
            this.fetchHistory();
        }
    }

    setupEventListeners() {
        // Nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('href').substring(1);
                this.navigate(view);
            });
        });

        // Type Buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentType = btn.dataset.type;
                this.populateUnits();
            });
        });

        // Auth Modals
        document.getElementById('loginBtn').onclick = () => this.showAuthModal('login');
        document.getElementById('registerBtn').onclick = () => this.showAuthModal('register');
        document.querySelector('.close-modal').onclick = () => this.hideAuthModal();
        document.getElementById('showRegister').onclick = (e) => { e.preventDefault(); this.showAuthModal('register'); };
        document.getElementById('showLogin').onclick = (e) => { e.preventDefault(); this.showAuthModal('login'); };

        // Do Auth
        document.getElementById('doLogin').onclick = () => this.handleLogin();
        document.getElementById('doRegister').onclick = () => this.handleRegister();
        document.getElementById('logoutBtn').onclick = () => this.handleLogout();

        // Main Actions
        document.getElementById('convertBtn').onclick = () => this.handleConvert();
        document.getElementById('compareBtn').onclick = () => this.handleCompare();
        document.getElementById('arithBtn').onclick = () => this.handleArithmetic();
        document.getElementById('refreshHistory').onclick = () => this.fetchHistory();

        // Operation Selectors (Arithmetic)
        document.querySelectorAll('.op-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.op-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Real-time conversion
        document.getElementById('sourceValue').addEventListener('input', () => this.handleConvert());
        document.getElementById('sourceUnit').addEventListener('change', () => this.handleConvert());
        document.getElementById('targetUnit').addEventListener('change', () => this.handleConvert());
    }

    // Navigation & UI Updates
    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${view}`);
        });

        document.querySelectorAll('.converter-box').forEach(box => {
            box.classList.toggle('hidden', box.id !== view);
        });

        if (view === 'history' && !this.token) {
            this.showToast('Please login to view history', 'error');
            this.showAuthModal('login');
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');

        if (this.token) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userEmail.innerText = this.user || 'User';
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            userInfo.classList.add('hidden');
        }
    }

    showAuthModal(type) {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('loginForm').classList.toggle('hidden', type !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', type !== 'register');
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
    }

    populateUnits() {
        const currentUnits = this.units[this.currentType];
        const selects = ['sourceUnit', 'targetUnit', 'compareUnit1', 'compareUnit2', 'arithUnit1', 'arithUnit2', 'arithTargetUnit'];
        
        selects.forEach(id => {
            const el = document.getElementById(id);
            const val = el.value;
            el.innerHTML = currentUnits.map(u => `<option value="${u}">${u}</option>`).join('');
            if (currentUnits.includes(val)) el.value = val;
        });
    }

    // API Handlers
    async request(endpoint, method = 'GET', data = null) {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        try {
            const options = { method, headers };
            if (data) options.body = JSON.stringify(data);

            const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || res.statusText);
            }

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return await res.json();
            } else {
                return await res.text();
            }
        } catch (err) {
            console.error('API Error:', err);
            this.showToast(err.message, 'error');
            return null;
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const res = await this.request('/api/Auth/login', 'POST', { username: email, password });
        if (res && res.token) {
            this.token = res.token;
            this.user = email;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            this.updateAuthUI();
            this.hideAuthModal();
            this.showToast('Login successful!');
            this.fetchHistory();
        }
    }

    async handleRegister() {
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phoneNumber = document.getElementById('regPhone').value;

        const res = await this.request('/api/Auth/register', 'POST', { username: email, email, password });
        if (res) {
            this.showToast('Registration successful! Please login.');
            this.showAuthModal('login');
        }
    }

    handleLogout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateAuthUI();
        this.navigate('convert');
        this.showToast('Logged out');
    }

    async handleConvert() {
        if (!this.token) return;
        
        const sourceValue = parseFloat(document.getElementById('sourceValue').value);
        const sourceUnit = document.getElementById('sourceUnit').value;
        const targetUnit = document.getElementById('targetUnit').value;

        if (isNaN(sourceValue)) return;

        const data = {
            source: { value: sourceValue, unit: sourceUnit, measurementType: this.currentType },
            targetUnit: targetUnit
        };

        const res = await this.request('/api/measurement/convert', 'POST', data);
        if (res !== null) {
            document.getElementById('targetValueDisplay').innerText = typeof res === 'object' ? res.value.toFixed(4) : parseFloat(res).toFixed(4);
        }
    }

    async handleCompare() {
        if (!this.token) return;

        const val1 = parseFloat(document.getElementById('compareVal1').value);
        const unit1 = document.getElementById('compareUnit1').value;
        const val2 = parseFloat(document.getElementById('compareVal2').value);
        const unit2 = document.getElementById('compareUnit2').value;

        const data = {
            quantity1: { value: val1, unit: unit1, measurementType: this.currentType },
            quantity2: { value: val2, unit: unit2, measurementType: this.currentType }
        };

        const res = await this.request('/api/measurement/compare', 'POST', data);
        const resultBox = document.getElementById('compareResult');
        resultBox.classList.remove('hidden');

        if (res && res.areEqual !== undefined) {
            resultBox.innerHTML = res.areEqual 
                ? '<i class="fas fa-check-circle" style="color:var(--success)"></i> They are EQUAL' 
                : '<i class="fas fa-times-circle" style="color:var(--error)"></i> They are NOT EQUAL';
        }
    }

    async handleArithmetic() {
        if (!this.token) return;

        const val1 = parseFloat(document.getElementById('arithVal1').value);
        const unit1 = document.getElementById('arithUnit1').value;
        const val2 = parseFloat(document.getElementById('arithVal2').value);
        const unit2 = document.getElementById('arithUnit2').value;
        const targetUnit = document.getElementById('arithTargetUnit').value;
        const operation = document.querySelector('.op-btn.active').dataset.op;

        const data = {
            quantity1: { value: val1, unit: unit1, measurementType: this.currentType },
            quantity2: { value: val2, unit: unit2, measurementType: this.currentType },
            targetUnit: targetUnit
        };

        const endpoint = operation === 'add' ? '/api/measurement/add' : '/api/measurement/subtract';
        const res = await this.request(endpoint, 'POST', data);
        
        const resultBox = document.getElementById('arithResult');
        resultBox.classList.remove('hidden');

        if (res !== null) {
            const val = typeof res === 'object' ? res.value.toFixed(4) : parseFloat(res).toFixed(4);
            resultBox.innerHTML = `<strong>Result:</strong> ${val} ${targetUnit}`;
        }
    }

    async fetchHistory() {
        if (!this.token) return;
        const list = await this.request('/api/measurement/history');
        const container = document.getElementById('historyList');
        
        if (list && Array.isArray(list)) {
            if (list.length === 0) {
                container.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No history yet.</p></div>';
                return;
            }

            container.innerHTML = list.reverse().map(item => `
                <div class="history-item">
                    <div class="history-info">
                        <span class="history-main">${item.operationType}: ${item.firstOperand} ${item.secondOperand !== 'N/A' ? ' & ' + item.secondOperand : ''}</span>
                        <span class="history-sub">${item.finalResult} | ${new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <span class="history-status ${item.hasError ? 'status-error' : 'status-success'}">
                        ${item.hasError ? 'Failed' : 'Success'}
                    </span>
                </div>
            `).join('');
        }
    }

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--error)';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

const app = new QuantifyApp();
