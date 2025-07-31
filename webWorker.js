self.onmessage = async (event) => {
    const { type, page } = event.data;

    if (type === 'FETCH_MOVIES') {
        try {
            const response = await fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
            const data = await response.json();

            self.postMessage({
                type: 'MOVIES_RESULT',
                items: data.items,
                totalPages: data.pagination.totalPages
            });
        } catch (error) {
            self.postMessage({
                type: 'MOVIES_ERROR',
                error: error.message
            });
        }
    }
};

