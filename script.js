// Initialize data from localStorage
let deals = JSON.parse(localStorage.getItem('deals')) || [];
let analytics = JSON.parse(localStorage.getItem('analytics')) || { clicks: 0, conversions: 0, earnings: 0 };

// Your Affiliate IDs - UPDATE THESE WITH YOUR IDs
const affiliateIDs = {
    amazon: 'tarun010a-21',
    ebay: '',
    flipkart: '',
    aliexpress: ''
};

// Form submission
document.getElementById('linkForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const platform = document.getElementById('platform').value;
    let affiliateLink = document.getElementById('affiliateLink').value;

    // Auto-format Amazon links with affiliate ID
    if (platform === 'amazon' && affiliateIDs.amazon) {
        if (!affiliateLink.includes('tag=')) {
            // If it's an Amazon product link without tag, add it
            const separator = affiliateLink.includes('?') ? '&' : '?';
            affiliateLink = affiliateLink + separator + 'tag=' + affiliateIDs.amazon;
        }
    }

    const newDeal = {
        id: Date.now(),
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        platform: platform,
        category: document.getElementById('category').value,
        originalPrice: parseFloat(document.getElementById('originalPrice').value) || 0,
        discountedPrice: parseFloat(document.getElementById('discountedPrice').value) || 0,
        affiliateLink: affiliateLink,
        imageUrl: document.getElementById('imageUrl').value || 'https://via.placeholder.com/280x200?text=Deal',
        commissionRate: parseFloat(document.getElementById('commissionRate').value) || 0,
        createdAt: new Date().toISOString(),
        clicks: 0,
        conversions: 0
    };

    deals.push(newDeal);
    localStorage.setItem('deals', JSON.stringify(deals));

    alert('✅ Deal added successfully!\\n\\nAmazon ID: ' + affiliateIDs.amazon);
    this.reset();
    displayDeals();
    updateDashboard();
});

// Display deals
function displayDeals() {
    const dealsList = document.getElementById('dealsList');
    dealsList.innerHTML = '';

    if (deals.length === 0) {
        dealsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">No deals added yet. Start by adding your first affiliate link!</p>';
        return;
    }

    deals.forEach(deal => {
        const discount = deal.originalPrice > 0 
            ? Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100)
            : 0;

        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.innerHTML = `
            <img src="${deal.imageUrl}" alt="${deal.title}" class="deal-image" onerror="this.src='https://via.placeholder.com/280x200?text=Deal'">
            <div class="deal-content">
                <span class="deal-platform">${deal.platform.toUpperCase()}</span>
                <div class="deal-title">${deal.title}</div>
                <div class="deal-description">${deal.description.substring(0, 60)}...</div>
                <div class="deal-price">
                    ${deal.originalPrice > 0 ? `<span class="deal-original">$${deal.originalPrice.toFixed(2)}</span>` : ''}
                    <span class="deal-discounted">$${deal.discountedPrice.toFixed(2)}</span>
                    ${discount > 0 ? `<span class="deal-discount">-${discount}%</span>` : ''}
                </div>
                <div class="deal-commission">💰 ${deal.commissionRate}% Commission</div>
                <button class="deal-link-btn" onclick="handleDealClick('${deal.id}', '${deal.affiliateLink}')">View Deal</button>
            </div>
        `;
        dealsList.appendChild(dealCard);
    });
}

// Handle deal click
function handleDealClick(dealId, affiliateLink) {
    const deal = deals.find(d => d.id == dealId);
    if (deal) {
        deal.clicks++;
        localStorage.setItem('deals', JSON.stringify(deals));
        updateDashboard();
    }

    // Open affiliate link in new tab
    window.open(affiliateLink, '_blank');
}

// Filter deals
function filterDeals() {
    const platform = document.getElementById('platformFilter').value;
    const filtered = platform === 'all' 
        ? deals 
        : deals.filter(d => d.platform === platform);

    displayFilteredDeals(filtered);
}

// Search deals
function searchDeals() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = deals.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.description.toLowerCase().includes(query)
    );

    displayFilteredDeals(filtered);
}

function displayFilteredDeals(filteredDeals) {
    const dealsList = document.getElementById('dealsList');
    dealsList.innerHTML = '';

    if (filteredDeals.length === 0) {
        dealsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">No deals found.</p>';
        return;
    }

    filteredDeals.forEach(deal => {
        const discount = deal.originalPrice > 0 
            ? Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100)
            : 0;

        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.innerHTML = `
            <img src="${deal.imageUrl}" alt="${deal.title}" class="deal-image" onerror="this.src='https://via.placeholder.com/280x200?text=Deal'">
            <div class="deal-content">
                <span class="deal-platform">${deal.platform.toUpperCase()}</span>
                <div class="deal-title">${deal.title}</div>
                <div class="deal-description">${deal.description.substring(0, 60)}...</div>
                <div class="deal-price">
                    ${deal.originalPrice > 0 ? `<span class="deal-original">$${deal.originalPrice.toFixed(2)}</span>` : ''}
                    <span class="deal-discounted">$${deal.discountedPrice.toFixed(2)}</span>
                    ${discount > 0 ? `<span class="deal-discount">-${discount}%</span>` : ''}
                </div>
                <div class="deal-commission">💰 ${deal.commissionRate}% Commission</div>
                <button class="deal-link-btn" onclick="handleDealClick('${deal.id}', '${deal.affiliateLink}')">View Deal</button>
            </div>
        `;
        dealsList.appendChild(dealCard);
    });
}

// Update dashboard
function updateDashboard() {
    const totalClicks = deals.reduce((sum, d) => sum + d.clicks, 0);
    const totalConversions = deals.reduce((sum, d) => sum + d.conversions, 0);
    const estimatedEarnings = deals.reduce((sum, d) => {
        const earning = (d.clicks * (d.commissionRate / 100)) * (d.discountedPrice / 10);
        return sum + earning;
    }, 0);

    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('totalConversions').textContent = totalConversions;
    document.getElementById('totalEarnings').textContent = '$' + estimatedEarnings.toFixed(2);
    document.getElementById('activeDeals').textContent = deals.length;

    // Performance table
    const performanceTable = document.getElementById('performanceTable');
    if (deals.length === 0) {
        performanceTable.innerHTML = '<p style="padding: 1rem; text-align: center; color: #999;">No performance data yet.</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Deal Title</th>
                    <th>Platform</th>
                    <th>Clicks</th>
                    <th>Commission %</th>
                    <th>Est. Earnings</th>
                </tr>
            </thead>
            <tbody>
    `;

    deals.forEach(deal => {
        const earning = (deal.clicks * (deal.commissionRate / 100)) * (deal.discountedPrice / 10);
        tableHTML += `
            <tr>
                <td>${deal.title.substring(0, 40)}</td>
                <td><strong>${deal.platform.toUpperCase()}</strong></td>
                <td>${deal.clicks}</td>
                <td>${deal.commissionRate}%</td>
                <td>$${earning.toFixed(2)}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    performanceTable.innerHTML = tableHTML;
}

// Scroll helper
function scrollTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize on page load
window.addEventListener('load', function() {
    displayDeals();
    updateDashboard();
});

// Auto-save to localStorage periodically
setInterval(() => {
    localStorage.setItem('deals', JSON.stringify(deals));
}, 10000);
