const lextaleService = require("../../services/lextale/lextale.service");

const saveLextaleResponseHandler = async (req, res) => {
  const { body } = req;
  
  try {
    const result = await lextaleService.saveLextaleResponse(body);

    res.status(200).json({
      message: "Success",
      data: result
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

module.exports = { saveLextaleResponseHandler };