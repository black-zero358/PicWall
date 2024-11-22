let currentImageId = null;

async function handleLike(imageId) {
    try {
        const response = await fetch(`/api/images/${imageId}/like`, {
            method: 'PUT'
        });
        const data = await response.json();
        document.getElementById('likeCount').textContent = data.likes;
    } catch (error) {
        console.error('点赞失败:', error);
    }
}

async function loadComments(imageId) {
    try {
        const response = await fetch(`/api/comments/${imageId}`);
        const comments = await response.json();
        
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <p>${comment.content}</p>
                <small>${new Date(comment.created_at).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

// 添加 likeUtils 并赋值到 window
const likeUtils = {
    canLike: function(imageId) {
        // 实现用户是否可以点赞的逻辑，暂时允许每次点击
        return true;
    }
};

window.likeUtils = likeUtils;

// 将 handleLike 和 loadComments 赋值到 window
window.handleLike = handleLike;
window.loadComments = loadComments;

document.getElementById('submitComment').addEventListener('click', async () => {
    const content = document.getElementById('commentText').value.trim();
    if (!content || !currentImageId) return;

    try {
        await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_id: currentImageId,
                content
            })
        });
        document.getElementById('commentText').value = '';
        loadComments(currentImageId);
    } catch (error) {
        console.error('提交评论失败:', error);
    }
});
