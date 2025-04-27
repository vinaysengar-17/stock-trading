import Lot from "../models/Lot.js";

// get All Lots
export const getAllLots = async (req, res, next) => {
  try {
    const { stock_name, method = "FIFO" } = req.query;
    const query = {};

    // If stock_name is provided, add it to the query
    if (stock_name) {
      query.stock_name = stock_name;
    }
    // Method is always required (FIFO or LIFO)
    query.method = method;

    // Find lots based on query and sort by createdAt
    // FIFO: oldest lot first, LIFO: newest lot first
    const lots = await Lot.find(query).sort({
      createdAt: method === "FIFO" ? 1 : -1,
    });

    res.json({
      status: "success",
      data: lots,
      message: "Lots retrieved successfully",
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

// get lot by id 
export const getLotById = async (req, res, next) => {
  try {
    // Find the lot by MongoDB ObjectId
    const lot = await Lot.findById(req.params.id);

    // If lot not found, send 404 response
    if (!lot) {
      return res.status(404).json({
        status: "error",
        message: "Lot not found",
      });
    }

    res.json({
      status: "success",
      data: lot,
      message: "Lot retrieved successfully",
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};
