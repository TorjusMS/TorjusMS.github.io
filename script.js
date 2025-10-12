document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.references-track');
    let isDown = false;
    let isHovered = false;
    let startX;
    let startScrollX;
    let animationId;
    const scrollSpeed = 0.5;

    // Clone items once for seamless loop
    const originalItems = Array.from(track.children);
    originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
        
        // Add hover listeners to both original and clone
        [item, clone].forEach(element => {
            element.addEventListener('mouseenter', () => {
                isHovered = true;
            });
            element.addEventListener('mouseleave', () => {
                isHovered = false;
            });
        });
    });

    // Automatic smooth scroll function
    function autoScroll() {
        if (!isDown && !isHovered) {
            const currentTransform = getComputedStyle(track).transform;
            const matrix = new DOMMatrix(currentTransform);
            let currentX = matrix.m41;
            
            // Calculate the width of one set of items
            const firstSetWidth = originalItems.reduce((sum, item) => 
                sum + item.offsetWidth + 48, 0); // 48px is the gap

            currentX -= scrollSpeed;

            // If we've scrolled past one set width, reset to create seamless loop
            if (Math.abs(currentX) >= firstSetWidth) {
                currentX += firstSetWidth;
            }

            track.style.transform = `translateX(${currentX}px)`;
        }
        animationId = requestAnimationFrame(autoScroll);
    }

    // Start auto-scrolling
    autoScroll();

    // Mouse event handlers
    track.addEventListener('mousedown', e => {
        isDown = true;
        track.style.cursor = 'grabbing';
        startX = e.pageX;
        startScrollX = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
        cancelAnimationFrame(animationId); // Stop auto-scroll while dragging
    });

    track.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX;
        const walk = x - startX;
        let newX = startScrollX + walk;

        // Calculate the width of one set of items
        const firstSetWidth = Array.from(track.children)
            .slice(0, track.children.length / 2)
            .reduce((sum, item) => sum + item.offsetWidth + 48, 0);

        // Ensure seamless looping during drag
        if (Math.abs(newX) >= firstSetWidth) {
            startScrollX += (newX < 0 ? firstSetWidth : -firstSetWidth);
            startX = e.pageX;
            newX = startScrollX;
        }

        track.style.transform = `translateX(${newX}px)`;
    });

    function resetDrag() {
        if (isDown) {
            isDown = false;
            track.style.cursor = 'grab';
            // Restart auto-scroll
            autoScroll();
        }
    }

    track.addEventListener('mouseup', resetDrag);
    track.addEventListener('mouseleave', resetDrag);

    // Touch event handlers
    track.addEventListener('touchstart', e => {
        isDown = true;
        startX = e.touches[0].pageX;
        startScrollX = parseFloat(getComputedStyle(track).transform.split(',')[4]) || 0;
        cancelAnimationFrame(animationId);
    });

    track.addEventListener('touchmove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].pageX;
        const walk = x - startX;
        let newX = startScrollX + walk;

        // Calculate the width of one set of items
        const firstSetWidth = Array.from(track.children)
            .slice(0, track.children.length / 2)
            .reduce((sum, item) => sum + item.offsetWidth + 48, 0);

        // Ensure seamless looping during drag
        if (Math.abs(newX) >= firstSetWidth) {
            startScrollX += (newX < 0 ? firstSetWidth : -firstSetWidth);
            startX = e.touches[0].pageX;
            newX = startScrollX;
        }

        track.style.transform = `translateX(${newX}px)`;
    });

    track.addEventListener('touchend', resetDrag);
});