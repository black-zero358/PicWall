let masonry;
let loading = false;
let page = 1;

function initMasonry() {
    const grid = document.querySelector('.masonry-grid');
    const isMobile = window.innerWidth <= 768;
    
    masonry = new Masonry(grid, {
        itemSelector: '.grid-item',
        columnWidth: '.grid-item',
        gutter: isMobile ? 8 : 10,
        percentPosition: true,
        transitionDuration: 0,
        fitWidth: true
    });
}

// 优化resize事件处理
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (masonry) {
            // 重新计算所有图片的高度约束
            const screenHeight = window.innerHeight;
            const maxHeight = Math.floor(screenHeight * 0.6);
            const minHeight = Math.floor(screenHeight * 0.2);
            
            document.querySelectorAll('.grid-item img').forEach(img => {
                img.style.maxHeight = `${maxHeight}px`;
                img.style.minHeight = `${minHeight}px`;
                // 检查实际高度是否小于最小高度
                if (img.naturalHeight < minHeight) {
                    img.style.minHeight = 'auto';
                }
            });
            
            masonry.destroy();
            initMasonry();
        }
    }, 250);
});

function createImageElement(image) {
    const item = document.createElement('div');
    item.className = 'grid-item';
    
    const img = document.createElement('img');
    img.src = image.path;
    img.alt = image.filename;
    
    // 计算合适的图片高度
    const screenHeight = window.innerHeight;
    const maxHeight = Math.floor(screenHeight * 0.6); // 图片最大高度为屏幕高度的60%
    const minHeight = Math.floor(screenHeight * 0.2); // 最小高度为屏幕高度的20%
    
    // 设置图片的最大和最小高度约束
    img.style.maxHeight = `${maxHeight}px`;
    img.style.minHeight = `${minHeight}px`;
    img.style.objectFit = 'cover'; // 确保图片填充满容器
    
    // 增强错误处理的日志信息
    img.onerror = () => {
        console.error('图片加载失败:', {
            originalPath: image.path,
            processedPath: img.src,
            imageData: image,
            baseUrl: window.location.origin
        });
        item.remove();
        masonry.layout();
    };
    
    img.onload = () => {
        // 图片加载完成后，如果实际高度小于最小高度，则移除最小高度限制
        if (img.naturalHeight < minHeight) {
            img.style.minHeight = 'auto';
        }
        masonry.layout();
    };

    // 添加图片点击事件
    item.addEventListener('click', () => {
        console.log('点击图片:', image);
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        const likeCount = document.getElementById('likeCount');
        const likeBtn = document.getElementById('likeBtn');
        
        // 模态框图片路径也使用相同的处理逻辑
        modalImg.src = image.path;
        likeCount.textContent = image.likes;
        currentImageId = image.id; // 设置当前图片ID用于评论功能
        modal.style.display = 'block';

        // 检查点赞功能
        if (typeof window.likeUtils !== 'object' || typeof window.handleLike !== 'function') {
            console.error('点赞功能未正确初始化:', {
                likeUtils: typeof window.likeUtils,
                handleLike: typeof window.handleLike
            });
            return;
        }

        // 设置点赞按钮状态
        console.log('设置点赞按钮状态');
        try {
            const canLike = window.likeUtils.canLike(image.id);
            likeBtn.disabled = !canLike;
            likeBtn.style.opacity = canLike ? '1' : '0.5';
            
            // 绑定点赞事件
            likeBtn.onclick = async (event) => {
                event.stopPropagation();
                console.log('点击点赞按钮');
                const success = await window.handleLike(image.id);
                if (success) {
                    // 更新当前显示的点赞数
                    try {
                        const response = await fetch(`/api/images/${image.id}`);
                        if (!response.ok) throw new Error('获取图片信息失败');
                        const updatedImage = await response.json();
                        
                        if (updatedImage && updatedImage.likes !== undefined) {
                            image.likes = updatedImage.likes;
                            likeCount.textContent = updatedImage.likes;
                            // 更新缩略图中的点赞数
                            item.querySelector('.likes').textContent = `❤ ${updatedImage.likes}`;
                            
                            // 禁用点赞按钮
                            likeBtn.disabled = true;
                            likeBtn.style.opacity = '0.5';
                        }
                    } catch (error) {
                        console.error('更新点赞数失败:', error);
                    }
                }
            };
        } catch (error) {
            console.error('设置点赞状态失败:', error);
        }
        
        // 加载评论
        if (window.loadComments) {
            loadComments(image.id);
        }
    });

    item.appendChild(img);

    // 添加图片信息
    const info = document.createElement('div');
    info.className = 'image-info';
    info.innerHTML = `
        <span class="category">${image.category}</span>
        <span class="likes">❤ ${image.likes}</span>
    `;
    item.appendChild(info);

    return item;
}

async function loadImages(category = 'all', sort = 'time') {
    if (loading) return;
    loading = true;
    
    try {
        const response = await fetch(`/api/images?page=${page}&category=${category}&sort=${sort}`);
        const images = await response.json();
        
        if (images.length === 0) {
            document.getElementById('loading').style.display = 'none';
            return;
        }

        const fragment = document.createDocumentFragment();
        images.forEach(image => {
            const item = createImageElement(image);
            fragment.appendChild(item);
        });

        document.querySelector('.masonry-grid').appendChild(fragment);
        masonry.reloadItems();
        masonry.layout();
        
        page++;
    } catch (error) {
        console.error('加载图片失败:', error);
    } finally {
        loading = false;
    }
}

// 添加关闭模态框功能
document.querySelector('.modal .close').addEventListener('click', () => {
    document.getElementById('imageModal').style.display = 'none';
});