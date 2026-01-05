// Order Tracking JavaScript

// Sample order data (in a real application, this would come from a database)
let orderDatabase = [
    {
        id: 'BWA-2025-001',
        customerName: 'John Kamau',
        phone: '0757438333',
        serviceType: 'Sofa Cleaning',
        items: '3-seater sofa, 2 cushions',
        serviceDate: '2025-01-06',
        cost: 1200,
        status: 'processing',
        estimatedCompletion: '2025-01-07',
        statusHistory: [
            { status: 'scheduled', timestamp: '2025-01-05 09:00:00', note: 'Service scheduled' },
            { status: 'pickup', timestamp: '2025-01-06 10:30:00', note: 'Items collected from customer' },
            { status: 'processing', timestamp: '2025-01-06 14:00:00', note: 'Deep cleaning in progress' }
        ]
    },
    {
        id: 'BWA-2025-002',
        customerName: 'Mary Wanjiku',
        phone: '0711691794',
        serviceType: 'Carpet Cleaning',
        items: 'Living room carpet 4x6 meters',
        serviceDate: '2025-01-05',
        cost: 800,
        status: 'delivery',
        estimatedCompletion: '2025-01-06',
        statusHistory: [
            { status: 'scheduled', timestamp: '2025-01-04 15:00:00', note: 'Service scheduled' },
            { status: 'pickup', timestamp: '2025-01-05 09:00:00', note: 'Carpet collected' },
            { status: 'processing', timestamp: '2025-01-05 11:00:00', note: 'Steam cleaning started' },
            { status: 'quality-check', timestamp: '2025-01-05 16:00:00', note: 'Quality inspection passed' },
            { status: 'delivery', timestamp: '2025-01-05 18:00:00', note: 'Ready for delivery' }
        ]
    },
    {
        id: 'BWA-2025-003',
        customerName: 'Peter Mwangi',
        phone: '0722123456',
        serviceType: 'Car Interior Cleaning',
        items: 'Toyota Premio - Full interior',
        serviceDate: '2025-01-04',
        cost: 1500,
        status: 'completed',
        estimatedCompletion: '2025-01-05',
        statusHistory: [
            { status: 'scheduled', timestamp: '2025-01-03 16:00:00', note: 'Service scheduled' },
            { status: 'pickup', timestamp: '2025-01-04 08:00:00', note: 'Vehicle collected' },
            { status: 'processing', timestamp: '2025-01-04 09:30:00', note: 'Interior cleaning started' },
            { status: 'quality-check', timestamp: '2025-01-04 14:00:00', note: 'Final inspection completed' },
            { status: 'delivery', timestamp: '2025-01-04 15:30:00', note: 'Vehicle ready for pickup' },
            { status: 'completed', timestamp: '2025-01-04 17:00:00', note: 'Vehicle delivered to customer' }
        ]
    }
];

// Status configuration
const statusConfig = {
    'scheduled': { 
        label: 'Service Scheduled', 
        color: 'info', 
        icon: 'calendar-check',
        description: 'Your service appointment has been confirmed'
    },
    'pickup': { 
        label: 'Items Collected', 
        color: 'warning', 
        icon: 'truck',
        description: 'Our team has collected your items'
    },
    'processing': { 
        label: 'Cleaning in Progress', 
        color: 'primary', 
        icon: 'gear-fill',
        description: 'Your items are currently being cleaned'
    },
    'quality-check': { 
        label: 'Quality Check', 
        color: 'info', 
        icon: 'search',
        description: 'Final quality inspection in progress'
    },
    'delivery': { 
        label: 'Ready for Delivery', 
        color: 'success', 
        icon: 'check-circle',
        description: 'Your items are cleaned and ready'
    },
    'completed': { 
        label: 'Service Completed', 
        color: 'success', 
        icon: 'check-all',
        description: 'Service completed successfully'
    }
};

// Initialize order tracking
document.addEventListener('DOMContentLoaded', function() {
    console.log('Order tracking initialized');
    
    // Handle form submission
    const trackForm = document.getElementById('trackOrderForm');
    if (trackForm) {
        trackForm.addEventListener('submit', handleTrackOrder);
    }
    
    // Check for URL parameters (from homepage quick search)
    const urlParams = new URLSearchParams(window.location.search);
    const orderID = urlParams.get('orderID');
    const phone = urlParams.get('phone');
    
    if (orderID && phone) {
        // Pre-fill the form and automatically search
        document.getElementById('orderID').value = orderID;
        document.getElementById('phoneNumber').value = phone;
        
        // Automatically trigger the search
        setTimeout(() => {
            handleTrackOrderDirect(orderID, phone);
        }, 500);
    }
});

