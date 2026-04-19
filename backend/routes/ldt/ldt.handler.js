const ldtService = require("../../services/ldt/ldt.service");

const saveLdtResponseHandler = async (req, res) => {
  const { body } = req;
  
  try {
    const result = await ldtService.saveLdtResponse(body);

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

module.exports = { saveLdtResponseHandler };