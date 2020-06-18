import qs from 'querystring';

const REQUEST_PARAMS = {
  api_key: process.env.REACT_APP_FLICKR_API_KEY,
  format: 'json',
  nojsoncallback: 1,
  extras: ['url_z', 'url_q', 'o_dims'].join(',')
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
