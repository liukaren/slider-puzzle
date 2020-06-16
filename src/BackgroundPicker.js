import cn from 'classnames';
import { Grid } from '@giphy/react-components';
import React from 'react';
import Button from './Button';
import GF from './Giphy';
import Modal from './Modal';
import SearchInput from './SearchInput';
import { useViewport } from './util';
import styles from './BackgroundPicker.module.scss';

const DEBOUNCE_MS = 500;
const FETCH_LIMIT = 21;
const MAX_WIDTH_PX = 600;
const GUTTER_LG_PX = 32;

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

  const windowWidth = useViewport().width;
  const modalWidth = Math.min(MAX_WIDTH_PX, windowWidth);

  return (
    <Modal onClose={onClose}>
      <div className={styles.modal} style={{ width: modalWidth }}>
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

  const windowWidth = useViewport().width;
  const gridWidth = Math.min(MAX_WIDTH_PX, windowWidth) - GUTTER_LG_PX;

  return (
    <Modal onClose={onClose}>
      <div className={styles.modal}>
        <SearchInput onChange={onInputChange} />
        <div className={styles.modalResults}>
          {showResults && (
            <Grid
              width={gridWidth}
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

export default function ({ setBackground, buttonClassName }) {
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
        className={buttonClassName}
        onClick={() => setShowGiphy(!showGiphy)}>
        Giphy
      </Button>
      <Button
        className={buttonClassName}
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
      <label
        className={cn(styles.uploadLabel, buttonClassName)}
        htmlFor="image-bg">
        Upload
      </label>
    </>
  );
}
