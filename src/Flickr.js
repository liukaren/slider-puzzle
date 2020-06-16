import qs from 'querystring';

const FLICKR_API_KEY = 'b90b439c52b6d6cc8da48b1a4eddff42';
const REQUEST_PARAMS = {
  api_key: FLICKR_API_KEY,
  format: 'json',
  nojsoncallback: 1,
  extras: ['url_m', 'url_m', 'o_dims'].join(',')
};

export async function flickrApiCall(method, params) {
  const response = await fetch(
    `https://www.flickr.com/services/rest/?` +
      qs.stringify({
        ...REQUEST_PARAMS,
        method,
        ...params
      })
  );
  return response.json();
}
