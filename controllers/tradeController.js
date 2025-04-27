import * as tradeService from "../services/tradeService.js";

// create a new trade on each by or sell
export const createTrade = async (req, res, next) => {
  try {
    const method = req.query.method || "FIFO";
    const { trade, realizationResult } = await tradeService.createTrade(req.body, method);

    const response = {
      status: "success",
      data: { trade },
      message: "Trade created successfully",
    };

    // If it's a sell trade (negative quantity), include realization details
    if (realizationResult) {
      response.data.realization = realizationResult;
    }

    res.status(201).json(response);
  } catch (error) {
    next(error); // Forward error to error-handling middleware
  }
};

// get all the trades
export const getAllTrades = async (req, res, next) => {
  try {
    const trades = await tradeService.getAllTrades();

    res.json({
      status: "success",
      data: trades,
      message: "Trades retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get trade by id 
export const getTradeById = async (req, res, next) => {
  try {
    const trade = await tradeService.getTradeById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        status: "error",
        message: "Trade not found",
      });
    }

    res.json({
      status: "success",
      data: trade,
      message: "Trade retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// create bulk trade 
export const bulkCreateTrades = async (req, res, next) => {
  try {
    const { trades, method = "FIFO" } = req.body;

    // Validate if trades is an array
    if (!Array.isArray(trades)) {
      return res.status(400).json({
        status: "error",
        message: "Trades must be an array",
      });
    }

    const results = await tradeService.bulkCreateTrades(trades, method);

    res.json({
      status: "success",
      data: results,
      message: "Bulk trade operation completed",
    });
  } catch (error) {
    next(error);
  }
};
