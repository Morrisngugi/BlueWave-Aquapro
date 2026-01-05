// Admin Panel JavaScript

// Admin credentials (in a real application, this would be handled by a secure backend)
const adminCredentials = {
    username: 'admin',
    password: 'bluewave2025'
};

let isAuthenticated = false;
let currentEditingOrderId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initialized');
    
    // Check authentication
    checkAuthentication();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load dashboard data
    if (isAuthenticated) {
        loadDashboard();
        loadOrders();
    }
});

// Check authentication status
function checkAuthentication() {
    // Check sessionStorage for authentication
    isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    if (!isAuthenticated) {
        showLoginModal();
    } else {
        showAdminContent();
    }
}

// Show login modal
function showLoginModal() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    document.getElementById('adminContent').style.display = 'none';
}

// Show admin content
function showAdminContent() {
    document.getElementById('adminContent').style.display = 'block';
    const loginModalElement = document.getElementById('loginModal');
    const loginModal = bootstrap.Modal.getInstance(loginModalElement);
    if (loginModal) {
        loginModal.hide();
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleLogin);
    
    // Search and filters
    document.getElementById('searchOrders').addEventListener('input', filterOrders);
    document.getElementById('filterStatus').addEventListener('change', filterOrders);
    document.getElementById('filterDate').addEventListener('change', filterOrders);
}

// Handle admin login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        isAuthenticated = true;
        sessionStorage.setItem('adminAuthenticated', 'true');
        showAdminContent();
        loadDashboard();
        loadOrders();
        document.getElementById('loginError').classList.add('d-none');
    } else {
        document.getElementById('loginError').classList.remove('d-none');
    }
}

// Logout function
function logout() {
    isAuthenticated = false;
    sessionStorage.removeItem('adminAuthenticated');
    location.reload();
}

// Load dashboard statistics
function loadDashboard() {
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
        !['completed'].includes(order.status)
    ).length;
    const completedToday = orders.filter(order => 
        order.statusHistory.some(h => 
            h.status === 'completed' && 
            h.timestamp.startsWith(today)
        )
    ).length;
    const todaysRevenue = orders
        .filter(order => order.serviceDate === today)
        .reduce((sum, order) => sum + order.cost, 0);
    
    // Update dashboard
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedToday;
    document.getElementById('todaysRevenue').textContent = `KES ${todaysRevenue.toLocaleString()}`;
}

// Load orders table
function loadOrders() {
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const tbody = document.getElementById('ordersTableBody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = createOrderRow(order);
        tbody.appendChild(row);
    });
}

