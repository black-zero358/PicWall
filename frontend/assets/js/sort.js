let currentSort = 'time';
let currentCategory = 'all';

function initSort() {
    const sortSelect = document.getElementById('sortSelect');
    
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        resetAndReload();
    });
}

function resetAndReload() {
    // 清空现有内容
    document.querySelector('.masonry-grid').innerHTML = '';
    // 重置页码
    page = 1;
    // 重新加载图片
    loadImages(currentCategory, currentSort);
}

// 扩展loadImages函数的排序功能
function getSortParam(sort) {
    switch(sort) {
        case 'likes':
            return 'likes DESC';
        case 'time':
        default:
            return 'created_at DESC';
    }
}

// 监听分类变化
document.addEventListener('DOMContentLoaded', () => {
    initSort();

    // 更新分类切换事件
    document.querySelector('.categories').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentCategory = e.target.dataset.category;
            document.querySelectorAll('.categories button').forEach(btn => 
                btn.classList.remove('active'));
            e.target.classList.add('active');
            resetAndReload();
        }
    });
});

// 导出排序相关信息供其他模块使用
window.sortUtils = {
    getCurrentSort: () => currentSort,
    getCurrentCategory: () => currentCategory,
    getSortParam
};
