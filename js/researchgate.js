// ===== ResearchGate Interactive Features =====

document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeSearch();
  initializeTags();
  initializeDocuments();
  initializeSurveys();
  initializeDiscussions();
});

// ===== Navigation Interactions =====
function initializeNavigation() {
  const navItems = document.querySelectorAll('.rg-nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');
      
      // Optional: Log navigation for analytics
      const label = this.querySelector('.rg-nav-label').textContent;
      console.log('Navigating to:', label);
    });
  });
}

// ===== Search Functionality =====
function initializeSearch() {
  const searchInput = document.querySelector('.rg-search-input');
  let searchTimeout;
  
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      
      const query = e.target.value.trim();
      
      // Debounce search
      searchTimeout = setTimeout(() => {
        if (query.length > 0) {
          performSearch(query);
        }
      }, 500);
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query.length > 0) {
          performSearch(query);
        }
      }
    });
  }
}

function performSearch(query) {
  console.log('Searching for:', query);
  // Placeholder for actual search logic
  // This would typically call an API endpoint
  // For now, just log the search
}

// ===== Tag Filtering =====
function initializeTags() {
  const tags = document.querySelectorAll('.rg-tag');
  
  tags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      const tagText = this.textContent.trim();
      console.log('Filtering by tag:', tagText);
      
      // Add visual feedback
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 150);
      
      // Placeholder for actual filtering logic
      // This would filter documents by tag
    });
  });
}

// ===== Document Card Interactions =====
function initializeDocuments() {
  const documentCards = document.querySelectorAll('.rg-document-card');
  
  documentCards.forEach(card => {
    // Add click tracking
    card.addEventListener('click', function(e) {
      if (e.target.closest('.rg-tag-small')) {
        const tag = e.target.textContent.trim();
        console.log('Filter by tag:', tag);
        return;
      }
      
      const title = this.querySelector('.rg-document-title').textContent;
      console.log('Opening document:', title);
      // Placeholder for opening document detail view
    });
    
    // Bookmark functionality
    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'rg-bookmark-btn';
    bookmarkBtn.innerHTML = '🔖';
    bookmarkBtn.title = 'Save this paper';
    bookmarkBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--clr-primary);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 1.2rem;
      opacity: 0;
      transition: opacity 0.2s;
    `;
    
    card.addEventListener('mouseenter', () => {
      if (!card.style.position) card.style.position = 'relative';
      bookmarkBtn.style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', () => {
      bookmarkBtn.style.opacity = '0';
    });
  });
}

// ===== Survey Interactions =====
function initializeSurveys() {
  const surveyBtns = document.querySelectorAll('.rg-survey-btn');
  
  surveyBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const surveyTitle = this.closest('.rg-survey-item').querySelector('h4').textContent;
      console.log('Opening survey:', surveyTitle);
      
      // Visual feedback
      const originalText = this.textContent;
      this.textContent = '✓ Đang tham gia...';
      this.disabled = true;
      
      setTimeout(() => {
        this.textContent = originalText;
        this.disabled = false;
      }, 2000);
    });
  });
}

// ===== Discussion Item Interactions =====
function initializeDiscussions() {
  const discussionItems = document.querySelectorAll('.rg-discussion-item');
  
  discussionItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      const title = this.querySelector('h4').textContent;
      console.log('Opening discussion:', title);
      // Placeholder for opening discussion thread
    });
  });
}

// ===== Smooth Scroll Behavior =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ===== Topic Card Stats Animation =====
function animateTopicStats() {
  const cards = document.querySelectorAll('.rg-topic-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => observer.observe(card));
}

// ===== Member Card Hover Effects =====
function enhanceMemberCards() {
  const memberCards = document.querySelectorAll('.rg-member-card');
  
  memberCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
      this.style.boxShadow = 'var(--shadow-md)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
}

// ===== Mentor Status Indicator =====
function updateMentorStatus() {
  const mentorItems = document.querySelectorAll('.rg-mentor-item');
  
  mentorItems.forEach(item => {
    const statusIndicator = item.querySelector('.rg-status-indicator');
    if (statusIndicator) {
      // Simulate real-time status updates
      setInterval(() => {
        // Placeholder for actual API call to check mentor status
        // For demo purposes, just keep the online status
      }, 30000); // Check every 30 seconds
    }
  });
}

// ===== Lazy Loading Documents =====
function initializeLazyLoading() {
  const images = document.querySelectorAll('.rg-document-thumbnail');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Placeholder for actual image loading
          observer.unobserve(entry.target);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

// ===== Premium CTA Button =====
function initializePremiumCTA() {
  const premiumBtn = document.querySelector('.rg-premium-btn');
  
  if (premiumBtn) {
    premiumBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Opening premium upgrade modal');
      // Placeholder for opening premium upgrade flow
    });
  }
}

// ===== Mentor Button =====
function initializeMentorBtn() {
  const mentorBtn = document.querySelector('.rg-mentor-btn');
  
  if (mentorBtn) {
    mentorBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Opening mentor matching page');
      // Placeholder for opening mentor matching
    });
  }
}

// ===== Initialize All Enhancements =====
function initializeAllEnhancements() {
  animateTopicStats();
  enhanceMemberCards();
  updateMentorStatus();
  initializeLazyLoading();
  initializePremiumCTA();
  initializeMentorBtn();
}

// Run enhancements when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAllEnhancements);
} else {
  initializeAllEnhancements();
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.querySelector('.rg-search-input');
    if (searchInput) searchInput.focus();
  }
  
  // Esc to blur search
  if (e.key === 'Escape') {
    const searchInput = document.querySelector('.rg-search-input');
    if (searchInput && document.activeElement === searchInput) {
      searchInput.blur();
    }
  }
});

// ===== Theme Support =====
function supportThemeToggle() {
  // Ensure ResearchGate styles work with existing theme system
  const updateRGTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    // Styles automatically apply via CSS variables
  };
  
  window.addEventListener('themechange', updateRGTheme);
  updateRGTheme();
}

supportThemeToggle();

// ===== Export for external use =====
window.ResearchGateUI = {
  performSearch,
  initializeNavigation,
  initializeDocuments,
  initializeSurveys,
  initializeDiscussions
};
