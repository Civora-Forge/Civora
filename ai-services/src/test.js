const { enrichIssue } = require("./enrichIssue");

// Quick smoke test for the enrichment stub
async function test() {
  const rawIssue = {
    text: "Road is damaged near the bus stop",
    language: "en",
    photoUrl: "",
    audioUrl: "",
    latitude: 8.5241,
    longitude: 76.9366,
    createdAt: "2026-07-06T12:00:00Z",
    categoryHint: "roads",
  };

  const result = await enrichIssue(rawIssue);
  console.log("enrichIssue result:", JSON.stringify(result, null, 2));
}

test();
