import dotenv from 'dotenv'
import NacelleClient from '@nacelle/client-js-sdk'
import createCompatibilityConnector from '@nacelle/compatibility-connector';

dotenv.config()

const spaceID = process.env.NACELLE_SPACE_ID
const token = process.env.NACELLE_GRAPHQL_TOKEN
const endpoint = process.env.NACELLE_ENDPOINT

const warpToken = process.env.WARP_GRAPHQL_TOKEN
const warpEndpoint = process.env.WARP_ENDPOINT

const client = new NacelleClient({
  id: spaceID,
  token,
  nacelleEndpoint: endpoint,
  useStatic: false
})

// Initialize the Compatibility Connector
const compatibilityConnector = new createCompatibilityConnector({
  endpoint: warpEndpoint,
  token: warpToken,
  locale: 'en-US'
});

// Update SDK client with the Compatibility Connector
client.data.update({
  connector: compatibilityConnector
});

export default client