// Create order row
function createOrderRow(order) {
    const row = document.createElement('tr');
    const statusConfig = window.orderTrackingUtils?.statusConfig || {};
    const statusInfo = statusConfig[order.status] || { label: order.status, color: 'secondary' };
    
    row.innerHTML = `
        <td><strong>${order.id}</strong></td>
        <td>${order.customerName}</td>
        <td>${order.phone}</td>
        <td>${order.serviceType}</td>
        <td>${formatDate(order.serviceDate)}</td>
        <td>
            <span class="badge bg-${statusInfo.color}">
                <i class="bi bi-${statusInfo.icon || 'circle'} me-1"></i>
                ${statusInfo.label}
            </span>
        </td>
        <td><strong>KES ${order.cost.toLocaleString()}</strong></td>
        <td>
            <div class="btn-group btn-group-sm" role="group">
                <button type="button" class="btn btn-outline-primary" onclick="editOrder('${order.id}')" title="Update Status">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-outline-info" onclick="viewOrder('${order.id}')" title="View Details">
                    <i class="bi bi-eye"></i>
                </button>
                <button type="button" class="btn btn-outline-danger" onclick="deleteOrder('${order.id}')" title="Delete Order">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Edit order (update status)
function editOrder(orderId) {
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    currentEditingOrderId = orderId;
    document.getElementById('updateOrderID').textContent = order.id;
    document.getElementById('updateCustomerName').textContent = order.customerName;
    document.getElementById('newStatus').value = order.status;
    document.getElementById('statusNotes').value = '';
    
    const updateModal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
    updateModal.show();
}

// Save status update
function saveStatusUpdate() {
    if (!currentEditingOrderId) return;
    
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const order = orders.find(o => o.id === currentEditingOrderId);
    
    if (!order) return;
    
    const newStatus = document.getElementById('newStatus').value;
    const notes = document.getElementById('statusNotes').value || 'Status updated by admin';
    
    // Update order status
    order.status = newStatus;
    
    // Add to status history
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    order.statusHistory.push({
        status: newStatus,
        timestamp: timestamp,
        note: notes
    });
    
    // Close modal
    const updateModal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
    updateModal.hide();
    
    // Reload orders and dashboard
    loadOrders();
    loadDashboard();
    
    // Show success message
    showToast('Order status updated successfully', 'success');
    
    currentEditingOrderId = null;
}

// View order details
function viewOrder(orderId) {
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Create and show order details modal
    const modalHTML = `
        <div class="modal fade" id="viewOrderModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Order Details - ${order.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <p><strong>Name:</strong> ${order.customerName}</p>
                                <p><strong>Phone:</strong> ${order.phone}</p>
                                <p><strong>Service Date:</strong> ${formatDate(order.serviceDate)}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Service Information</h6>
                                <p><strong>Service Type:</strong> ${order.serviceType}</p>
                                <p><strong>Items:</strong> ${order.items}</p>
                                <p><strong>Total Cost:</strong> KES ${order.cost.toLocaleString()}</p>
                            </div>
                        </div>
                        <hr>
                        <h6>Status History</h6>
                        <div class="timeline">
                            ${order.statusHistory.map(h => `
                                <div class="d-flex mb-2">
                                    <div class="badge bg-primary me-2">${formatTimestamp(h.timestamp)}</div>
                                    <div>
                                        <strong>${window.orderTrackingUtils?.statusConfig[h.status]?.label || h.status}</strong>
                                        <br><small class="text-muted">${h.note}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if it exists
    const existingModal = document.getElementById('viewOrderModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const viewModal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    viewModal.show();
    
    // Remove modal from DOM when closed
    document.getElementById('viewOrderModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }
    
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index !== -1) {
        orders.splice(index, 1);
        loadOrders();
        loadDashboard();
        showToast('Order deleted successfully', 'success');
    }
}

// Save new order
function saveNewOrder() {
    const form = document.getElementById('addOrderForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Generate new order ID
    const today = new Date();
    const year = today.getFullYear();
    const orders = window.orderTrackingUtils?.orderDatabase || [];
    const orderCount = orders.filter(o => o.id.includes(year)).length + 1;
    const newOrderId = `BWA-${year}-${String(orderCount).padStart(3, '0')}`;
    
    // Create new order object
    const newOrder = {
        id: newOrderId,
        customerName: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        serviceType: document.getElementById('serviceType').value,
        items: document.getElementById('itemsDescription').value,
        serviceDate: document.getElementById('serviceDate').value,
        cost: parseInt(document.getElementById('totalCost').value),
        status: 'scheduled',
        estimatedCompletion: document.getElementById('estimatedCompletion').value,
        statusHistory: [
            {
                status: 'scheduled',
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                note: 'Order created by admin'
            }
        ]
    };
    
    // Add to database
    orders.push(newOrder);
    
    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(document.getElementById('addOrderModal'));
    addModal.hide();
    form.reset();
    form.classList.remove('was-validated');
    
    // Reload data
    loadOrders();
    loadDashboard();
    
    // Show success message
    showToast(`Order ${newOrderId} created successfully`, 'success');
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const dateFilter = document.getElementById('filterDate').value;
    
    const rows = document.querySelectorAll('#ordersTableBody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const orderText = Array.from(cells).slice(0, -1).map(cell => cell.textContent.toLowerCase()).join(' ');
        
        let showRow = true;
        
        // Apply search filter
        if (searchTerm && !orderText.includes(searchTerm)) {
            showRow = false;
        }
        
        // Apply status filter
        if (statusFilter) {
            const statusBadge = row.querySelector('.badge');
            const rowStatus = statusBadge ? statusBadge.textContent.toLowerCase() : '';
            const statusConfig = window.orderTrackingUtils?.statusConfig || {};
            const matchingStatus = Object.keys(statusConfig).find(key => 
                statusConfig[key].label.toLowerCase().includes(statusFilter)
            );
            if (matchingStatus && !rowStatus.includes(statusConfig[matchingStatus].label.toLowerCase())) {
                showRow = false;
            }
        }
        
        // Apply date filter
        if (dateFilter) {
            const dateCell = cells[4]; // Service date column
            const rowDate = new Date(dateCell.textContent);
            const today = new Date();
            
            switch (dateFilter) {
                case 'today':
                    if (rowDate.toDateString() !== today.toDateString()) {
                        showRow = false;
                    }
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    if (rowDate < weekAgo) {
                        showRow = false;
                    }
                    break;
                case 'month':
                    if (rowDate.getMonth() !== today.getMonth() || rowDate.getFullYear() !== today.getFullYear()) {
                        showRow = false;
                    }
                    break;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Refresh orders
function refreshOrders() {
    loadOrders();
    loadDashboard();
    showToast('Data refreshed', 'info');
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert">
            <div class="toast-header">
                <i class="bi bi-${type === 'success' ? 'check-circle-fill text-success' : 
                                 type === 'danger' ? 'exclamation-triangle-fill text-danger' : 
                                 'info-circle-fill text-info'} me-2"></i>
                <strong class="me-auto">BlueWave Admin</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toast = new bootstrap.Toast(document.getElementById(toastId));
    toast.show();
    
    // Remove toast element after it's hidden
    document.getElementById(toastId).addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// Utility function to format date
function formatDate(dateString) {
    return window.orderTrackingUtils?.formatDate(dateString) || dateString;
}

// Utility function to format timestamp
function formatTimestamp(timestampString) {
    return window.orderTrackingUtils?.formatTimestamp(timestampString) || timestampString;
}