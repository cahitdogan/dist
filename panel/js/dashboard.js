async function loadDashboardStats() {
    try {
        const articles = await api.getAllArticles();

        // Calculate statistics
        const totalArticles = articles.length;
        const publishedArticles = articles.filter(a => a.status === 'published').length;
        const draftArticles = articles.filter(a => a.status === 'draft').length;
        const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

        // Update DOM elements
        document.getElementById('total-articles').textContent = totalArticles;
        document.getElementById('published-articles').textContent = publishedArticles;
        document.getElementById('draft-articles').textContent = draftArticles;
        document.getElementById('total-views').textContent = totalViews.toLocaleString();

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);

        // Show error in stats
        ['total-articles', 'published-articles', 'draft-articles', 'total-views'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = 'Error';
                element.style.color = '#dc3545';
            }
        });
    }
}

// Load stats on page load
loadDashboardStats();
