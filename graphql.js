const { ApolloServer, gql } = require('apollo-server-lambda');
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');
const { DynamoDBClient, ListTablesCommand, GetItemCommand, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");

var table = "Quote";

var id = "q1";

var params = {
    TableName: table,
    Key:{
        "id": id
    }
};



const callDynamoDB = async () => {
  console.log("calling dynamodb ");
  const client = new DynamoDBClient({ region: "us-east-1" });
  const command = new ListTablesCommand({});
  try {
    const results = await client.send(command);
    return results;
    console.log(results.TableNames.join("\n"));
  } catch (err) {
    console.error(err);
    return err;
  }
};

const getQuotes = async () => {
  const client = new DynamoDBClient({ region: "us-east-1" });
  const getParams = {
    TableName: "Quote",
    Key:{
      "id": "q1"
  }
  };
  const params = {
    TableName: "Quote"
  //  KeyConditionExpression: "id = :id",
  //  ExpressionAttributeValues: {
  //    ":id": "q1",
   // },
  };
  const command = new GetItemCommand(getParams);
  try {
    //const results = await client.send(command);
    const results = await client.send(new ScanCommand(params));
    console.log("RESULTS ", results);
    let arr = [];
    results.Items.forEach((item) => {
      arr.push(unmarshall(item));

    })
    console.log("arr ", arr);
    return arr;
 
  } catch (err) {
    console.error(err);
    return err;
  }


}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar JSON
  type Quote {
    id: ID!
    value: String
    source: String
  }
  type Query {
    hello: String
    all:JSON
    quotes: [Quote]
  }

`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => {
        console.log("HELLO");
        callDynamoDB();
        return 'Hello world!';
    },
    all: () => {
      console.log("JSON");
      
      return callDynamoDB();
  },
  quotes : () => {
    return getQuotes();
  }
  },
};


const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: {    endpoint: "/dev/graphql"  }});
  
const handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
exports.graphqlHandler = handler;
