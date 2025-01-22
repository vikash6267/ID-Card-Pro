const mongoose = require("mongoose");

// Schema for Counter
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the sequence (e.g., "studentName")
  sequence_value: { type: Number, default: 0 }, // Initial sequence value
});

// Model for Counter
const Counter = mongoose.model("Counter", CounterSchema);

// Function to get or create the next sequence value
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { name: sequenceName }, // Search for the sequence name
    { $inc: { sequence_value: 1 } }, // Increment the sequence value by 1
    { new: true, upsert: true } // Create the document if it doesn't exist
  );

  return sequenceDocument.sequence_value;
}

module.exports = getNextSequenceValue;
