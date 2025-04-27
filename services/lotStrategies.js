import Lot from "../models/Lot.js";

// Fetch all open lots (OPEN or PARTIALLY_REALIZED) for a given stock and method (FIFO/LIFO)
const getOpenLots = async (stockName, method, sortCriteria) => {
  return Lot.find({
    stock_name: stockName,
    method,
    lot_status: { $in: ["OPEN", "PARTIALLY_REALIZED"] },
  }).sort(sortCriteria);
};

// Realize lots for a sell trade, based on FIFO or LIFO method
const realizeLots = async (sellTrade, method, sortCriteria) => {
  const sellQuantity = Math.abs(sellTrade.quantity); // Convert the sell quantity to positive (since it's negative in a sell trade)
  let remainingSellQuantity = sellQuantity; // Track remaining quantity to sell
  const stockName = sellTrade.stock_name; // Get the stock name from the trade

  // Fetch all open lots for the stock based on the FIFO/LIFO method and sorting criteria
  const openLots = await getOpenLots(stockName, method, sortCriteria);

  if (openLots.length === 0) {
    // If no open lots found for the stock, throw an error
    throw new Error(`No open lots found for stock: ${stockName}`);
  }

  // Calculate total available quantity from open lots by summing up the remaining quantity in each lot
  const totalAvailable = openLots.reduce(
    (sum, lot) => sum + (lot.lot_quantity - lot.realized_quantity),
    0
  );

  // If not enough shares are available to sell, throw an error
  if (totalAvailable < sellQuantity) {
    throw new Error(
      `Not enough shares to sell. Requested: ${sellQuantity}, Available: ${totalAvailable}`
    );
  }

  const updatedLots = []; // Array to track updated lots during realization

  // Start realizing lots based on the FIFO or LIFO method
  for (const lot of openLots) {
    if (remainingSellQuantity <= 0) break; // Stop if there is no remaining quantity to sell

    const availableQuantity = lot.lot_quantity - lot.realized_quantity; // Remaining available quantity in the lot
    const realizedQuantity = Math.min(availableQuantity, remainingSellQuantity); // Realize the lesser of available or remaining quantity

    lot.realized_quantity += realizedQuantity; // Update the realized quantity of the lot
    lot.realized_trade_id.push(sellTrade._id); // Link the realized trade to the lot

    // Update lot status based on realized quantity
    lot.lot_status =
      lot.realized_quantity === lot.lot_quantity
        ? "FULLY_REALIZED" // If all quantity is realized
        : lot.realized_quantity > 0
        ? "PARTIALLY_REALIZED" // If some quantity is realized
        : "OPEN"; // If no quantity is realized

    await lot.save(); // Save the updated lot
    updatedLots.push(lot); // Add the updated lot to the result list

    remainingSellQuantity -= realizedQuantity; // Decrease the remaining sell quantity
  }

  // After realization, recalculate the remaining quantity in open lots
  const openLotsAfterSell = await getOpenLots(stockName, method, sortCriteria);

  const remainingQuantity = openLotsAfterSell.reduce(
    (sum, lot) => sum + (lot.lot_quantity - lot.realized_quantity),
    0
  );

  // Return the result with sold quantity, remaining quantity, and the updated lots
  return {
    soldQuantity: sellQuantity,
    remainingQuantity,
    updatedLots,
  };
};

// Realize lots using FIFO (First-In-First-Out)
export const realizeLotsFIFO = async (sellTrade) => {
  return realizeLots(sellTrade, "FIFO", { createdAt: 1 }); // Use FIFO, sort by createdAt ascending (oldest lots first)
};

// Realize lots using LIFO (Last-In-First-Out)
export const realizeLotsLIFO = async (sellTrade) => {
  return realizeLots(sellTrade, "LIFO", { createdAt: -1 }); // Use LIFO, sort by createdAt descending (newest lots first)
};
