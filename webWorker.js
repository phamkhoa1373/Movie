

self.onmessage = async (event) => {
    const { type, page } = event.data;

    if (type === 'FETCH_MOVIES') {
        try {
            const response = await fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
            const data = await response.json();

            // Gửi danh sách về main thread để hiển thị
            self.postMessage({
                type: 'MOVIES_RESULT',
                items: data.items,
                totalPages: data.pagination.totalPages
            });

            // 🔽 Chỉ fetch detail, KHÔNG cache
            for (const item of data.items) {
                const detailUrl = `https://ophim1.com/phim/${item.slug}`;
                try {
                    await fetch(detailUrl, {
                        headers: {
                            'x-from-webworker': 'true'
                        }
                    });
                } catch (err) {
                    // im lặng không log nếu bạn không muốn
                }
            }

        } catch (error) {
            self.postMessage({
                type: 'MOVIES_ERROR',
                error: error.message
            });
        }
    }
};
