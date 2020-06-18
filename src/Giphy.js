import { GiphyFetch } from '@giphy/js-fetch-api';
const GF = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);
export default GF;
