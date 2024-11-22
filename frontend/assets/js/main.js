document.addEventListener('DOMContentLoaded', () => {
    initMasonry();
    loadImages();

    // 无限滚动
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            loadImages();
        }
    });

    // 分类切换
    document.querySelector('.categories').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('.categories button').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelector('.masonry-grid').innerHTML = '';
            page = 1;
            loadImages(e.target.dataset.category);
        }
    });
});
