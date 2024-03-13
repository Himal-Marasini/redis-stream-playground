const client = require("./redisConfig");

const streamName = "FishTransaction";

function structureResponse(temp) {
  const output = {};

  let totalSpent = 0;
  let totalWon = 0;

  for (let i = 0; i < temp.length; i++) {
    const item = temp[i];
    const { playerId, spent, won } = item;

    if (!output[playerId]) {
      totalSpent = parseFloat(spent);
      totalWon = parseFloat(won);

      output[playerId] = {
        spent: parseFloat(spent),
        won: parseFloat(won),
      };
    } else {
      totalSpent += parseFloat(spent);
      totalWon += parseFloat(won);

      output[playerId].spent += parseFloat(spent);
      output[playerId].won += parseFloat(won);
    }
  }

  console.log(totalSpent);
  console.log(totalWon);

  return output;
}

const createStream = async (payload) => {
  const queryArr = ["XADD", streamName, "*"];

  for (let key in payload) {
    const value = payload[key];
    queryArr.push(key.toString());
    queryArr.push(value.toString());
  }

  const response = await client.sendCommand(queryArr);
  return response;
};

const readStream = async () => {
  const queryArr = ["XREAD", "STREAMS", streamName, "0-0"];

  const deleteQueryArr = ["XDEL", streamName];

  const response = await client.sendCommand(queryArr);

  let temp = [];

  console.log(response);

  if (response !== null) {
    for (let i = 0; i < response.length; i++) {
      const element = response[i][1];
      for (let j = 0; j < element.length; j++) {
        const streamKey = element[j][0];
        const elem = element[j][1];
        deleteQueryArr.push(streamKey);
        let dict = {};
        if (element[j].length > 2) {
        }
        for (let k = 0; k < elem.length; k++) {
          const data = elem[k];
          if (k % 2 === 0) {
            dict[data] = elem[k + 1];
          }
        }
        temp.push(dict);
      }
    }

    const deleteResponse = await client.sendCommand(deleteQueryArr);

    const output = structureResponse(temp);
    return output;
  }

  return [];
};

const deleteStreamLength = async () => {
  const queryArr = [
    "XTRIM",
    "83b07393-8f26-4ddb-a168-542dd6ebf4e7",
    "MAXLEN",
    "~",
    "2",
  ];

  const response = await client.sendCommand(queryArr);

  console.log(response);
  return response;
};

const deleteStream = async () => {
  const queryArr = ["DEL", streamName];

  const response = await client.sendCommand(queryArr);
  console.log(response);
  return response;
};

const createGroupStream = async (groupId) => {
  const queryArr = ["XGROUP", "CREATE", streamName, groupId, "0"];

  const response = await client.sendCommand(queryArr);
  return response;
};

const readGroupStream = async (groupId) => {
  const queryArr = [
    "XREADGROUP",
    "GROUP",
    groupId,
    "f37c857b-4396-4453-827d-910059139265",
    "STREAMS",
    streamName,
    ">",
  ];

  const response = await client.sendCommand(queryArr);
  return response;
};

module.exports = {
  createStream,
  readStream,
  deleteStreamLength,
  createGroupStream,
  readGroupStream,
  deleteStream,
};

/*
 - Create a consumer group
        - XGROUP CREATE tickets boarding_officers $
 - Publish the data to stream
        - XADD tickets * name key1 "value1" key2 "value2"
 - To Read the elements from a stream
        - XREAD COUNT 10 BLOCK 3000 STREAM tickets 0[IDS from which the elements will be returned]
 - 

*/