// Handle track order form submission
function handleTrackOrder(e) {
    e.preventDefault();
    
    const orderID = document.getElementById('orderID').value.trim().toUpperCase();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    
    handleTrackOrderDirect(orderID, phoneNumber);
}

// Direct order tracking (used by form and URL parameters)
function handleTrackOrderDirect(orderID, phoneNumber) {
    // Validate inputs
    if (!orderID || !phoneNumber) {
        showError('Please enter both Order ID and phone number');
        return;
    }
    
    // Search for order
    const order = findOrder(orderID, phoneNumber);
    
    if (order) {
        displayOrder(order);
        hideError();
    } else {
        showError();
        hideOrderStatus();
    }
}

// Find order in database
function findOrder(orderID, phoneNumber) {
    return orderDatabase.find(order => {
        // Match order ID exactly and phone number (last 4 digits or full number)
        const phoneMatch = order.phone.includes(phoneNumber) || 
                          order.phone.slice(-4) === phoneNumber.slice(-4);
        return order.id === orderID && phoneMatch;
    });
}

// Display order information
function displayOrder(order) {
    // Populate order details
    document.getElementById('displayOrderID').textContent = order.id;
    document.getElementById('displayCustomerName').textContent = order.customerName;
    document.getElementById('displayPhoneNumber').textContent = order.phone;
    document.getElementById('displayServiceDate').textContent = formatDate(order.serviceDate);
    document.getElementById('displayServiceType').textContent = order.serviceType;
    document.getElementById('displayItems').textContent = order.items;
    document.getElementById('displayCost').textContent = `KES ${order.cost.toLocaleString()}`;
    document.getElementById('estimatedCompletion').textContent = formatDate(order.estimatedCompletion);
    
    // Update timeline
    updateTimeline(order);
    
    // Update current status
    updateCurrentStatus(order);
    
    // Show order status card
    document.getElementById('orderStatusCard').classList.remove('d-none');
    
    // Scroll to results
    document.getElementById('orderStatusCard').scrollIntoView({ behavior: 'smooth' });
}

// Update timeline based on order status
function updateTimeline(order) {
    const statuses = ['scheduled', 'pickup', 'processing', 'quality-check', 'delivery', 'completed'];
    const currentStatusIndex = statuses.indexOf(order.status);
    
    statuses.forEach((status, index) => {
        const timelineItem = document.getElementById(`status-${status}`);
        const marker = timelineItem.querySelector('.timeline-marker');
        const timestamp = timelineItem.querySelector('.timestamp');
        
        if (index <= currentStatusIndex) {
            // Completed or current status
            timelineItem.classList.add('completed');
            marker.innerHTML = '<i class="bi bi-check-lg"></i>';
            
            // Find timestamp for this status
            const statusHistory = order.statusHistory.find(h => h.status === status);
            if (statusHistory) {
                timestamp.textContent = formatTimestamp(statusHistory.timestamp);
            }
        } else {
            // Future status
            timelineItem.classList.remove('completed');
            marker.innerHTML = '';
            timestamp.textContent = '';
        }
        
        // Highlight current status
        if (index === currentStatusIndex) {
            timelineItem.classList.add('current');
        } else {
            timelineItem.classList.remove('current');
        }
    });
}

// Update current status alert
function updateCurrentStatus(order) {
    const statusInfo = statusConfig[order.status];
    const alertElement = document.getElementById('currentStatusAlert');
    const textElement = document.getElementById('currentStatusText');
    
    if (statusInfo) {
        alertElement.className = `alert alert-${statusInfo.color}`;
        textElement.innerHTML = `
            <i class="bi bi-${statusInfo.icon} me-2"></i>
            <strong>${statusInfo.label}:</strong> ${statusInfo.description}
        `;
    }
}

// Show error message
function showError(message = null) {
    const errorElement = document.getElementById('errorMessage');
    if (message) {
        const customError = document.createElement('p');
        customError.textContent = message;
        customError.className = 'mb-0';
        errorElement.innerHTML = '<h6 class="alert-heading">Error</h6>';
        errorElement.appendChild(customError);
    }
    errorElement.classList.remove('d-none');
}

// Hide error message
function hideError() {
    document.getElementById('errorMessage').classList.add('d-none');
}

// Hide order status
function hideOrderStatus() {
    document.getElementById('orderStatusCard').classList.add('d-none');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format timestamp for display
function formatTimestamp(timestampString) {
    const date = new Date(timestampString);
    return date.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export functions for admin panel
window.orderTrackingUtils = {
    orderDatabase,
    statusConfig,
    findOrder,
    formatDate,
    formatTimestamp
};