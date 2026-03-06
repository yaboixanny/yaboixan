document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(22, 78, 99, 0.95)';
            nav.style.padding = '1rem 5%';
            nav.querySelectorAll('.nav-links a, .logo').forEach(el => {
                el.style.color = '#F5E6D3';
            });
        } else {
            nav.style.background = 'rgba(245, 230, 211, 0.8)';
            nav.style.padding = '1.5rem 5%';
            nav.querySelectorAll('.nav-links a').forEach(el => {
                el.style.color = '#262220';
            });
            nav.querySelector('.logo').style.color = '#164E63';
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    async function fetchPosts() {
        const grid = document.getElementById('blogGrid');
        if (!grid) return;

        try {
            let response = await fetch(`/api/posts?t=${Date.now()}`);
            if (!response.ok) {
                // Fallback to static JSON file if API is not available (e.g., on live static host)
                response = await fetch(`/posts.json?t=${Date.now()}`);
            }
            if (!response.ok) throw new Error('Failed to fetch posts');

            const posts = await response.json();

            grid.innerHTML = posts.map(post => {
                const link = `/${post.slug}/`;
                return `
                    <article class="post-card">
                        <a href="${link}"><img src="${post.image}" alt="${post.title}" class="post-image"></a>
                        <div class="post-content">
                            <span class="post-meta">${post.category}</span>
                            <h3><a href="${link}" style="text-decoration: none; color: inherit;">${post.title}</a></h3>
                            <p class="post-excerpt">${post.excerpt}</p>
                            <a href="${link}" class="read-more">Read Story</a>
                        </div>
                    </article>
                `;
            }).join('');
        } catch (err) {
            console.error('Error fetching posts:', err);
            grid.innerHTML = '<p>Failed to load stories.</p>';
        }
    }

    fetchPosts();
});
