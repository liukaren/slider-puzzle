import cn from 'classnames';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import React from 'react';
import Button from './Button';
import Modal from './Modal';
import SearchInput from './SearchInput';
import styles from './BackgroundPicker.module.scss';

const DEBOUNCE_MS = 500;
const FETCH_LIMIT = 21;

const GF = new GiphyFetch('wEjpTQrDHjj0hPtF6NUQFB26bcrn0byC');
const FLICKR_API_KEY = 'b90b439c52b6d6cc8da48b1a4eddff42';

function FlickrBackgroundPicker({ setBackground, onClose }) {
  const [debounceTimer, setDebounceTimeout] = React.useState(null);
  const [photos, setPhotos] = React.useState(null);

  const onSelect = React.useCallback(
    photo => {
      setBackground({
        url: photo.url_m,
        width: photo.width_m,
        height: photo.height_m
      });
      onClose();
    },
    [setBackground, onClose]
  );

  React.useEffect(() => {
    async function fetchPopular() {
      const response = await fetch(
        `https://www.flickr.com/services/rest/` +
          `?api_key=${FLICKR_API_KEY}` +
          `&format=json` +
          `&nojsoncallback=1` +
          `&per_page=${FETCH_LIMIT}` +
          `&extras=url_m,url_m,o_dims` +
          `&method=flickr.interestingness.getList`
      );
      const jsonResponse = await response.json();
      if (!photos) setPhotos(jsonResponse.photos.photo);
    }
    if (!photos) fetchPopular();
  }, [photos]);

  const searchRequest = React.useCallback(async searchTerm => {
    const response = await fetch(
      `https://www.flickr.com/services/rest/` +
        `?api_key=${FLICKR_API_KEY}` +
        `&format=json` +
        `&nojsoncallback=1` +
        `&per_page=${FETCH_LIMIT}` +
        `&extras=url_m,url_m,o_dims` +
        `&method=flickr.photos.search` +
        `&tags=${searchTerm}` +
        `&sort=relevance` +
        `&content_type=1`
    );
    const jsonResponse = await response.json();
    setPhotos(jsonResponse.photos.photo);
  }, []);

  const onInputChange = React.useCallback(
    e => {
      const searchTerm = e.target.value;
      clearTimeout(debounceTimer);
      const timer = setTimeout(() => searchRequest(searchTerm), DEBOUNCE_MS);
      setDebounceTimeout(timer);
    },
    [debounceTimer, searchRequest]
  );

  return (
    <Modal onClose={onClose}>
      <div className={styles.modal}>
        <SearchInput onChange={onInputChange} />
        <div className={cn(styles.modalResults, styles.flickrResults)}>
          {photos &&
            photos.map(photo => (
              <img
                alt={photo.title}
                className={styles.flickrResult}
                key={photo.id}
                onClick={() => onSelect(photo)}
                src={photo.url_m}
              />
            ))}
        </div>
      </div>
    </Modal>
  );
}

function GiphyBackgroundPicker({ setBackground, onClose }) {
  const [search, setSearch] = React.useState(null);
  const [showResults, setShowResults] = React.useState(true);
  const [debounceTimer, setDebounceTimeout] = React.useState(null);

  const fetchGifs = React.useCallback(
    offset => {
      if (!search) return GF.trending({ offset, limit: FETCH_LIMIT });
      return GF.search(search, { sort: 'relevant', limit: FETCH_LIMIT });
    },
    [search]
  );

  const selectGif = React.useCallback(
    (gif, e) => {
      e.preventDefault();
      setBackground(gif.images.downsized);
      onClose();
    },
    [setBackground, onClose]
  );

  const searchRequest = React.useCallback(searchTerm => {
    setSearch(searchTerm);

    // NOTE: This is a hack to force giphy Grid to discard cache and re-render
    setShowResults(false);
    setTimeout(() => setShowResults(true), 1);
  }, []);

  const onInputChange = React.useCallback(
    e => {
      const searchTerm = e.target.value;
      clearTimeout(debounceTimer);
      const timer = setTimeout(() => searchRequest(searchTerm), DEBOUNCE_MS);
      setDebounceTimeout(timer);
    },
    [debounceTimer, searchRequest]
  );

  return (
    <Modal onClose={onClose}>
      <div className={styles.modal}>
        <SearchInput onChange={onInputChange} />
        <div className={styles.modalResults}>
          {showResults && (
            <Grid
              width={400}
              columns={3}
              hideAttribution
              fetchGifs={fetchGifs}
              onGifClick={selectGif}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function ({ setBackground }) {
  const [showGiphy, setShowGiphy] = React.useState(false);
  const [showFlickr, setShowFlickr] = React.useState(false);
  const imageUpload = React.useRef();

  const onUpload = React.useCallback(
    e => {
      e.preventDefault();
      const files = imageUpload.current.files;
      if (FileReader && files && files.length) {
        const fr = new FileReader();
        fr.onload = function () {
          const img = new Image();
          img.src = fr.result;
          img.onload = function () {
            setBackground({
              url: fr.result,
              width: this.width,
              height: this.height
            });
          };
        };
        fr.readAsDataURL(files[0]);
      }
    },
    [setBackground]
  );

  return (
    <>
      <Button
        className={styles.button}
        onClick={() => setShowGiphy(!showGiphy)}>
        Giphy
      </Button>
      <Button
        className={styles.button}
        onClick={() => setShowFlickr(!showFlickr)}>
        Flickr
      </Button>
      {showFlickr && (
        <FlickrBackgroundPicker
          onClose={() => setShowFlickr(false)}
          setBackground={setBackground}
        />
      )}
      {showGiphy && (
        <GiphyBackgroundPicker
          onClose={() => setShowGiphy(false)}
          setBackground={setBackground}
        />
      )}
      <input
        type="file"
        id="image-bg"
        name="image-bg"
        className={styles.uploadInput}
        ref={imageUpload}
        onChange={onUpload}
      />
      <label className={styles.uploadLabel} htmlFor="image-bg">
        Choose file
      </label>
    </>
  );
}
