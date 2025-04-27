import Lot from "../models/Lot.js";
import Trade from "../models/Trade.js";
import { realizeLotsFIFO, realizeLotsLIFO } from "./lotStrategies.js";

// Create a single trade
export const createTrade = async (tradeData, method = "FIFO") => {
  try {
    // Create a new trade document with the provided data
    const trade = new Trade(tradeData);
    await trade.save(); // Save the trade to the database

    let realizationResult = null; // Variable to store lot realization result

    // If the trade is a sell (negative quantity), realize lots using FIFO or LIFO
    if (trade.quantity < 0) {
      const realizeLots = method === "FIFO" ? realizeLotsFIFO : realizeLotsLIFO;
      // Perform lot realization based on the selected method
      realizationResult = await realizeLots(trade);
    } else {
      // If the trade is a buy (positive quantity), create a new lot for the stock
      await Lot.create({
        trade_id: trade._id,       // Associate the lot with the trade
        stock_name: trade.stock_name, // Stock name
        lot_quantity: trade.quantity, // Quantity of the stock in the lot
        price: trade.price,         // Price at which the stock was bought
        method,                     // FIFO or LIFO method used for lot realization
      });
    }

    // Return the created trade and any lot realization result (if applicable)
    return {
      trade,
      realizationResult,
    };
  } catch (error) {
    // If any error occurs during the creation process, throw the error
    throw error;
  }
};

// Get all trades, sorted by timestamp in descending order (most recent first)
export const getAllTrades = async () => {
  return await Trade.find({}).sort({ timestamp: -1 });
};

// Get a single trade by its ID
export const getTradeById = async (id) => {
  return Trade.findById(id);
};

// Bulk create multiple trades and handle errors for each trade
export const bulkCreateTrades = async (tradesData, method = "FIFO") => {
  const results = []; // Array to store the results of each trade creation attempt

  // Iterate over each trade data and attempt to create it
  for (const tradeData of tradesData) {
    try {
      // Attempt to create the trade and handle lot realization if necessary
      const trade = await createTrade(tradeData, method);
      results.push({ success: true, trade });
    } catch (error) {
      // If an error occurs during trade creation, log the error message
      results.push({ success: false, error: error.message });
    }
  }

  // Return the array of results for all trade creation attempts
  return results;
};
