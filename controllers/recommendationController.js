const axios = require('axios');

// Hàm xử lý gọi API Python và trả kết quả
const getRecommendations = async (req, res) => {
    const { productId } = req.params;  // Lấy productId từ params
  
    try {
      // Gọi API Python để lấy sản phẩm gợi ý
      const response = await axios.get(`http://localhost:5000/get_recommendations?product_id=${id}`);
  
      // Trả về kết quả gợi ý cho frontend
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Lỗi khi lấy gợi ý sản phẩm.' });
    }
  };
  
module.exports = { getRecommendations };
