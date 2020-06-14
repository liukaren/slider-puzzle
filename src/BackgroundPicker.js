import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import React from 'react';
import Button from './Button';
import Modal from './Modal';
import SearchInput from './SearchInput';
import styles from './BackgroundPicker.module.scss';

const GF = new GiphyFetch('wEjpTQrDHjj0hPtF6NUQFB26bcrn0byC');
const FETCH_LIMIT = 10;
const GIPHY_DEBOUNCE_MS = 500;

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
      const timer = setTimeout(
        () => searchRequest(searchTerm),
        GIPHY_DEBOUNCE_MS
      );
      setDebounceTimeout(timer);
    },
    [debounceTimer, searchRequest]
  );

  return (
    <Modal onClose={onClose}>
      <div className={styles.giphy}>
        <SearchInput onChange={onInputChange} />
        <div className={styles.giphyResults}>
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
        className={styles.giphyButton}
        onClick={() => setShowGiphy(!showGiphy)}>
        Giphy
      </Button>
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
