import { Grid } from '@giphy/react-components';
import cn from 'classnames';
import React from 'react';
import Button from './Button';
import { flickrApiCall } from './Flickr';
import GF from './Giphy';
import Modal from './Modal';
import SearchInput from './SearchInput';
import GiphyAttribution from './images/giphy-attribution.png';
import { ReactComponent as CloseIcon } from './images/times.svg';
import { useViewport, GUTTER_MD_PX, GUTTER_LG_PX } from './util';
import styles from './BackgroundPicker.module.scss';

const MAX_WIDTH_PX = 600;
const HEIGHT_PX = 600;
const FETCH_LIMIT = 21;

function FlickrBackgroundPicker({ setBackground, onClose }) {
  const [photos, setPhotos] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const onSelect = React.useCallback(
    photo => {
      setBackground({
        url: photo.url_z,
        width: photo.width_z,
        height: photo.height_z
      });
      onClose();
    },
    [setBackground, onClose]
  );

  // Initialize with "interesting" photos
  React.useEffect(() => {
    setLoading(true);
    flickrApiCall('flickr.interestingness.getList', {
      per_page: FETCH_LIMIT
    }).then(response => {
      setPhotos(response.photos.photo);
      setLoading(false);
    });
  }, []);

  const searchRequest = React.useCallback(async searchTerm => {
    if (!searchTerm) return;
    setLoading(true);
    flickrApiCall('flickr.photos.search', {
      per_page: FETCH_LIMIT,
      tags: searchTerm,
      sort: 'relevance',
      content_type: 1
    }).then(response => {
      setPhotos(response.photos.photo);
      setLoading(false);
    });
  }, []);

  const windowWidth = useViewport().width;
  const modalWidth = Math.min(MAX_WIDTH_PX, windowWidth);
  // If the modal fills the width, then also fill the height
  const modalHeight = windowWidth > MAX_WIDTH_PX ? HEIGHT_PX : '100vh';

  const imgSize = (modalWidth - GUTTER_LG_PX * 2 - GUTTER_MD_PX * 2) / 3; // 3 to a row
  const sizeStyle = { width: imgSize, height: imgSize };
  const placeholderEl = (
    <div className={styles.flickrPlaceholder} style={sizeStyle} />
  );

  return (
    <Modal onClose={onClose}>
      <div
        className={styles.modal}
        style={{ width: modalWidth, height: modalHeight }}>
        <div className={styles.header}>
          <SearchInput
            searchRequest={searchRequest}
            className={styles.search}
          />
          <CloseIcon onClick={onClose} className={styles.closeIcon} />
        </div>
        <div className={cn(styles.modalResults, styles.flickrResults)}>
          {/* Loading state */}
          {loading && (
            <>
              {placeholderEl}
              {placeholderEl}
              {placeholderEl}
              {placeholderEl}
              {placeholderEl}
              {placeholderEl}
            </>
          )}
          {/* Loaded state */}
          {!loading &&
            photos &&
            photos.length > 0 &&
            photos.map(photo => (
              <img
                alt={photo.title}
                className={styles.flickrResult}
                key={photo.id}
                onClick={() => onSelect(photo)}
                src={photo.url_q}
                style={sizeStyle}
              />
            ))}
          {/* Empty state */}
          {!loading && photos && photos.length === 0 && 'No results.'}
        </div>
      </div>
    </Modal>
  );
}

function GiphyBackgroundPicker({ setBackground, onClose }) {
  const [search, setSearch] = React.useState(null);
  const [showResults, setShowResults] = React.useState(true);

  const fetchGifs = React.useCallback(
    offset => {
      // Initialize with "trending" gifs
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

  const windowWidth = useViewport().width;
  const modalWidth = Math.min(MAX_WIDTH_PX, windowWidth);
  const gridWidth = Math.min(MAX_WIDTH_PX, windowWidth) - GUTTER_LG_PX * 2;
  // If the modal fills the width, then also fill the height
  const modalHeight = windowWidth > MAX_WIDTH_PX ? HEIGHT_PX : '100vh';

  return (
    <Modal onClose={onClose}>
      <div
        className={cn(styles.modal, styles.giphyModal)}
        style={{ width: modalWidth, height: modalHeight }}>
        <div className={styles.header}>
          <SearchInput
            searchRequest={searchRequest}
            className={styles.search}
          />
          <CloseIcon onClick={onClose} className={styles.closeIcon} />
        </div>
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
        <img
          alt="Powered by Giphy"
          src={GiphyAttribution}
          className={styles.giphyAttribution}
        />
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
        className={styles.uploadInput}
        ref={imageUpload}
        onChange={onUpload}
      />
      <label htmlFor="image-bg">
        <Button
          tabIndex={-1}
          className={cn(styles.uploadButton, buttonClassName)}>
          Upload
        </Button>
      </label>
    </>
  );
}
