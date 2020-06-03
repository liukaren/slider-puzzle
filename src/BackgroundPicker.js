import React from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import Modal from './Modal';
import styles from './BackgroundPicker.module.scss';

const gf = new GiphyFetch('wEjpTQrDHjj0hPtF6NUQFB26bcrn0byC');

// configure your fetch: fetch 10 gifs at a time as the user scrolls (offset is handled by the grid)
const fetchGifs = offset => gf.trending({ offset, limit: 10 });

function GiphyBackgroundPicker({ setBackground, onClose }) {
  const selectGif = React.useCallback(
    (gif, e) => {
      e.preventDefault();
      setBackground(gif.images.downsized);
      onClose();
      console.log('clicked', gif);
    },
    [setBackground, onClose]
  );
  return (
    <Modal onClose={onClose}>
      <div className={styles.giphy}>
        <Grid
          width={400}
          columns={3}
          hideAttribution
          fetchGifs={fetchGifs}
          onGifClick={selectGif}
        />
      </div>
    </Modal>
  );
}

export default function ({ setBackground }) {
  const [showGiphy, setShowGiphy] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShowGiphy(!showGiphy)}>Giphy</button>
      {showGiphy && (
        <GiphyBackgroundPicker
          onClose={() => setShowGiphy(false)}
          setBackground={setBackground}
        />
      )}
    </div>
  );
}
