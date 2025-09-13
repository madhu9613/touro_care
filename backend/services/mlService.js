const axios = require('axios');

exports.analyzeSequence = async (touristId, seq) => {
  try {
    const latitudes = seq.map(d => d.lat);
    const longitudes = seq.map(d => d.lon);
    const timestamps = seq.map(d => Math.floor(new Date(d.ts).getTime() / 1000)); 

    const res = await axios.post('http://localhost:8080/predict/anomaly', {
      latitudes,
      longitudes,
      timestamps
    });


    const { anomaly_score, sequence_length } = res.data;

    return {
      anomaly: anomaly_score > 0.65, 
      score: anomaly_score,
      length: sequence_length,
      explanation: anomaly_score > 0.65 
        ? "Detected unusual movement pattern"
        : "Normal behavior"
    };
  } catch (err) {
    console.error("ML service call failed:", err.message);
    throw new Error("ML service unavailable");
  }
};